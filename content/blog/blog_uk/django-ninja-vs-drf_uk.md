---
title: "Django Ninja vs DRF: коли Pydantic-first API — правильний вибір"
date: "2026-03-04"
excerpt: "Ми почали новий Django-проект і не взяли DRF. Ось що сталося через шість місяців — переваги, компроміси, і коли DRF все ще кращий вибір."
---

## Ми не взяли DRF

Коли ми починали новий Django-сервіс — адміністративний бекенд з RBAC, JWT-автентифікацією та мультимовною підтримкою — стандартним вибором був би Django REST Framework. Ми ним користувалися роками. Він працює.

Але цього разу ми обрали **Django Ninja**. Через шість місяців хочу поділитися, як це рішення виглядає в продакшені.

## Що таке Django Ninja

Django Ninja — це фреймворк для створення API з Django, натхненний FastAPI. Основна ідея: використовувати **Python type hints і Pydantic-моделі** для валідації запитів, серіалізації відповідей та OpenAPI-документації — все автоматично.

Якщо ви працювали з FastAPI, синтаксис буде знайомим. Якщо використовували тільки DRF — різниця відчувається одразу.

## Різниця в коді

Ось як виглядає ендпоінт логіну в Django Ninja:

```python
@authn_router.post("/login", response={200: LoginResponseSchema, 400: dict, 403: dict})
def login(request, data: LoginSchema):
    result = authenticate_user(data.username, data.password)
    if isinstance(result, tuple):
        return result
    refresh_token = result.pop("refresh_token")
    response = JsonResponse(result)
    set_refresh_token_cookie(response, refresh_token)
    return response
```

І схема:

```python
class LoginSchema(BaseModel):
    username: constr(min_length=3, max_length=128)
    password: constr(min_length=8, max_length=64)

    @field_validator("username")
    def validate_username(cls, value):
        if not re.fullmatch(USERNAME_REGEX, value):
            raise ValueError(INVALID_USERNAME_MESSAGE)
        return value
```

Це все. Жодного класу серіалізатора з `class Meta`. Жодного танцю з `serializer.is_valid()`. Жодного окремого `get_serializer_class()`. Type hint `data: LoginSchema` робить валідацію автоматично — якщо вона не проходить, Ninja повертає 422 з детальними Pydantic-помилками ще до того, як ваша функція виконається.

Еквівалент на DRF потребує `Serializer`, `View` (або `ViewSet`), явних викликів `is_valid()` і ручної обробки статусів відповідей. Не жахливо — просто більше бойлерплейту для того самого результату.

## Мульти-статусні відповіді

Тут Ninja справді блищить. Всі можливі статуси відповідей оголошуються у декораторі:

```python
@rbac_router.post(
    "/create-member",
    response={201: CreateMemberResponse, **BAD_REQUEST_ERRORS},
    throttle=[UserRateThrottle("10/m")],
)
def create_member(request, payload: MemberCreationPayload):
    membership = create_membership(payload, role, organization)
    return 201, {"membership_id": membership.id}
```

Кожен статус-код отримує свою схему. OpenAPI-документація генерується автоматично з усіма варіантами відповідей. У DRF для цього потрібні декоратори `@extend_schema` з drf-spectacular або ручні swagger-анотації.

## Pydantic-i18n: мультимовні помилки валідації

Це була одна з головних причин вибору Ninja. Наш сервіс підтримує кілька мов, і помилки валідації потрібно перекладати.

З **pydantic-i18n** ми побудували шар перекладу приблизно в 30 рядків:

```python
from pydantic_i18n import PydanticI18n

translations = {
    "en_US": {},
    "uk": {
        "Field required": _("Field required"),
        "String should have at least 3 characters": _("String should have at least 3 characters"),
    },
}

translator = PydanticI18n(translations)

@api.exception_handler(NinjaValidationError)
def validation_error_handler(request, exc):
    errors = translator.translate(exc.errors(), locale="uk")
    return api.create_response(request, {"detail": errors}, status=400)
```

Тепер кожна помилка валідації Pydantic — від невідповідності типів до порушення обмежень — перекладається автоматично. У DRF для цього потрібно перевизначати обробку `ValidationError`, патчити повідомлення про помилки серіалізатора і боротися з непослідовним форматом помилок різних типів полів.

## Організація роутерів

Ми організовуємо роутери по Django-додатках — кожен додаток володіє своїми ендпоінтами:

```python
# Головний API
dpa_api = NinjaAPI(title="Administrative Service", version="1.0.0")
dpa_api.add_router("/account", account_router)
dpa_api.add_router("/authn", authn_router)
dpa_api.add_router("/rbac", rbac_router)
dpa_api.add_router("/ref", ref_router)
```

Кожен роутер отримує свою стратегію автентифікації:

```python
# Публічні роути (логін, health check)
authn_router = Router(tags=["AuthN-v1"])

# Захищені роути (автоматичне прикріплення membership до запиту)
rbac_router = Router(tags=["RBAC-v1"], auth=MembershipJWTAuth())
```

Автентифікація на рівні роутера означає, що не потрібно повторювати `auth=...` на кожному ендпоінті. Публічні роути відключаються явно.

## JWT-автентифікація з HTTP-Only Cookies

Ми побудували кастомні класи JWT-автентифікації, розширивши `ninja-jwt`:

```python
class MembershipJWTAuth(NinjaJWTAuth):
    def jwt_authenticate(self, request, token):
        user = super().jwt_authenticate(request, token)
        request.membership = get_membership(user)
        return user
```

Refresh-токени живуть у HTTP-only cookies — JavaScript не може до них дістатися, що запобігає XSS-крадіжці токенів. Access-токени йдуть у заголовку Authorization. Розумна ротація спрацьовує тільки після 50% часу життя токена, запобігаючи надмірним записам у БД від частих оновлень.

## Throttling

Вбудований, на рівні ендпоінту, один рядок:

```python
@api.get("/health", throttle=[AnonRateThrottle("10/m")])
def health_check(request):
    return {"status": "ok"}

@router.post("/create", throttle=[UserRateThrottle("5/m")])
def create_something(request, data: CreateSchema):
    ...
```

DRF має подібні можливості, але конфігурація відбувається на рівні класу через `throttle_classes` — менш гранулярно, коли один ViewSet має ендпоінти з різним рівнем чутливості.

## Коли DRF все ще кращий

Django Ninja не є універсально кращим. Ось коли я б все ще обрав DRF:

**Магія ModelViewSet.** Якщо ваш API — здебільшого CRUD над Django-моделями з фільтрами, пагінацією та вкладеними серіалізаторами — DRF ViewSets і ModelSerializers генерують це за хвилини. Ninja вимагає писати кожен ендпоінт вручну.

**Зрілість екосистеми.** DRF має django-filter, drf-spectacular, drf-nested-routers і десятки бойових пакетів. Екосистема Ninja росте, але поки менша.

**Знайомство команди.** Якщо ваша команда глибоко знає DRF і проект вже його використовує — переключатися посеред проекту не варто.

**Складна вкладена серіалізація.** Вкладені серіалізатори DRF з `depth` і `source` більш зрілі для глибоко вкладених зв'язків між моделями.

## Вердикт

Через шість місяців ми б зробили той самий вибір для цього типу проекту — сервіс із чіткими API-контрактами, мультимовною обробкою помилок і JWT-автентифікацією. Одна лише інтеграція з Pydantic заощадила нам значну кількість бойлерплейту.

Але якщо б ми будували стандартний CRUD-адмінбекенд з 50 моделями? ModelViewSet DRF виграв би продуктивністю.

**Моє правило:** якщо ваш API model-driven — використовуйте DRF. Якщо ваш API contract-driven (суворі вхідні/вихідні схеми, кілька типів відповідей, крос-валідація полів) — використовуйте Django Ninja.
