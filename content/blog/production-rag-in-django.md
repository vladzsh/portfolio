---
title: "Production RAG in Django: Chunking, Embeddings, and Semantic Search Beyond the Tutorial"
date: "2026-02-28"
excerpt: "Most RAG tutorials end at 'insert your document into a vector DB.' Ours starts there — here's what building a production RAG pipeline in Django actually looks like."
---

## Beyond the Tutorial

Every RAG tutorial follows the same script: load a PDF, split it into chunks, embed them, store in a vector database, query it. Done.

Then you try to build one for real, and the questions start:

- What chunk size actually works?
- How do you handle documents from five different sources?
- What happens when a document gets updated?
- How do you make search results actually relevant?
- How do you run this without blocking your web server?

We built a production RAG system inside a Django application. It ingests documents from Confluence, an issue tracker, Google Sheets, Google Docs, and manual uploads. It serves semantic search over 500+ documents. Here's what we learned.

## The Data Model

Two Django models carry the pipeline:

```python
class Document(models.Model):
    title = models.CharField(max_length=255)
    source_type = models.CharField(max_length=50)  # confluence, youtrack, google_sheets...
    source_url = models.URLField(blank=True)
    page_id = models.CharField(max_length=50, null=True)  # external system ID
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

Documents hold metadata and relationships. Chunks hold the actual text that gets embedded. The `status` field on Chunk is critical — it drives the async embedding pipeline.

## Chunking: Markdown First, Then Fallback

We tried three approaches before landing on what works.

**Attempt 1: Fixed-size chunks (1000 chars).** Fast to implement, terrible results. Chunks split mid-sentence, mid-paragraph, sometimes mid-word. Search results were incoherent.

**Attempt 2: Recursive character splitting (500 chars, 100 overlap).** Better. LangChain's `RecursiveCharacterTextSplitter` tries paragraph boundaries, then sentence boundaries, then words. But it still ignores document structure.

**Attempt 3: Markdown header splitting with fallback.** This is what we use:

```python
class ChunkService:
    def split(self, text: str) -> list[str]:
        # Try Markdown splitting first
        markdown_chunks = MarkdownHeaderTextSplitter(
            headers_to_split_on=[("#", "H1"), ("##", "H2"), ("###", "H3")]
        ).split_text(text)

        # Fallback if Markdown splitting produces poor results
        if len(markdown_chunks) <= 1 or any(len(c) > 1000 for c in markdown_chunks):
            return RecursiveCharacterTextSplitter(
                chunk_size=500, chunk_overlap=100
            ).split_text(text)

        return [doc.page_content for doc in markdown_chunks]
```

Markdown splitting preserves document structure. A section about "Authentication Flow" stays as one chunk. A table of API endpoints stays together. The search result is a coherent piece of knowledge, not a random text window.

The fallback kicks in for documents that aren't well-structured Markdown — plain text, HTML-converted content, or documents with a single flat body.

## Async Embedding Pipeline

Embedding is an external API call — slow, rate-limited, and failure-prone. We never do it synchronously.

**Django signals trigger Celery tasks:**

```python
@receiver(post_save, sender=Chunk)
def handle_chunk_status(sender, instance, **kwargs):
    if instance.status == Status.APPROVED:
        add_chunk_to_vector_store_task.delay(instance.id)
    elif was_approved_before(instance):
        delete_embedding_from_qdrant(point_id=instance.id)
```

**The Celery task handles embedding and storage:**

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

Key decisions here:

- **Auto-retry with backoff** handles OpenAI rate limits gracefully
- **Payload stores metadata alongside the vector** so Qdrant can filter without hitting PostgreSQL
- **The snippet (first 127 chars)** gives a preview without storing the full text in Qdrant — full content stays in PostgreSQL

## Vector Search With Metadata Filtering

Qdrant stores embeddings with cosine distance. But raw similarity isn't enough — users often want to search within a specific project, tag, or category.

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
        query_filter = Filter(should=should_conditions)  # OR logic

    return client.query_points(
        collection_name="documents",
        query=embedding,
        limit=top_k,
        query_filter=query_filter,
        score_threshold=0.3,
    )
```

The `should` filter implements OR logic — searching with `tags=["auth", "security"]` returns documents tagged with *either*. This was a deliberate choice over AND logic, which tends to return zero results when users combine multiple filters.

The score threshold of 0.3 filters out irrelevant matches. We arrived at this number empirically — below 0.3, results were consistently off-topic.

## Document Lifecycle

One thing tutorials never cover: what happens when a document changes?

Our `save_document` service handles it atomically:

```python
def save_document(title, chunks, source_type, source_url="", page_id=None, **kwargs):
    lookup = {"page_id": page_id} if page_id else {"title": title}

    with transaction.atomic():
        doc, created = Document.objects.get_or_create(**lookup, defaults={...})

        if not created:
            # Re-ingesting: delete old chunks (signals remove from Qdrant)
            Chunk.objects.filter(document=doc).delete()

        for i, text in enumerate(chunks):
            Chunk.objects.create(document=doc, order=i, content=text, status=chunk_status)
```

When a document is re-ingested — say, a Confluence page was updated — we delete the old chunks (Django signals remove them from Qdrant), then create new ones (signals queue new embedding tasks). The external system ID (`page_id`) ensures we update the right document, not create a duplicate.

## What Made the Biggest Difference

**1. Chunk quality over quantity.** Smaller, semantically coherent chunks (one section = one chunk) beat larger, structurally arbitrary ones. Every time.

**2. Metadata filtering.** Without it, searching a 500-document knowledge base returns noise. With project/tag/category filters, users get focused results even with vague queries.

**3. Celery for everything async.** Embedding 500 documents synchronously would take hours and block the web server. Celery tasks with auto-retry made it fire-and-forget.

**4. Signals for lifecycle management.** Django signals connecting chunk status changes to Qdrant operations meant we never had to think about "keeping vectors in sync" — it happens automatically.

**5. Score threshold.** A simple `0.3` cutoff eliminated more bad results than any prompt engineering we tried.

## The Stack

- **Django 5.2** — backend, API, admin
- **PostgreSQL** — documents, chunks, metadata
- **Qdrant** — vector storage and similarity search
- **OpenAI text-embedding-3-small** — 1536-dimensional embeddings
- **LangChain** — text splitting and embedding wrappers
- **Celery + Redis** — async task queue
- **FastMCP** — MCP server for Claude integration

If you're building RAG in Django, start with the chunking. Everything downstream — embedding quality, search relevance, answer accuracy — depends on how well you split your documents. Get that right first, then optimize the rest.
