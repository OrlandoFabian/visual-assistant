# Visual Assistant

A full-stack reference app that accepts image uploads, returns an OpenAI Responses API-shaped vision analysis, and supports streaming chat with per-image conversation history.

![CI](https://github.com/OrlandoFabian/visual-assistant/actions/workflows/ci.yml/badge.svg)

---

## Get the code

```bash
git clone https://github.com/OrlandoFabian/visual-assistant.git
cd visual-assistant
```

---

## Run it

Two options — pick whichever matches what you already have installed.

### Option 1 — Docker (recommended, zero local setup)

**Prerequisite:** Docker Desktop installed and running.

```bash
make dev
```

Under the hood this runs `docker compose up --build`, which starts three containers (frontend, backend, Postgres) and runs database migrations automatically.

Open **http://localhost:3000**. Tear down with `make clean` when you're done.

### Option 2 — Without Docker

**Prerequisites:**

- Python 3.13+
- `pipenv` (`pip install pipenv`)
- Node.js 18+ and `npm`

```bash
# Terminal 1 — backend
cd backend
pipenv install --dev
pipenv run flask --app app db upgrade    # creates dev.db (SQLite)
pipenv run python run.py                 # dev server on :8000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev                              # Vite dev server on :5173
```

Open **http://localhost:5173**.

> Running without Docker uses **SQLite** instead of Postgres (via the auto-generated `backend/dev.db` file). The app code is identical in both paths — only the database driver differs.

---

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET  | `/health`                               | Liveness probe |
| POST | `/upload`                               | Upload image + initial vision analysis |
| GET  | `/images?limit=&offset=`                | Paginated list |
| GET  | `/images/<id>/preview`                  | Fetch the image bytes |
| DELETE | `/images/<id>`                        | Delete image + cascade history |
| POST | `/chat/<id>`                            | Non-streaming chat |
| POST | `/chat-stream/<id>`                     | Streaming chat (SSE) |
| GET  | `/chat/<id>/history`                    | Full conversation history |


---

## Developer commands

```bash
make test                       # pytest in the backend container
make lint                       # ruff
make typecheck                  # mypy
make retention-prune days=30    # delete chat messages older than N days
make clean                      # stop + remove containers + volumes
```

---

## Project structure

```
inkit-visual-assistant/
├── backend/            Flask API — services, repositories, migrations, tests
├── frontend/           React + Vite + Tailwind — demo page + docs portal
├── docker-compose.yml  Three-service stack (frontend, backend, postgres)
├── Makefile            Common dev commands
└── .github/workflows/  CI (ruff · mypy · pytest)
```


---

## Stack

**Backend** — Flask 3 · SQLAlchemy 2 · Alembic · psycopg 3 · Flask-Limiter · gunicorn + gevent · Postgres 16

**Frontend** — React 19 · TypeScript 5 · Vite 6 · Tailwind CSS 4 · react-router 7

**Infra** — Docker Compose · nginx reverse proxy · GitHub Actions CI

**Dev tooling** — ruff · mypy · pytest + pytest-flask

---

## AI usage disclosure

Per the take-home instructions: I used Claude (Anthropic) as a design partner and pair-programming collaborator throughout this project. Specifically, Claude helped with:

- **Design discussions.** Open-ended brainstorming on architecture choices
- **Code generation + review.** Boilerplate and scaffolding were drafted with Claude and reviewed line-by-line.
- **Documentation.** The in-app `/docs` portal pages, this README, commit messages, and the architecture diagram above were drafted with Claude.
- **Learning conversations.** I used Claude to understand concepts I was less familiar with — SQLAlchemy sessions, Alembic revisions, Flask's `g` scratchpad, the SSE wire protocol, Werkzeug's `FileStorage`.

AI accelerated the drafting and surfaced alternatives I wouldn't have considered on my own. Every decision in this repository was understood and owned before being committed.
