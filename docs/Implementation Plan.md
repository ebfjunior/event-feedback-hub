# Implementation Plan — Event Feedback HUB

Sources: [`docs/PRD.md`](./PRD.md), [`docs/Shape-Up Pitch.md`](./Shape-Up%20Pitch.md), design mocks [`docs/design/home-page.png`](./design/home-page.png), [`docs/design/event-page.png`](./design/event-page.png), and UX brief [`docs/design/UX Pilot Context.md`](./design/UX%20Pilot%20Context.md).

---

## Objectives

- Deliver a small, production-quality Next.js 14 + TypeScript app to submit and browse anonymous event feedback with realtime updates and infinite scroll.
- Server-first architecture with clean REST API (`/api/v1`), Postgres via Prisma, WebSockets (Socket.IO), Tailwind + shadcn/ui, and comprehensive automated tests.
- Optional AI per-event summaries behind a feature flag.

---

## Architecture & Stack

- Next.js App Router (server components by default), React functional components
- TypeScript (strict), Zod for runtime validation
- Tailwind CSS + shadcn/ui
- Postgres + Prisma ORM
- Socket.IO for realtime
- Redis + BullMQ (optional summaries worker) or in-process debounce for take-home
- Testing: Vitest + RTL, Playwright for E2E
- Tooling: ESLint, Prettier (+ tailwind plugin), GitHub Actions CI

Lightweight Clean Architecture (80/20):

- Layers (outer depends on inner): Domain → Application (Use Cases + Ports) → Infrastructure (Adapters) → Interface (Web/UI).
- Domain: entities (`Event`, `Feedback`) and core rules. Pure TS, no framework/DB imports.
- Application: small use cases (`listFeedbacks`, `createFeedback`) that depend on ports (`FeedbackRepository`, `EventRepository`, `RealtimePublisher`, `SummaryService`).
- Infrastructure: Prisma repository implementations, Socket emitter, OpenAI client, etc.
- Interface: Next.js route handlers map HTTP ↔ DTOs and call use cases; React renders results.
- 80/20 rule: introduce use cases/ports where logic is non-trivial or reused; avoid ceremony and avoid splitting files when it hurts clarity.

Directory sketch (from PRD §13):

```
app/
  api/v1/events/route.ts
  api/v1/feedbacks/route.ts
  api/v1/events/[event_id]/feedbacks/route.ts
  api/v1/events/[event_id]/summary/route.ts
  api/socket/route.ts
application/
  ports/
    EventRepository.ts
    FeedbackRepository.ts
    RealtimePublisher.ts
    SummaryService.ts
  usecases/
    listFeedbacks.ts
    createFeedback.ts
domain/
  event.ts
  feedback.ts
infrastructure/
  repositories/prisma/
    EventRepositoryPrisma.ts
    FeedbackRepositoryPrisma.ts
  realtime/socketPublisher.ts
  ai/openaiSummaryService.ts
components/
  ui/
  FeedbackCard.tsx, SubmitForm.tsx, ...
lib/
  cursor.ts, queries/feedbacks.ts
prisma/
  schema.prisma, seed.ts
```

---

## Milestones (hill chart)

1. Skeleton up (Downhill starts)
2. Data model & seeds
3. Listing API w/ keyset
4. Submit + broadcast
5. Frontend UX (infinite scroll, filters/sort, live updates)
6. Optional summaries
7. Hardening, QA pass, README

---

## Work Breakdown Structure (WBS) with Tasks

### 0. Project Setup & Tooling

- [x] Initialize Next.js App Router project with TypeScript
- [x] Add Tailwind CSS; configure base theme tokens
- [x] Add ESLint (Next + TS + React Hooks), Prettier (+ `prettier-plugin-tailwindcss`)
- [x] Add Vitest + RTL + Jest-DOM, Playwright (+ `@playwright/test`)
- [x] Add Socket.IO server dependency and client
- [x] Configure npm scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`, `test`, `test:e2e`, `ci`
- [x] Docker & docker-compose for web
- [x] GitHub Actions CI: install, lint, typecheck, unit tests, build
- [x] Add PostgreSQL to docker-compose.yml with persistent volume
- [x] Add Prisma ORM dependency and configure DATABASE_URL
- [x] Create .env.local template with database connection string
- [x] Add database setup instructions to README

Deliverable: CI green on a hello route; homepage renders with Tailwind.

### 1. Data Model & Seeds (Prisma)

- [x] Define models in `prisma/schema.prisma`:
  - [x] `Event(id uuid @id, name String @unique)`
  - [x] `Feedback(id uuid @id, eventId uuid, rating Int, text String, createdAt DateTime @default(now()))`
  - [x] Optional `EventSummary(eventId uuid @id, summary String, updatedAt DateTime)`
- [x] Add DB constraints (CHECK) for rating 1..5, text length 1..1000
- [x] Composite indexes for keyset (global newest/highest; per-event variants)
- [x] `prisma migrate dev` or `db push` for take-home
- [x] Seed script `prisma/seed.ts`: 4–6 events; 200–400 feedback rows over last 24–72h
- [x] README section with seeding instructions
- [x] Spot-check with psql/Prisma queries

Definition of done: Schema constraints enforced; seeds generated without errors.

### 2. Shared Libraries (lib)

- [x] `lib/cursor.ts`: encode/decode opaque base64url(JSON) cursor `{ v: 1, sort, k: [...] }`
- [x] `lib/queries/feedbacks.ts`: composable Prisma queries for list endpoints using keyset tuples
- [x] `lib/validation.ts`: Zod schemas for request params and bodies
- [x] `lib/responses.ts`: typed success and error envelopes (400/404/422)
- [x] `lib/realtime.ts`: Socket.IO server helpers (rooms, emit helpers, CORS guard)

Lightweight Clean Architecture layers (80/20):

- [x] Domain (`domain/`): define `Event` and `Feedback` entities and core invariants.
- [x] Application Ports (`application/ports/`): `EventRepository`, `FeedbackRepository`, `RealtimePublisher`, `SummaryService`.
- [x] Application Use Cases (`application/usecases/`): `listFeedbacks` (filters/sort/cursor), `createFeedback` (validation, persist, emit realtime).
- [x] Infrastructure Repositories (`infrastructure/repositories/prisma/`): Prisma-backed implementations of ports; support transactions.
- [x] Infrastructure Realtime (`infrastructure/realtime/`): Socket.IO publisher implementing `RealtimePublisher`.
- [x] Optional Infrastructure AI (`infrastructure/ai/`): summary service implementing `SummaryService`.

### 3. API Endpoints (`/api/v1`)

- [x] `GET /api/v1/events` → list events for dropdown
- [x] `GET /api/v1/feedbacks` → filters: `event_id?`, `rating?`; sort: `newest|highest`; cursor; limit<=50
- [x] `GET /api/v1/events/:event_id/feedbacks` → same envelope, scoped
- [x] `POST /api/v1/feedbacks` → validates and creates feedback; returns item with `event_name`
- [x] Error envelopes per PRD with Zod-driven details
- [x] Timestamps RFC3339
- [~] Unit/request tests: 400/404/422 added; ordering correctness and cursor progression pending

Route handler pattern:

- Parse and validate with `zod` → map to DTO → call use case (`application/usecases/*`) with injected ports → map result to response envelope.

Key points:

- Newest keyset: `WHERE (created_at,id) < (?,?) ORDER BY created_at DESC, id DESC LIMIT ?`
- Highest keyset: `WHERE (rating,created_at,id) < (?,?,?) ORDER BY rating DESC, created_at DESC, id DESC LIMIT ?`

### 4. Realtime (Socket.IO)

- [x] `app/api/socket/route.ts` with Node runtime and CORS origins restricted to app
- [x] Rooms: `feedbacks` (global), `event:<event_id>` (scoped)
- [x] On create → server emits `feedback.created` with payload (PRD §10)
- [x] Client util to subscribe/unsubscribe based on filters
- [x] Validate room params server-side
- [x] Socket tests: room validation, emission shape

Architecture note:

- Implement `RealtimePublisher` in `infrastructure/realtime/socketPublisher.ts` and inject into `createFeedback` use case.

### 5. Frontend UI/UX (per mocks)

Pages:

- [x] Home: filters (EventSelect, RatingSelect), SortToggle (Newest/Highest), SubmitForm, Live Stream (InfiniteList of FeedbackCard)
- [x] Event view: scoped stream implemented; Summary panel behind feature flag

Components (see `UX Pilot Context.md` and mocks):

- [x] `EventSelect`: dropdown populated from `GET /api/v1/events`
- [x] `RatingSelect`: 1–5 filter
- [x] `SortToggle`: discriminated union `"newest" | "highest"`
- [x] `SubmitForm`: textarea (1–1000), star control, submit; optimistic insert hook in place
- [x] `FeedbackCard`: stars, escaped text, event name, relative timestamp
- [x] `InfiniteList`: IntersectionObserver sentinel, loading row, end-of-list state
- [x] `ReconnectBanner`: shows on websocket drop (polling fallback not yet added)
- [x] `EmptyState` and `ErrorState`

Behaviors:

- [x] Server-first data fetching where possible; minimal client state
- [x] Infinite scroll calls list endpoints with cursor; appends results; `next_cursor=null` ends (de-duped)
- [x] Realtime:
  - [x] If sort=newest: prepend new matching item (de-duped)
  - [x] If sort=highest: ordered insert by `(rating desc, created_at desc, id desc)`
- [x] Output escaping on render (React text render)
- [~] Accessibility: star control clickable; keyboard/ARIA enhancements pending

Tests:

- [ ] Component tests (RTL): controls, validation states, optimistic/pending rows, insertion policy
- [ ] E2E (Playwright): seed → submit → live in second tab → infinite scroll; filters/sort correctness

### 6. Optional AI Summaries (feature-flagged)

- [x] Feature flag `FEATURE_SUMMARIES`
- [x] `GET /api/v1/events/:event_id/summary` route; generates OpenAI summary on-the-fly or returns 404 if disabled
- [x] OpenAI integration:
  - [x] Generate summary from latest N=100 feedback texts for the event
  - [x] Use GPT model to create concise summary of feedback themes and sentiment
  - [x] Handle API errors gracefully (timeout, rate limits, service unavailable)
- [x] Event view summary panel UI (server-rendered; shows fallback text on errors)
- [~] Tests: OpenAI client mocking; route 200/404/500 (done); UI loading states behind flag (pending)

### 7. Hardening, QA, and Docs

- [x] Security posture documented: same-origin app, no auth/cookies; CORS and CORS rationale
- [x] Socket.IO allowed origins locked down in prod
- [ ] API logs and error handling polished
- [x] README with run instructions, env vars, seeds, API docs, realtime, tests, flags
- [ ] Manual QA checklist (from PRD §19) executed

Notes (Step 7):
- Introduced `ALLOWED_ORIGINS` (comma-separated) for Socket.IO CORS. In production, explicit origins are required; dev defaults to `*` for convenience.
- Documented security posture and manual QA checklist in `README.md`.
- Fixed Next.js 15 dynamic route warnings by awaiting `params` in event page and summary API.

---

## Dependency Graph (high-level)

- Setup → Schema/Seeds → Domain → Application (Ports/Use Cases) → Infrastructure (Repos/Realtime/AI) → API (route handlers) → Frontend → Optional summaries → Hardening

---

## Acceptance Criteria (mapped from PRD)

- Realtime updates across tabs in ~1–2s; reconnect banner and polling fallback
- Infinite scroll smooth with hundreds of rows; deterministic keyset order
- Filters/sort correct; non-matching realtime items ignored
- Submission validation and optimistic insert with reconcile
- Output escaped; XSS attempt renders as text
- Tests: unit/integration/E2E passing; CI green

---

## Testing Strategy

Unit/Component (Vitest + RTL):

- Cursor helpers: encode/decode, strict tuple inequality
- Query builders: newest/highest filters and limits
- Components: star radio group accessibility; optimistic states; insertion policy

Request/Integration:

- Route handlers: 200/400/404/422; pagination envelopes; index-backed ordering
- Socket emission: `feedback.created` on POST; room scoping

Domain/Application:

- Use cases unit-tested with in-memory fakes for ports; verify sorting/cursor logic and side-effects contracts.
- Contract tests for infrastructure adapters to ensure behavior matches port expectations (e.g., repository ordering, publisher topic names).

E2E (Playwright):

- Happy path: seed → open two tabs → submit → live appears → scroll loads more → filters and sort

Coverage target: high on core logic; do not chase 100% where brittle.

---

## Performance & Ops

- Align composite indexes with ORDER BY + tuple WHERE (include `id` for tie-break)
- Include `event_name` in API payloads to avoid N+1
- Cache and revalidation: use server-side fetch with explicit `{ next: { revalidate } }` or `no-store` intentionally
- WebSocket origins restricted to app origin(s)

---

## Risks & Mitigations

- Keyset pagination bugs → property-style tests; careful tuple comparisons
- Realtime flakiness → reconnect banner + polling fallback of first page every 5s
- XSS via user text → store raw; escape on render; explicit test with `<script>` and `<img onerror>`
- Highest-sort insertion complexity → acceptable cutline to append + refresh hint; document
- OpenAI instability → feature flag; fail silent; retries/backoff; UI hides panel

---

## Environment & Configuration

Env vars (see PRD §22):

```
FEATURE_SUMMARIES=true
OPENAI_API_KEY=...
DATABASE_URL=...
REDIS_URL=redis://redis:6379/0
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3000
# App base URL (used for links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Socket.IO allowed origins (protocol + host, comma-separated for multiple). Required in prod.
ALLOWED_ORIGINS=http://localhost:3000
```

---

## Execution Checklist (condensed)

### Day 1 (vertical slice first)

- [ ] Scaffold app + tooling; CI green
- [ ] Prisma schema + seeds
- [ ] `GET /api/v1/events`, `GET /api/v1/feedbacks` (newest)
- [ ] Home page with stream (server-render first page), InfiniteList fetching

### Day 2

- [ ] Add `POST /api/v1/feedbacks` + validation; optimistic insert
- [ ] Socket.IO server + client; broadcast on create; reconnect banner
- [ ] Filters (event, rating), sort (highest) and insertion policy

### Day 3 (optional/extras)

- [x] Event view with summary panel (behind flag)
- [ ] Background job cadence; `summary.updated` broadcasting
- [ ] Polish, QA, README

---

## References to Mocks

- Home page layout: `docs/design/home-page.png`
- Event page with summary: `docs/design/event-page.png`

Map components to visuals: controls bar (EventSelect, RatingSelect, SortToggle), SubmitForm (sticky), Live Stream cards with star icons and relative timestamps, AI Summary panel on event page.

---

## Definition of Done

- Running app locally via Docker or `pnpm dev`
- API matches PRD §9; pagination stable; realtime broadcasts on create
- Frontend implements mocks with accessible components and smooth infinite scroll
- Tests passing; CI green; README complete; security posture documented
