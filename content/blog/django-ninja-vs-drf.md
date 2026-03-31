---
title: "Django Ninja vs DRF: When a Pydantic-First API Is the Right Call"
date: "2026-03-04"
excerpt: "We started a new Django project and didn't pick DRF. Here's what happened after six months — the wins, the trade-offs, and when DRF is still the better choice."
---

## We Didn't Pick DRF

When we started a new Django service — an administrative backend with RBAC, JWT auth, and multi-language support — the default choice would have been Django REST Framework. We've used it for years. It works.

But this time we went with **Django Ninja**. Six months later, I want to share what that decision actually looked like in production.

## What Is Django Ninja

Django Ninja is a web framework for building APIs with Django, inspired by FastAPI. The core idea: use **Python type hints and Pydantic models** for request validation, response serialization, and OpenAPI docs — all automatically.

If you've used FastAPI, the syntax will feel familiar. If you've only used DRF, the difference is immediate.

## The Code Difference

Here's what a login endpoint looks like in Django Ninja:

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

And the schema:

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

That's it. No serializer class with `class Meta`. No `serializer.is_valid()` dance. No separate `get_serializer_class()`. The type hint `data: LoginSchema` does the validation automatically — if it fails, Ninja returns a 422 with detailed Pydantic errors before your function even runs.

The DRF equivalent would need a `Serializer`, a `View` (or `ViewSet`), explicit `is_valid()` calls, and manual response status handling. Not terrible — just more boilerplate for the same result.

## Multi-Status Responses

This is where Ninja really shines. You declare all possible response statuses in the decorator:

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

Each status code gets its own schema. The OpenAPI docs generate automatically with all response variants. In DRF, you'd need `@extend_schema` decorators from drf-spectacular or manual swagger annotations.

## Pydantic-i18n: Multilingual Validation Errors

This was one of our main reasons for choosing Ninja. Our service supports multiple languages, and validation errors need to be translated.

With **pydantic-i18n**, we built a translation layer in about 30 lines:

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

Now every Pydantic validation error — from type mismatches to constraint violations — gets translated automatically. In DRF, achieving this requires overriding `ValidationError` handling, patching serializer error messages, and dealing with inconsistent error formats across different field types.

## Router Organization

We organize routers per Django app — each app owns its endpoints:

```python
# Main API
dpa_api = NinjaAPI(title="Administrative Service", version="1.0.0")
dpa_api.add_router("/account", account_router)
dpa_api.add_router("/authn", authn_router)
dpa_api.add_router("/rbac", rbac_router)
dpa_api.add_router("/ref", ref_router)
```

Each router gets its own auth strategy:

```python
# Public routes (login, health check)
authn_router = Router(tags=["AuthN-v1"])

# Protected routes (auto-attach membership to request)
rbac_router = Router(tags=["RBAC-v1"], auth=MembershipJWTAuth())
```

Auth at the router level means you don't repeat `auth=...` on every endpoint. Public routes opt out explicitly.

## JWT Auth with HTTP-Only Cookies

We built custom JWT authentication classes that extend `ninja-jwt`:

```python
class MembershipJWTAuth(NinjaJWTAuth):
    def jwt_authenticate(self, request, token):
        user = super().jwt_authenticate(request, token)
        request.membership = get_membership(user)
        return user
```

Refresh tokens live in HTTP-only cookies — JavaScript can't access them, which prevents XSS token theft. Access tokens go in the Authorization header. Smart rotation kicks in only after 50% of the token's lifetime has passed, preventing excessive DB writes from frequent refreshes.

## Throttling

Built-in, per-endpoint, one line:

```python
@api.get("/health", throttle=[AnonRateThrottle("10/m")])
def health_check(request):
    return {"status": "ok"}

@router.post("/create", throttle=[UserRateThrottle("5/m")])
def create_something(request, data: CreateSchema):
    ...
```

DRF has similar capabilities, but you configure it at the class level with `throttle_classes` — less granular when a single ViewSet has endpoints with different sensitivity levels.

## When DRF Is Still Better

Django Ninja isn't universally better. Here's when I'd still reach for DRF:

**ModelViewSet magic.** If your API is mostly CRUD on Django models with filters, pagination, and nested serializers — DRF's ViewSets and ModelSerializers generate that in minutes. Ninja requires you to write each endpoint manually.

**Ecosystem maturity.** DRF has django-filter, drf-spectacular, drf-nested-routers, and dozens of battle-tested packages. Ninja's ecosystem is growing but smaller.

**Team familiarity.** If your team knows DRF deeply and the project is already using it — switching mid-project isn't worth it.

**Complex nested serialization.** DRF's nested serializers with `depth` and `source` are more mature for deeply nested model relationships.

## The Verdict

After six months, we'd make the same choice again for this type of project — a service with clear API contracts, multilingual error handling, and JWT auth. The Pydantic integration alone saved us significant boilerplate.

But if we were building a standard CRUD admin backend with 50 models? DRF's ModelViewSet would win on productivity.

**My rule of thumb:** If your API is model-driven, use DRF. If your API is contract-driven (strict input/output schemas, multiple response types, cross-field validation), use Django Ninja.
