# Visual Assistant

A full-stack take-home exercise for Inkit: a Flask backend that accepts image uploads, returns mocked OpenAI vision analysis, and supports streaming chat with per-image conversation history, plus a React/TypeScript frontend with an interactive demo and API documentation page.

![CI](https://github.com/OrlandoFabian/visual-assistant/actions/workflows/ci.yml/badge.svg)

---

## Quickstart

### Run the full stack with Docker (recommended)

```bash
make dev
```

That boots three containers via `docker-compose`:

| Service | URL | Notes |
|---|---|---|
| **frontend** | http://localhost:3000 | React + Tailwind, served by nginx. Proxies `/api/*` to the backend. |
| **backend** | http://localhost:8000 | Flask + gunicorn+gevent (SSE-capable). Runs migrations on boot. |
| **postgres** | localhost:5432 | Postgres 16, data persisted in a named volume. |

Open http://localhost:3000 to use the app. Open http://localhost:3000/docs for the full API reference.

### Run just the backend without Docker

```bash
cd backend
pipenv install --dev
pipenv run flask --app app db upgrade   # one-time: creates dev.db SQLite
pipenv run python run.py                # dev server on :8000
```

### Run just the frontend without Docker

Requires the backend to be running on `:8000`.

```bash
cd frontend
npm install
npm run dev                             # Vite dev server on :5173
```

The Vite dev proxy forwards `/api/*` to the backend, so no CORS setup is needed.

### Other commands

```bash
make test         # pytest in the backend container
make lint         # ruff
make typecheck    # mypy
make clean        # stop and remove containers + volumes
```

---

## Project structure

```
inkit-visual-assistant/
├── backend/                   Python / Flask API
│   ├── app/
│   │   ├── api/               Thin HTTP blueprints
│   │   ├── services/          Business orchestration
│   │   ├── repositories/      In-memory + DB-backed storage impls
│   │   ├── validation/        Hand-written request validators
│   │   ├── mocks/             Simulated OpenAI responses
│   │   ├── models.py          SQLAlchemy models
│   │   ├── cache.py           Thread-safe LRU cache
│   │   └── __init__.py        Flask app factory
│   ├── migrations/            Alembic versioned schema changes
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── Dockerfile
│   └── Pipfile
├── frontend/                  React + TypeScript + Tailwind
│   ├── src/
│   │   ├── pages/             DemoPage, DocsPage
│   │   ├── components/        UI building blocks
│   │   ├── hooks/             useSSE for streaming
│   │   └── api/               typed fetch wrappers
│   ├── nginx.conf             reverse-proxies /api/* to backend
│   └── Dockerfile             multi-stage: Node build → nginx serve
├── docker-compose.yml         frontend + backend + postgres
├── Makefile                   common commands
├── .github/workflows/         CI (ruff + mypy + pytest)
└── docs/                      ARCHITECTURE.md and ADRs
```

Each major piece of the system shipped in its own feature branch so the git history reads as a story (`feat/q1-upload-and-chat`, `feat/q2-sse-streaming`, `feat/q3-conversation-history`, `feat/q4-postgres-persistence`, `feat/frontend`).

---

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET  | `/health`                      | Liveness probe |
| POST | `/upload`                      | Upload image + initial mock vision analysis |
| POST | `/chat/<image_id>`             | Non-streaming chat (OpenAI `chat.completion` shape) |
| POST | `/chat-stream/<image_id>`      | Streaming chat via Server-Sent Events |
| GET  | `/chat/<image_id>/history`     | List conversation history for an image |

Open the API Docs page in the frontend (`/docs`) for request/response shapes, status codes, and copy-pasteable curl examples.

---

## Stack

- **Backend:** Flask 3, SQLAlchemy 2 (via Flask-SQLAlchemy), Alembic (via Flask-Migrate), gunicorn + gevent for prod SSE, Postgres (SQLite for tests and local dev-without-Docker).
- **Frontend:** React 19, TypeScript 5, Vite 6, Tailwind CSS 4, react-router 7.
- **Infra:** Docker + docker-compose, nginx reverse proxy, GitHub Actions CI.
- **Dev tooling:** ruff (lint + format), mypy (gradual typing), pytest + pytest-flask.

---

## AI usage disclosure

Per Inkit's take-home instructions: I used Claude (Anthropic) as a design-review and code-generation collaborator throughout this project. Specifically:

- Design spec and architectural decisions were co-developed through structured brainstorming (five sections, section-by-section approval).
- Scaffolding files (Dockerfile, docker-compose, Makefile, CI workflow, Tailwind setup) were drafted with Claude and reviewed line-by-line before commit.
- Implementation code was written iteratively with Claude as a pair-programmer; every substantive decision was discussed, challenged, and the final choice documented in the commit message or an ADR.

AI was used to accelerate drafting and surface alternatives — not to replace design or architectural reasoning. Every choice in this repository was understood and owned before being committed.
