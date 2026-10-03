# Visual Assistant API

A RESTful API that accepts image uploads, returns an initial AI-generated analysis, and supports both standard and streaming chat about each image. Built as the Inkit senior engineering take-home exercise.

**Status:** Scaffold only. Architectural decisions and trade-offs documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and the ADRs under [`docs/adr/`](docs/adr/) as they are made.

| Question | Status |
|---|---|
| Scaffold (Flask app factory, Docker, CI, tests) | In progress |
| Q1 — Image upload + non-streaming chat | Not started |
| Q2 — Server-Sent Events streaming chat | Not started |
| Q3 — Per-image conversation history | Not started |
| Q4 — Postgres persistence + migrations + caching | Not started |
| Frontend demo (React + Tailwind) | Not started |

---

## Quickstart

### Prerequisites

- Python 3.13
- [pipenv](https://pipenv.pypa.io/) (`pip install pipenv`)
- Docker + Docker Compose (for `make dev`)

### Run locally (without Docker)

```bash
cd backend
pipenv install --dev
pipenv run python app.py
# API now at http://localhost:8000/health
```

### Run with Docker (recommended)

```bash
make dev
# Backend at http://localhost:8000
# Postgres at localhost:5432 (unused until Q4)
```

### Run tests

```bash
make test
# or, without docker: cd backend && pipenv run pytest
```

### Other commands

```bash
make lint         # ruff
make typecheck    # mypy
make clean        # tear down containers and volumes
```

---

## Project structure

```
inkit-visual-assistant/
├── backend/              Python / Flask API
│   ├── app.py            Flask app factory + endpoints (grows per question)
│   ├── tests/
│   ├── Dockerfile
│   ├── Pipfile
│   ├── pyproject.toml    ruff + mypy config
│   └── pytest.ini
├── docker-compose.yml    Backend + Postgres
├── Makefile              Common commands
├── .github/workflows/    CI pipeline
└── docs/
    ├── ARCHITECTURE.md   (added as decisions accumulate)
    └── adr/              Architecture Decision Records
```

Files and folders are added **incrementally per feature branch**, not all at once. The git history shows the architecture emerging under feature pressure (`feat/q1-upload-and-chat`, `feat/q2-sse-streaming`, etc.).

---

## Endpoints

Only `/health` exists in this scaffold. The full endpoint list arrives per question:

| Method | Path | Added in |
|---|---|---|
| GET | `/health` | Scaffold |
| POST | `/upload` | Q1 |
| POST | `/chat/<image_id>` | Q1 |
| POST | `/chat-stream/<image_id>` | Q2 |
| GET | `/chat/<image_id>/history` | Q3 |

---

## Design and decisions

- **Architecture overview:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — stack choices, module boundaries, API contract, trade-offs, "what I'd do next."
- **Architecture Decision Records:** `docs/adr/` — one short document per major decision (Flask over FastAPI, repository pattern for history, SSE server choice, manual validation over Pydantic, caching strategy, REST over GraphQL).

---

## AI usage disclosure

Per Inkit's take-home instructions: I used Claude (Anthropic) as a design-review and code-generation collaborator throughout this project. Specifically:

- Design spec and architectural decisions were co-developed through structured brainstorming (five sections, section-by-section approval).
- Scaffolding files (Dockerfile, docker-compose, Makefile, CI workflow) were drafted with Claude and reviewed line-by-line before commit.
- Implementation code was written iteratively with Claude as a pair-programmer, with every substantive decision defended in writing (see ADRs).

AI was used to accelerate drafting and surface alternatives — not to replace design or architectural reasoning. Every choice in this repository was understood, challenged, and owned before being committed.
