Event Feedback HUB. See `docs/Implementation Plan.md` for scope.

## Prerequisites

- Docker Desktop
- GNU Make
- Node.js >= 20 (required for Prisma tooling invoked by the Makefile)

## Environment

Create a `.env.local` file in the project root with the following (adjust as needed):

```
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_POLL_INTERVAL_MS=5000

# Feature flags
FEATURE_SUMMARIES=false

# OpenAI (required only when FEATURE_SUMMARIES=true)
OPENAI_API_KEY=

# Database (local default; Makefile uses this too)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/event_feedback_hub?schema=public
```

Notes:
- `FEATURE_SUMMARIES=true` enables the AI summary panel and requires `OPENAI_API_KEY`.
- `DATABASE_URL` must point to your Postgres instance. The default matches `docker-compose.yml` and the Makefile.

## Quick start (Docker-only, Makefile-driven)

1) Build and start all services (web, Postgres, Redis)

```bash
make compose-up
```

2) Initialize the database (migrations + seed)

```bash
make prisma-generate
make prisma-migrate
make seed
```

3) Open the app at `http://localhost:3000`

## Reset and re-seed (safe local reset)

```bash
make reset-and-seed
```

This drops and recreates the schema, reapplies all migrations, and seeds ~250 randomized feedback items across several example events.

## Using an existing/local Postgres (optional)

If you already have Postgres available outside Docker, set `DATABASE_URL` when invoking Make targets. Example:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb?schema=public \
  make prisma-migrate seed
```

## Docker controls (via Makefile)

- Start all services: `make compose-up`
- Stop and remove services/volumes: `make compose-down`
- Start only databases: `make db-up`
- Stop databases and remove volumes: `make db-down`

Notes:
- The app container is configured to connect to the compose `postgres` service by default (see `docker-compose.yml`).
- Redis is included for future use; the app does not require it today.

## Make targets

Run `make help` to list all targets. Common ones:

- `compose-up`: build and start web + Postgres + Redis
- `compose-down`: stop and remove services and volumes
- `db-up`: start Postgres + Redis only
- `db-down`: stop databases and remove volumes
- `prisma-generate`: generate Prisma client
- `prisma-migrate`: apply pending migrations
- `prisma-studio`: open Prisma Studio
- `seed`: seed database with sample data
- `reset-and-seed`: drop/recreate schema, reapply migrations, and seed

## Database & Prisma

- Open Prisma Studio: `make prisma-studio`
- Create a new named migration (no apply): `make prisma-migrate-name NAME=add_feature`

## Testing

Tests are available but not required for deploying/running via Docker. If you want to run them locally, use the Makefile to install toolchains and run tests from your host Node environment.

## Security Posture

- Same-origin app: no auth/cookies. All endpoints are public read; writes validate input.
 
- Output escaping: user-generated feedback text is rendered as plain text by React; no `dangerouslySetInnerHTML`.
- DB constraints: rating range and text length enforced by Prisma/DB.
- Error envelopes: consistent JSON shapes for clients (`lib/responses.ts`).

## Manual QA Checklist

- Home loads with seeded data; infinite scroll works and ends correctly.
- Filters: by event and by rating; sort: newest/highest.
- Submit feedback: client validates; POST succeeds; item appears and streams across tabs.
- Realtime: open a second tab; new feedback appears within ~1–2s.
- Event page: clicking event name navigates and stream is scoped; if enabled, AI summary panel renders or shows fallback text on errors.
 
