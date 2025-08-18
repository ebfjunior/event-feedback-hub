# Makefile for Event Feedback HUB

NPM ?= npm
DOCKER ?= docker
COMPOSE ?= docker compose
DATABASE_URL ?= postgresql://postgres:postgres@localhost:5432/event_feedback_hub?schema=public

.PHONY: help install dev build start lint typecheck format format-check test test-watch test-e2e ci \
	docker-build docker-run compose-up compose-down playwright-install prisma-generate prisma-migrate prisma-studio \
	db-up db-down seed prisma-migrate-name prisma-reset reset-and-seed

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS=":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	$(NPM) install

dev: ## Start Next.js dev server
	$(NPM) run dev

build: ## Build production bundle
	$(NPM) run build

start: ## Start production server
	$(NPM) run start

lint: ## Run ESLint
	$(NPM) run lint

typecheck: ## Run TypeScript type-check
	$(NPM) run typecheck

format: ## Format code with Prettier (write)
	$(NPM) run format

format-check: ## Check formatting (no write)
	$(NPM) run format:check

test: ## Run unit tests (Vitest)
	$(NPM) run test

test-watch: ## Run unit tests in watch mode
	$(NPM) run test:watch

playwright-install: ## Install Playwright browsers
	$(NPM) exec playwright install

test-e2e: ## Run E2E tests (Playwright)
	$(NPM) run test:e2e

ci: ## Lint, typecheck, unit tests (coverage)
	$(NPM) run ci

docker-build: ## Build Docker image
	$(DOCKER) build -t event-feedback-hub .

docker-run: ## Run Docker image locally on port 3000
	$(DOCKER) run --rm -p 3000:3000 event-feedback-hub

compose-up: ## Start services via docker compose (detached)
	$(COMPOSE) up --build -d

compose-down: ## Stop services and remove volumes
	$(COMPOSE) down -v

prisma-generate: ## Generate Prisma client
	env DATABASE_URL="$(DATABASE_URL)" $(NPM) exec prisma generate

prisma-migrate: ## Run Prisma migrate dev (apply any pending migrations)
	env DATABASE_URL="$(DATABASE_URL)" $(NPM) exec prisma migrate dev

prisma-migrate-name: ## Create a new named migration without applying: make prisma-migrate-name NAME=add_feature
	@[ -n "$(NAME)" ] || (echo "NAME is required, e.g. make prisma-migrate-name NAME=add_feature" && exit 1)
	env DATABASE_URL="$(DATABASE_URL)" $(NPM) exec prisma migrate dev --name "$(NAME)" --create-only

prisma-reset: ## Reset database and reapply all migrations (DANGER: drops data)
	env DATABASE_URL="$(DATABASE_URL)" $(NPM) exec prisma migrate reset --force --skip-seed

prisma-studio: ## Open Prisma Studio
	env DATABASE_URL="$(DATABASE_URL)" $(NPM) exec prisma studio

db-up: ## Start Postgres and Redis via compose
	$(COMPOSE) up -d postgres redis

db-down: ## Stop Postgres and Redis and remove volumes
	$(COMPOSE) down -v

seed: ## Seed the database with sample data
	env DATABASE_URL="$(DATABASE_URL)" $(NPM) run db:seed

reset-and-seed: ## Reset DB, apply migrations, and seed
	$(MAKE) prisma-reset && $(MAKE) seed


