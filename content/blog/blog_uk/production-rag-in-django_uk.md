---
title: "RAG у продакшені на Django: чанкінг, ембедінги та семантичний пошук за межами туторіалу"
date: "2026-02-28"
excerpt: "Більшість RAG-туторіалів закінчуються на 'вставте документ у vector DB'. Наш починається там — ось як виглядає побудова продакшн RAG-пайплайну в Django."
---

## За межами туторіалу

Кожен RAG-туторіал слідує одному сценарію: завантажити PDF, розбити на чанки, зробити ембедінги, зберегти у векторну базу, запитати. Готово.

Потім намагаєшся побудувати щось реальне, і починаються питання:

- Який розмір чанка реально працює?
- Як обробляти документи з п'яти різних джерел?
- Що відбувається, коли документ оновлюється?
- Як зробити результати пошуку дійсно релевантними?
- Як запускати це без блокування веб-сервера?

Ми побудували продакшн RAG-систему всередині Django-додатку. Вона інгестить документи з Confluence, трекера задач, Google Sheets, Google Docs і ручних завантажень. Вона обслуговує семантичний пошук по 500+ документах. Ось що ми дізналися.

## Модель даних

Два Django-моделі несуть пайплайн:

```python
class Document(models.Model):
    title = models.CharField(max_length=255)
    source_type = models.CharField(max_length=50)  # confluence, youtrack, google_sheets...
    source_url = models.URLField(blank=True)
    page_id = models.CharField(max_length=50, null=True)  # ID зовнішньої системи
    processed = models.BooleanField(default=False)
    projects = models.ManyToManyField(SoftwareProject, blank=True)
    categories = models.ManyToManyField(Category, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    metadata = models.JSONField(default=dict)

class Chunk(models.Model):
    document = models.ForeignKey(Document, related_name="related_chunks", on_delete=models.CASCADE)
    order = models.PositiveIntegerField()
    content = models.TextField(max_length=1024)
    status = models.CharField(choices=Status.choices, default=Status.PENDING)
    error_message = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ("document", "order")
```

Документи зберігають метадані та зв'язки. Чанки зберігають фактичний текст, який отримує ембедінг. Поле `status` на Chunk — критичне, воно керує асинхронним пайплайном ембедінгу.

## Чанкінг: спочатку Markdown, потім fallback

Ми спробували три підходи, перш ніж знайти робочий.

**Спроба 1: чанки фіксованого розміру (1000 символів).** Швидко реалізувати, жахливі результати. Чанки розрізали посеред речення, посеред абзацу, іноді посеред слова. Результати пошуку були незв'язними.

**Спроба 2: рекурсивне розбиття по символах (500 символів, 100 overlap).** Краще. `RecursiveCharacterTextSplitter` LangChain намагається розбивати по межах абзаців, потім речень, потім слів. Але він все одно ігнорує структуру документа.

**Спроба 3: розбиття по Markdown-заголовках з fallback.** Це те, що ми використовуємо:

```python
class ChunkService:
    def split(self, text: str) -> list[str]:
        # Спочатку пробуємо Markdown-розбиття
        markdown_chunks = MarkdownHeaderTextSplitter(
            headers_to_split_on=[("#", "H1"), ("##", "H2"), ("###", "H3")]
        ).split_text(text)

        # Fallback якщо Markdown-розбиття дає погані результати
        if len(markdown_chunks) <= 1 or any(len(c) > 1000 for c in markdown_chunks):
            return RecursiveCharacterTextSplitter(
                chunk_size=500, chunk_overlap=100
            ).split_text(text)

        return [doc.page_content for doc in markdown_chunks]
```

Markdown-розбиття зберігає структуру документа. Секція про "Потік автентифікації" залишається одним чанком. Таблиця API-ендпоінтів тримається разом. Результат пошуку — зв'язний шматок знання, а не випадкове текстове вікно.

Fallback спрацьовує для документів, що не є добре структурованим Markdown — простий текст, контент конвертований з HTML, або документи з одним плоским тілом.

## Асинхронний пайплайн ембедінгу

Ембедінг — це зовнішній API-виклик: повільний, з rate limits і схильний до збоїв. Ми ніколи не робимо це синхронно.

**Django-сигнали тригерять Celery-задачі:**

```python
@receiver(post_save, sender=Chunk)
def handle_chunk_status(sender, instance, **kwargs):
    if instance.status == Status.APPROVED:
        add_chunk_to_vector_store_task.delay(instance.id)
    elif was_approved_before(instance):
        delete_embedding_from_qdrant(point_id=instance.id)
```

**Celery-задача обробляє ембедінг і збереження:**

```python
@shared_task(autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def add_chunk_to_vector_store_task(chunk_id):
    chunk = Chunk.objects.select_related("document").get(pk=chunk_id)

    embedding = get_embedding(chunk.content)  # OpenAI text-embedding-3-small

    save_embedding_to_qdrant(
        point_id=chunk.pk,
        embedding=embedding,
        payload={
            "title": chunk.document.title,
            "snippet": chunk.content[:127],
            "page_url": chunk.document.source_url,
            "tags": list(chunk.document.tags.values_list("name", flat=True)),
            "categories": list(chunk.document.categories.values_list("name", flat=True)),
        },
        collection_name="documents",
    )
```

Ключові рішення:

- **Auto-retry з backoff** грейсфулі обробляє rate limits OpenAI
- **Payload зберігає метадані поруч з вектором**, щоб Qdrant міг фільтрувати без звернення до PostgreSQL
- **Сніпет (перші 127 символів)** дає превʼю без збереження повного тексту в Qdrant — повний контент залишається у PostgreSQL

## Векторний пошук з фільтрацією метаданих

Qdrant зберігає ембедінги з косинусною відстанню. Але самої подібності недостатньо — користувачі часто хочуть шукати в межах конкретного проекту, тегу чи категорії.

```python
def search(embedding, top_k=5, tags=None, categories=None, projects=None):
    query_filter = None
    should_conditions = []

    if tags:
        should_conditions.append(FieldCondition(key="tags", match=MatchAny(any=tags)))
    if categories:
        should_conditions.append(FieldCondition(key="categories", match=MatchAny(any=categories)))
    if projects:
        should_conditions.append(FieldCondition(key="projects", match=MatchAny(any=projects)))

    if should_conditions:
        query_filter = Filter(should=should_conditions)  # OR-логіка

    return client.query_points(
        collection_name="documents",
        query=embedding,
        limit=top_k,
        query_filter=query_filter,
        score_threshold=0.3,
    )
```

Фільтр `should` реалізує OR-логіку — пошук з `tags=["auth", "security"]` повертає документи з тегом *будь-яким* із них. Це був свідомий вибір замість AND-логіки, яка має тенденцію повертати нуль результатів, коли користувачі комбінують кілька фільтрів.

Поріг score 0.3 відсіює нерелевантні збіги. Ми дійшли до цього числа емпірично — нижче 0.3 результати були стабільно не по темі.

## Життєвий цикл документа

Одна річ, яку туторіали ніколи не покривають: що відбувається, коли документ змінюється?

Наш сервіс `save_document` обробляє це атомарно:

```python
def save_document(title, chunks, source_type, source_url="", page_id=None, **kwargs):
    lookup = {"page_id": page_id} if page_id else {"title": title}

    with transaction.atomic():
        doc, created = Document.objects.get_or_create(**lookup, defaults={...})

        if not created:
            # Повторна інгестія: видаляємо старі чанки (сигнали видаляють з Qdrant)
            Chunk.objects.filter(document=doc).delete()

        for i, text in enumerate(chunks):
            Chunk.objects.create(document=doc, order=i, content=text, status=chunk_status)
```

Коли документ повторно інгеститься — скажімо, сторінка Confluence оновилася — ми видаляємо старі чанки (Django-сигнали видаляють їх з Qdrant), потім створюємо нові (сигнали ставлять в чергу нові задачі ембедінгу). ID зовнішньої системи (`page_id`) гарантує, що ми оновлюємо правильний документ, а не створюємо дублікат.

## Що дало найбільшу різницю

**1. Якість чанків важливіша за кількість.** Менші, семантично зв'язні чанки (одна секція = один чанк) перемагають більші, структурно довільні. Завжди.

**2. Фільтрація метаданих.** Без неї пошук по базі з 500 документів повертає шум. З фільтрами по проекту/тегу/категорії користувачі отримують фокусовані результати навіть з розмитими запитами.

**3. Celery для всього асинхронного.** Ембедінг 500 документів синхронно зайняв би години і заблокував веб-сервер. Celery-задачі з auto-retry зробили це fire-and-forget.

**4. Сигнали для управління життєвим циклом.** Django-сигнали, що з'єднують зміни статусу чанків з операціями Qdrant, означали, що нам ніколи не треба думати про "синхронізацію векторів" — це відбувається автоматично.

**5. Поріг score.** Простий cutoff на 0.3 відсіяв більше поганих результатів, ніж будь-який prompt engineering, який ми пробували.

## Стек

- **Django 5.2** — бекенд, API, адмінка
- **PostgreSQL** — документи, чанки, метадані
- **Qdrant** — векторне сховище і пошук за подібністю
- **OpenAI text-embedding-3-small** — 1536-вимірні ембедінги
- **LangChain** — розбиття тексту та обгортки для ембедінгів
- **Celery + Redis** — черга асинхронних задач
- **FastMCP** — MCP-сервер для інтеграції з Claude

Якщо ви будуєте RAG у Django, почніть з чанкінгу. Все downstream — якість ембедінгів, релевантність пошуку, точність відповідей — залежить від того, наскільки добре ви розбиваєте документи. Зробіть це правильно, потім оптимізуйте решту.
