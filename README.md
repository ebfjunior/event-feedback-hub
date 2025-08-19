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
 

## Technical Summary

This take-home assignment was completed under tight time constraints due to unexpected issues with the end of my trip. I intentionally scoped my implementation to ensure I could deliver a working end-to-end solution within just a few hours of development time. Below I outline the rationale behind my decisions, trade-offs made, and improvements I would pursue with more time.

### Tech Stack Choice

**Decision**: I implemented the application as a monolith using React + Next.js instead of Ruby on Rails.

**Rationale**: While Rails (with Hotwire/ActionCable) is a strong fit for the assignment, I have not yet worked with Hotwire. Given the limited time available, I chose a stack I could deliver faster with while still covering both backend and frontend needs in a single codebase.

**Trade-off**: This limited my ability to leverage Rails’ built-in WebSocket support and real-time features.

### Real-Time Updates

**Decision**: I used simple HTTP polling for the events stream.

**Rationale**: I initially attempted a Socket.io integration for real-time updates, but as it was my first time using it, troubleshooting consumed too much time. I prioritized shipping a working solution over an incomplete or unstable WebSocket integration.

**Trade-off**: Polling introduces unnecessary API overhead and is less efficient than a WebSocket solution.

**Future Improvement**: With more time, I would switch to ActionCable (Rails) or SolidCable for a more robust and efficient real-time stream.

### Development Approach

**Decision**: I “vibe-coded” the application, focusing on rapid iteration and leveraging a detailed PRD and Shape-Up methodology to scope requirements and implementation steps.

**Rationale**: This approach allowed me to deliver a functional prototype quickly.

**Trade-off**: It led to cutting corners on some best practices, which I recognize as areas for improvement.

### Areas for Improvement

If I had more time, I would refine the following:

- Implement WebSockets properly for real-time updates.
- Adopt Next.js performance best practices such as UI streaming, skeleton UIs, and more efficient loading states.
- Improve overall code structure to better reflect production standards rather than prototype speed.

### Closing Note

Overall, my focus was on delivering a working, end-to-end solution within severe time constraints while clearly demonstrating my ability to scope, plan, and execute. Given more time, I would address the limitations above to deliver a more production-ready and performant solution.