---
title: "Why We Switched From Poetry to uv — and How It Made Our Docker Builds 10x Faster"
date: "2026-03-31"
excerpt: "We migrated three production Django projects from Poetry to uv. Here's what changed, what broke, and the Dockerfile patterns that cut our build times from minutes to seconds."
---

## The Moment That Started It All

Our Docker build took 4 minutes. Every time. Change one line in `views.py` — wait 4 minutes. Add a dependency — wait 4 minutes. Run CI — wait 4 minutes per stage.

Then we changed one thing in our Dockerfile, and it dropped to 40 seconds.

That one thing was **uv** — Astral's Rust-based Python package manager. We migrated three production Django projects from Poetry, and I want to share exactly what we did, what patterns emerged, and what surprised us.

## What Is uv (and Why Should You Care)

If you haven't heard of it yet — **uv** is a Python package manager written in Rust by the creators of Ruff. It's a drop-in replacement for pip, pip-tools, and Poetry. It's fast. Absurdly fast.

But speed alone isn't why we switched. The real win was **how well it fits into Docker workflows**.

## The Migration: Three Projects, Three Patterns

We migrated three Django services of different scale and complexity. Each ended up with a slightly different Dockerfile pattern, which I think is instructive — there's no single "right way."

### Pattern A: Simple Single-Stage

For a smaller service, the simplest approach:

```dockerfile
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_PROJECT_ENVIRONMENT=/opt/.venv \
    PATH="/opt/.venv/bin:$PATH"

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Dependencies cached separately from code
COPY pyproject.toml uv.lock /app/
RUN uv sync --no-dev --frozen --no-install-project

# Code changes don't invalidate the dependency layer
COPY . /app/
```

The key insight: **copy `pyproject.toml` and `uv.lock` before your source code**. Docker caches layers top-down — if your dependencies haven't changed, that `uv sync` layer is cached and your rebuild only copies new code. This alone is where most of the 10x speedup comes from.

### Pattern B: Multi-Stage with Explicit Venv

For a service running on Ubuntu (not slim Python images), we needed to create the venv ourselves:

```dockerfile
FROM ubuntu:noble AS app

RUN apt-get update && apt-get -qy install python3.12 python3.12-dev python3.12-venv ...

ENV VIRTUAL_ENV=/app/venvs/myapp
RUN python3.12 -m venv ${VIRTUAL_ENV}
ENV UV_PROJECT_ENVIRONMENT=${VIRTUAL_ENV}

RUN python -m pip install --no-cache-dir uv

# --- Production stage ---
FROM app AS prod
COPY --chown=app:app pyproject.toml uv.lock /app/src/
RUN uv sync --frozen --all-extras

COPY --chown=app:app . /app/src

# --- Development stage ---
FROM app AS dev
COPY --chown=app:app pyproject.toml uv.lock /app/src/
RUN uv sync --frozen --all-groups

COPY --chown=app:app . /app/src
```

Two key flags here: `--all-extras` for production (optional dependency sets) and `--all-groups` for development (dev + test + quality groups). The `UV_PROJECT_ENVIRONMENT` variable tells uv where to install — no need for `uv venv` if you already have one.

### Pattern C: Advanced with BuildKit Cache Mounts

Our most complex service has **private Git dependencies** — internal packages hosted on GitLab. This required BuildKit secrets and cache mounts:

```dockerfile
FROM python:3.12-slim AS prod
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV UV_PROJECT_ENVIRONMENT=/opt/venv \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./

# Phase 1: Install dependencies only (cached aggressively)
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=secret,id=CI_TOKEN \
    uv sync --locked --no-install-project

# Phase 2: Copy code, install project
COPY ./src /app/src
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked
```

Three environment variables worth knowing:
- **`UV_COMPILE_BYTECODE=1`** — compiles `.pyc` files at build time for faster cold starts
- **`UV_LINK_MODE=copy`** — copies packages instead of symlinking (required for mounted volumes)
- **`UV_PROJECT_ENVIRONMENT`** — tells uv where your venv lives

The `--mount=type=cache,target=/root/.cache/uv` persists uv's download cache across builds, so even when dependencies change, only the diff gets downloaded.

## Dependency Groups Replace Extras

One of my favorite uv features is **dependency groups**. Instead of Poetry's extras or separate requirements files:

```toml
[dependency-groups]
dev = ["django-debug-toolbar>=6.0.0", "ruff>=0.14.1"]
test = ["pytest-django>=4.11.1", "coverage>=7.13.1"]
quality = ["ruff>=0.14.1"]
prod = ["gunicorn>=23.0.0", "uvicorn[standard]>=0.37.0"]
```

Then in CI:

```bash
uv sync --frozen --group quality   # Just linting tools
uv sync --frozen --group test      # Just test dependencies
uv sync --frozen --all-groups      # Everything for development
```

This means your CI linting stage doesn't install pytest, and your test stage doesn't install gunicorn. Smaller layers, faster builds.

## CI/CD: The Two-Speed Trick

We run two variants of each CI job — **full** and **fast**:

```yaml
# Full: uses pre-built Docker image (all deps baked in)
quality-check:
  image: $IMAGE_LATEST
  script:
    - uv run ruff check .

# Fast: bare Python image, installs only what's needed
quality-check-fast:
  image: python:3.12
  before_script:
    - pip install uv
    - uv sync --frozen --group quality
  script:
    - uv run ruff check .
```

The "fast" variant runs on merge requests where you don't need full test coverage — just linting and formatting. It installs uv + ruff in seconds, not minutes.

## What We Learned

**The `--frozen` flag is non-negotiable.** It prevents uv from updating the lockfile during build. If your `uv.lock` is out of sync with `pyproject.toml`, the build fails — which is exactly what you want in CI.

**`uv run` replaces `python -m`.** Instead of activating a venv or calling `python -m pytest`, just use `uv run pytest`. It finds the right environment automatically.

**No Poetry remnants survived.** We deleted `poetry.lock`, removed `[tool.poetry]` sections, and replaced them with `[dependency-groups]` and `[tool.uv]`. Clean cut.

**Private packages need special handling.** If you pull from private Git repos, you'll need BuildKit secrets to pass authentication tokens during the build — but this is cleaner than baking credentials into images.

## The Numbers

I don't have precise benchmarks (we didn't set up formal timing), but the subjective difference is dramatic:

- **Cold build (no cache):** ~2 minutes with uv vs ~4-5 with Poetry
- **Warm build (deps cached, code changed):** ~10-15 seconds with uv vs ~2-3 minutes with Poetry
- **CI lint stage (fast path):** ~20 seconds vs ~2 minutes
- **`uv sync` on an already-synced project:** instant

The warm build improvement is the one you feel every day. Change a line, rebuild, test — the feedback loop tightens dramatically.

## Should You Switch?

If you're still on Poetry and your Docker builds involve Python — yes. The migration took us about a day per project, mostly spent restructuring Dockerfiles to take advantage of layer caching.

The tooling is mature, the lockfile format is stable, and the Dockerfile patterns are well-documented in [uv's official Docker guide](https://docs.astral.sh/uv/guides/integration/docker/).

Start with Pattern A. It's five lines. You'll feel the difference on the first rebuild.
