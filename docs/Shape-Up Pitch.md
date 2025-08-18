# Pitch — Event Feedback HUB (Shape Up)

## 1) Problem

TrustLayer hiring team wants a small but real Next.js + React (TypeScript) app that proves:

(a) solid product instincts
(b) correct REST API design with Next.js route handlers
(c) realtime via WebSockets (Socket.IO)
(d) infinite scroll with keyset pagination
(e) code quality (BDD, CI, lint)

---

## 2) Appetite & Cutline

- **Must fit in 1 build day.** I’ll ship a coherent vertical slice early, then layer features in slices.
- **Cutline if time runs short (in order):**
  1) Drop *Event View* page (keep global feed + filter by event).  
  2) Keep WS realtime; if flaky, degrade to polling the first page every 5s and surface a “reconnecting” banner.  
  3) Keep “highest” sort on the API but skip real-time *re-insertion* logic client-side (append and rely on refresh).

---

## 3) Solution Concept (Breadboard)

```
[Home] ── shows → [Submit Form] + [Filters/Sort] + [Live Stream]
  | submit POST /api/v1/feedbacks
  |→ optimistic insert
  |← 201 + broadcast(feedback.created)
  stream subscribes:
    - Global room "feedbacks"
    - Event-scoped room "event:<id>" (when an event filter is set)
  infinite scroll via GET /api/v1/feedbacks?…&cursor=…
[Event View] (optional)
  | GET /api/v1/events/:id/feedbacks
  | GET /api/v1/events/:id/summary (feature-flagged)
```

**Interface sketch (fat marker):**

```
+------------------------------------------------------+
| Events Feedback HUB                                  |
| [Event ▼] [Rating ▼]  Sort: (● Newest ○ Highest)     |
|                                                      |
| [Your feedback .................] [★☆☆☆☆] [Submit]   |
|                                                      |
| ─ Live Stream ────────────────────────────────────   |
|  ★★★★★  "Loved it!"       Workshop A   2m ago       |
|  ★★☆☆☆  "Too long"        Keynote      5m ago       |
|  ... (infinite scroll) ...                           |
+------------------------------------------------------+
```

---

## 4) Out of Bounds / No-Gos

- Auth, profiles, moderation, rate limiting.
- Edit/delete feedback.
- Multi-language.
- Any HTML/Markdown rendering of user text (escape on render only).

---

## 5) Key Decisions (locked for build)

- **Security mode:** Same-origin app (Next.js serves UI + API). Avoid cookies for anonymous flows; if cookies added, use SameSite=Lax. Socket.IO origins limited to the app origin.
- **Pagination:** Keyset cursors, opaque `base64url(JSON)` with `{v:1, sort:"newest"|"highest", k:[…]}`.
- **Realtime:** Socket.IO. Broadcast to `"feedbacks"` (global) and `"event:<id>"` (scoped).
- **(Optional) OpenAI summaries:** Recompute **whichever comes first**: debounce **5 minutes** since last change, or every **10 new feedbacks** per event. Store in `event_summaries` and broadcast `summary.updated`.
- **Timestamps:** `created_at` RFC3339 in API. All ordering uses `(… DESC, id DESC)` tie-break.
- **API shape & routes:** Exactly as PRD §9 (plural, `/api/v1`).

---

## 6) Scopes

### Scope A — Project Skeleton & CI (Downhill)
- Next.js app (App Router), Postgres, Redis, Socket.IO server endpoint.
- Tailwind + shadcn/ui.
- Docker compose: `web` (Next.js), `db` (Postgres), `redis`.
- CI (GitHub Actions): Node setup, DB/Redis services, ESLint/Prettier, Vitest.

**Demo:** CI green on a hello endpoint; Next.js page renders with Tailwind.

---

### Scope B — Data Model & Seeds (Steep → Downhill)
- Prisma schema + constraints:
  - `Event(id uuid @id, name String @unique)`
  - `Feedback(id uuid @id, eventId uuid, rating Int, text String, createdAt DateTime @default(now()))`
  - Optional `EventSummary(eventId uuid @id, summary String, updatedAt DateTime)`
- Indexes aligned to keyset (global + per-event, newest + highest).
- Seeds: 4–6 events, 200–400 feedback rows spread across last 24–72h.

**Demo:** `prisma db push` + `prisma db seed` complete; quick psql spot-checks.

---

### Scope C — Listing API + Keyset (Steep)
- `GET /api/v1/events` (for dropdown).
- `GET /api/v1/feedbacks` with filters: `event_id?`, `rating?`, `sort=newest|highest`, `cursor?`, `limit<=50`.
- `GET /api/v1/events/:event_id/feedbacks` (same envelope).
- Early parameter coercion & error envelopes from PRD.
- Property-style tests verifying ordering, cursor progression, end-of-list `next_cursor=null`.

**Demo:** Curl scripts showing pagination and sorting with stable order.

---

### Scope D — Submission + Broadcast (Steep)
- `POST /api/v1/feedbacks` validations (existence, bounds, trimming, escape on render).
- Broadcast payload per PRD §10 to global and event rooms via Socket.IO.
- Room param whitelist/validation.

**Demo:** Two browser tabs; submitting shows ~1–2s live update in both.

---

### Scope E — Frontend UX (Downhill)
- Components: `EventSelect`, `RatingSelect`, `SortToggle`, `SubmitForm`, `FeedbackCard`, `InfiniteList`.
- Infinite scroll (IntersectionObserver) calling list API with cursor.
- Optimistic insert: render pending row with “sending…”; reconcile with server on 201.
- Realtime client: subscribe to `"feedbacks"` and (if filtered) `"event:<id>"`; ignore mismatched items; insertion policy:
  - **Newest:** prepend.
  - **Highest:** insert by `(rating desc, created_at desc, id desc)` *or* (cutline) append + refresh on interval.

**Demo:** Smooth scroll, filters, sort toggle, live updates.

---

### Scope F — (Optional) Summaries (Downhill)
- Feature flag `FEATURE_SUMMARIES=true`.
- `GET /api/v1/events/:event_id/summary`.
- Background job: coalesce per event; recompute on cadence; broadcast `summary.updated`.
- UI panel on Event view; live update.

**Demo:** Toggle flag on; seed few opinions; see bullets appear.

---

## 7) Risks & Rabbit Holes (with mitigations)

- **Keyset bugs** (off-by-one, unstable order).  
  → Property tests asserting strict tuple inequality and deterministic order with ties.
- **Realtime flakiness.**  
  → Health indicator + fallback polling of first page every 5s. Log reconnects.
- **Frontend re-ordering for “highest”.**  
  → Keep insertion simple; if time is tight, append and manual refresh. Mark as cutline.
- **OpenAI API instability.**  
  → Feature flag; fail silent; job retries with backoff; UI hides panel if unavailable.
- **XSS via text.**  
  → Store as-is; escape on render; add explicit test with `<script>` and `<img onerror>`.

---

## 8) Testing & QA (acceptance from PRD mapped to BDD)

- **Server:** request tests for route handlers (filters, sorts, keyset traversal, error envelopes 400/404/422).
- **Sockets:** room subscription validation, payload schema, broadcast on create.
- **E2E (Playwright):** happy path: seed → submit → appears across tabs → scroll loads more.
- **Frontend (React):** components with Testing Library; keyboard accessibility for stars.
- **Coverage:** V8 via Vitest.

---

## 9) Implementation Notes (how, not tasks)

- **Next.js skeleton**
  - Route handlers under `app/api/v1/.../route.ts`.
  - Socket.IO server endpoint under `app/api/socket/route.ts` (Node runtime) or a custom server.
  - Zod schemas for input validation; return RFC3339 `created_at`.
- **Keyset**
  - Newest: `WHERE (created_at,id) < (?,?) ORDER BY created_at DESC, id DESC LIMIT ?`
  - Highest: `WHERE (rating,created_at,id) < (?,?,?) ORDER BY rating DESC, created_at DESC, id DESC LIMIT ?`
  - Cursor encode/decode helpers + versioning.
- **Sockets**
  - Restrict origins; server emits both global and event rooms on create.
- **Frontend**
  - Minimal client fetching, server-first rendering where possible.
  - Accessibility: star radio group with labels “1 star”…“5 stars”, keyboard 1–5, arrow keys.
- **Dev ergonomics**
  - Docker `compose up`, `pnpm test`, `pnpm ci` for convenience.

---

## 10) Milestones / Demos (hill chart checkpoints)

1. **Skeleton up (Downhill starts):** CI green, Next.js page renders with Tailwind.  
2. **Data + Seeds:** DB constraints proven; seed script done.  
3. **List API w/ keyset:** curl demo of sorting & cursor progression.  
4. **Submit + Broadcast:** 201 + WebSocket message; two-tab demo.  
5. **Frontend UX:** Infinite scroll, filters/sort, optimistic insert, live updates.  
6. **(Optional) Summaries:** Flag on; panel shows & updates.  
7. **Hardening & README:** QA checklist passes; final polish.

---

## 11) Deliverables (Definition of Done, concrete)

- Running app (Docker or `pnpm dev`) with README (env vars, seeds, feature flags, local URLs).  
- REST API as in PRD (§9), passing request specs.  
- Realtime demo with two tabs (~1–2s).  
- Infinite scroll (keyset) smooth for a few hundred rows.  
- CI green: ESLint/Prettier, Typecheck, Vitest.  
- Security posture documented (same-origin + CORS/CSRF stance).  
- (Optional) Summaries behind `FEATURE_SUMMARIES`.

---

## 12) README Outline (to include in repo)

- **Overview** & PRD link/summary  
- **Stack**: Next.js 14 (App Router), React, TypeScript, Tailwind, Postgres, Prisma, Redis, Socket.IO  
- **Run locally**: `docker compose up` or `pnpm install && pnpm dev`  
- **Env vars**: (from PRD §22)  
- **Seeding**: `prisma db push && prisma db seed`  
- **API docs**: endpoints & example payloads  
- **Realtime**: rooms and expected messages  
- **Testing**: `pnpm test` (Vitest) and `pnpm test:e2e` (Playwright)  
- **Feature flags**: `FEATURE_SUMMARIES`  
- **Security**: CSRF/CORS choice  
- **Notes**: Cutlines, known limitations

---

## 13) What “Good” Looks Like (hiring signals)

- Small, sharp vertical slices landing end-to-end early.  
- Clean, idiomatic Next.js route handlers and Prisma queries; input validation at the boundary; lean queries.  
- Deterministic keyset pagination backed by correct composite indexes.  
- Accessible, responsive UI with clear state handling (optimistic insert/reconcile).  
- Tests that read like specs, not just coverage games.  
- README that lets a reviewer run the app in minutes.
