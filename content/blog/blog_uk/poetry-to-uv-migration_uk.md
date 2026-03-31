---
title: "Чому ми перейшли з Poetry на uv — і як це прискорило Docker-білди в 10 разів"
date: "2026-02-18"
excerpt: "Ми мігрували три продакшн Django-проекти з Poetry на uv. Ось що змінилося, що зламалося, і які патерни Dockerfile скоротили білди з хвилин до секунд."
---

## Момент, з якого все почалося

Наш Docker-білд займав 4 хвилини. Щоразу. Зміниш один рядок у `views.py` — чекай 4 хвилини. Додаш залежність — чекай 4 хвилини. Запустиш CI — чекай 4 хвилини на кожну стадію.

Потім ми змінили одну річ у Dockerfile, і білд впав до 40 секунд.

Ця одна річ — **uv**, пакетний менеджер для Python написаний на Rust від Astral. Ми мігрували три продакшн Django-проекти з Poetry, і я хочу поділитися тим, що саме ми зробили, які патерни з'явилися, і що нас здивувало.

## Що таке uv (і чому це важливо)

Якщо ви ще не чули — **uv** це пакетний менеджер для Python, написаний на Rust творцями Ruff. Він замінює pip, pip-tools і Poetry. Він швидкий. Абсурдно швидкий.

Але швидкість — не головна причина переходу. Справжній виграш — **наскільки добре він вписується в Docker-воркфлоу**.

## Міграція: три проекти, три патерни

Ми мігрували три Django-сервіси різного масштабу і складності. Кожен отримав трохи інший Dockerfile-патерн, що, на мою думку, показово — єдиного "правильного шляху" не існує.

### Патерн A: Простий однорівневий

Для невеликого сервісу — найпростіший підхід:

```dockerfile
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_PROJECT_ENVIRONMENT=/opt/.venv \
    PATH="/opt/.venv/bin:$PATH"

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Залежності кешуються окремо від коду
COPY pyproject.toml uv.lock /app/
RUN uv sync --no-dev --frozen --no-install-project

# Зміни коду не інвалідують шар залежностей
COPY . /app/
```

Ключовий інсайт: **копіюйте `pyproject.toml` і `uv.lock` перед вихідним кодом**. Docker кешує шари зверху вниз — якщо залежності не змінилися, шар `uv sync` береться з кешу, і ребілд лише копіює новий код. Саме це дає основний приріст швидкості в 10 разів.

### Патерн B: Багаторівневий з явним venv

Для сервісу на Ubuntu (не slim Python-образ) потрібно створити venv самостійно:

```dockerfile
FROM ubuntu:noble AS app

RUN apt-get update && apt-get -qy install python3.12 python3.12-dev python3.12-venv ...

ENV VIRTUAL_ENV=/app/venvs/myapp
RUN python3.12 -m venv ${VIRTUAL_ENV}
ENV UV_PROJECT_ENVIRONMENT=${VIRTUAL_ENV}

RUN python -m pip install --no-cache-dir uv

# --- Production ---
FROM app AS prod
COPY --chown=app:app pyproject.toml uv.lock /app/src/
RUN uv sync --frozen --all-extras

COPY --chown=app:app . /app/src

# --- Development ---
FROM app AS dev
COPY --chown=app:app pyproject.toml uv.lock /app/src/
RUN uv sync --frozen --all-groups

COPY --chown=app:app . /app/src
```

Два ключових прапорці: `--all-extras` для продакшну (опціональні набори залежностей) і `--all-groups` для розробки (dev + test + quality групи). Змінна `UV_PROJECT_ENVIRONMENT` вказує uv куди встановлювати — не потрібен `uv venv`, якщо venv вже є.

### Патерн C: Просунутий з BuildKit cache mounts

Наш найскладніший сервіс має **приватні Git-залежності** — внутрішні пакети на GitLab. Для цього потрібні BuildKit secrets і cache mounts:

```dockerfile
FROM python:3.12-slim AS prod
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV UV_PROJECT_ENVIRONMENT=/opt/venv \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./

# Фаза 1: тільки залежності (агресивне кешування)
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=secret,id=CI_TOKEN \
    uv sync --locked --no-install-project

# Фаза 2: копіюємо код, встановлюємо проект
COPY ./src /app/src
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked
```

Три змінні оточення, які варто знати:
- **`UV_COMPILE_BYTECODE=1`** — компілює `.pyc` файли під час білду для швидшого холодного старту
- **`UV_LINK_MODE=copy`** — копіює пакети замість симлінків (обов'язково для змонтованих томів)
- **`UV_PROJECT_ENVIRONMENT`** — вказує uv де живе ваш venv

`--mount=type=cache,target=/root/.cache/uv` зберігає кеш завантажень uv між білдами, тому навіть коли залежності змінюються, завантажується лише різниця.

## Dependency Groups замінюють Extras

Одна з моїх улюблених фіч uv — **dependency groups**. Замість Poetry extras або окремих requirements-файлів:

```toml
[dependency-groups]
dev = ["django-debug-toolbar>=6.0.0", "ruff>=0.14.1"]
test = ["pytest-django>=4.11.1", "coverage>=7.13.1"]
quality = ["ruff>=0.14.1"]
prod = ["gunicorn>=23.0.0", "uvicorn[standard]>=0.37.0"]
```

Потім у CI:

```bash
uv sync --frozen --group quality   # Тільки інструменти лінтингу
uv sync --frozen --group test      # Тільки тестові залежності
uv sync --frozen --all-groups      # Все для розробки
```

Це означає, що CI-стадія лінтингу не встановлює pytest, а тестова стадія не встановлює gunicorn. Менші шари, швидші білди.

## CI/CD: трюк із двома швидкостями

Ми запускаємо два варіанти кожної CI-задачі — **повний** і **швидкий**:

```yaml
# Повний: використовує попередньо зібраний Docker-образ
quality-check:
  image: $IMAGE_LATEST
  script:
    - uv run ruff check .

# Швидкий: голий Python-образ, встановлює тільки потрібне
quality-check-fast:
  image: python:3.12
  before_script:
    - pip install uv
    - uv sync --frozen --group quality
  script:
    - uv run ruff check .
```

"Швидкий" варіант запускається на merge request'ах, де не потрібне повне покриття тестами — лише лінтинг і форматування. Він встановлює uv + ruff за секунди, не хвилини.

## Що ми дізналися

**Прапорець `--frozen` — це must-have.** Він забороняє uv оновлювати lockfile під час білду. Якщо `uv.lock` розсинхронізований з `pyproject.toml`, білд падає — і це саме те, що потрібно в CI.

**`uv run` замінює `python -m`.** Замість активації venv або виклику `python -m pytest`, просто використовуйте `uv run pytest`. Він знаходить правильне оточення автоматично.

**Жодних залишків Poetry.** Ми видалили `poetry.lock`, прибрали секції `[tool.poetry]` і замінили їх на `[dependency-groups]` та `[tool.uv]`. Чистий розріз.

**Приватні пакети потребують окремої обробки.** Якщо ви підтягуєте з приватних Git-репозиторіїв, вам знадобляться BuildKit secrets для передачі токенів автентифікації під час білду — але це чистіше, ніж вшивати креденшли в образи.

## Цифри

Точних бенчмарків у нас немає (ми не налаштовували формальний тайминг), але суб'єктивна різниця драматична:

- **Холодний білд (без кешу):** ~2 хвилини з uv проти ~4-5 з Poetry
- **Теплий білд (залежності закешовані, код змінився):** ~10-15 секунд з uv проти ~2-3 хвилини з Poetry
- **CI lint стадія (швидкий шлях):** ~20 секунд проти ~2 хвилини
- **`uv sync` на вже синхронізованому проекті:** миттєво

Покращення теплого білду — це те, що відчуваєш щодня. Змінив рядок, ребілд, тест — цикл зворотного зв'язку стискається драматично.

## Чи варто переходити?

Якщо ви ще на Poetry і ваші Docker-білди включають Python — так. Міграція зайняла у нас приблизно день на проект, здебільшого на реструктуризацію Dockerfile'ів для використання переваг кешування шарів.

Інструментарій зрілий, формат lockfile стабільний, а патерни Dockerfile добре задокументовані в [офіційному Docker-гайді uv](https://docs.astral.sh/uv/guides/integration/docker/).

Почніть з Патерну A. Це п'ять рядків. Різницю відчуєте вже на першому ребілді.
