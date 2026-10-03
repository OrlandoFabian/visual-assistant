.PHONY: help dev test lint typecheck migrate clean lock

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

dev: ## Start the full stack (backend + postgres) via docker compose
	docker compose up --build

test: ## Run backend tests inside the backend container
	docker compose run --rm backend pytest -v

lint: ## Ruff lint check
	docker compose run --rm backend ruff check .

typecheck: ## Mypy type check
	docker compose run --rm backend mypy app.py

migrate: ## Generate a new migration (usage: make migrate m="describe change")
	docker compose run --rm backend flask db migrate -m "$(m)"

lock: ## Regenerate Pipfile.lock in the backend container
	docker compose run --rm backend pipenv lock

clean: ## Stop containers, remove volumes
	docker compose down -v
