# Visual Assistant

A full-stack take-home exercise for Inkit: a Flask backend that accepts image uploads, returns an OpenAI Responses API-shaped vision analysis, and supports streaming chat with per-image conversation history, plus a React/TypeScript frontend with an interactive demo and API documentation page.

The backend uses a local mock that mirrors the OpenAI Responses API wire format exactly — `object: "response"`, `output[].content[].output_text` for payloads, and named Server-Sent Events (`response.created`, `response.output_text.delta`, `response.completed`) for streaming. The intent is that swapping in a real `client.responses.create(...)` call is a drop-in replacement; no consumer code would need to change.

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
make test                       # pytest in the backend container
make lint                       # ruff
make typecheck                  # mypy
make retention-prune days=30    # delete chat messages older than 30 days
make clean                      # stop and remove containers + volumes
```

### Rate limiting

Per-IP rate limits are enforced via Flask-Limiter:

| Endpoint | Limit |
|---|---|
| `/upload` | 10 / minute |
| `/chat/<id>` | 60 / minute |
| `/chat-stream/<id>` | 20 / minute |
| global default (all endpoints) | 200 / minute |

Clients get standard `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After` headers on every response so they can back off before hitting a 429. When a limit is exceeded the response is a consistent `429 rate_limit_exceeded` envelope.

Storage defaults to in-memory, which is fine for a single-instance deployment. To share limits across multiple backend workers or instances, set `RATELIMIT_STORAGE_URI=redis://redis:6379` as an env var — Flask-Limiter will transparently use Redis.

### Chat history retention

Chat history grows over time. We ship a reusable Flask CLI command that an
operator (not the Flask app itself) can run on a schedule:

```bash
flask retention prune --days 30
# Removed 142 chat message(s) older than 30 day(s).
```

The command lives in `backend/app/cli.py`. We deliberately did **not** wire
it into the Flask process: scheduled background work belongs with the ops
layer, not inside the request-handling worker. Depending on how you deploy,
pick one of:

```cron
# Linux cron: /etc/cron.d/visual-assistant-retention
0 2 * * *  app  cd /opt/visual-assistant && flask retention prune --days 30
```

```yaml
# Kubernetes CronJob
apiVersion: batch/v1
kind: CronJob
metadata:
  name: visual-assistant-retention
spec:
  schedule: "0 2 * * *"          # 02:00 UTC daily
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: retention
            image: visual-assistant-backend:latest
            command: ["flask", "retention", "prune", "--days", "30"]
          restartPolicy: OnFailure
```

Image deletions already cascade to their chat history via a Postgres
`ON DELETE CASCADE` on the `chat_messages.image_id` foreign key, so this
job only has to collect orphan-free rows that have simply aged out.

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
│   │   ├── mocks/             Simulated OpenAI Responses API objects
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
| POST | `/chat/<image_id>`             | Non-streaming chat (OpenAI Responses API shape) |
| POST | `/chat-stream/<image_id>`      | Streaming chat (named Responses API SSE events) |
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
