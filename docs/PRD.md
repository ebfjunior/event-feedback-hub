# PRD — Event Feedback HUB

## 1) Summary

A lightweight, anonymous web app to **submit** and **browse** event feedback in near–real time. Users pick an event, write open-ended feedback, choose a 1–5 star rating, and see a **live stream** with filters, sorting, and infinite scroll. **Optional:** OpenAI-generated per-event summaries.

---

## 2) Goals, Non-Goals & Success Indicators

### Goals
- Clean, responsive, accessible UI for **anonymous** feedback.
- **Realtime** global & per-event streams via **WebSockets (Socket.IO)**.
- **Server-side** filtering (event, rating), sorting (newest/highest), **infinite scroll** with keyset pagination.
- Solid code quality: **Next.js (App Router) + React (TypeScript)**, **Tailwind CSS + shadcn/ui**, **BDD tests (Vitest/RTL + Playwright)**, **CI**, **ESLint/Prettier**.
- **Optional:** OpenAI per-event summary behind a feature flag.

### Non-Goals
- Auth, profiles, moderation, spam/rate limiting.
- Edit/delete feedback.
- Multi-language (English-only).

### Success Indicators
- Realtime updates across tabs within **~1–2s**.
- Infinite scroll is smooth with **hundreds** of rows.
- High test coverage (backend + frontend, BDD).
- CI green on PRs: lint + tests.

---

## 3) Personas & Primary Flow

**Anonymous Visitor**
- **Submit:** select event → text (1–1000 chars) → rating (1–5) → submit.
- **Browse:** global feed by default; filter by event/rating; sort; infinite scroll.
- **(Optional)** Read AI summary on event view.

---

## 4) User Stories & Acceptance Criteria (BDD)

- Submit success & validation failures.
- Realtime broadcasts (global/per-event).
- Filters + sort correctness.
- Infinite scroll via cursor.
- (Optional) Summary panel + live updates.

---

## 5) Functional Requirements

### 5.1 Submission Form
- **Fields:** `event_id` (dropdown), `text` (open), `rating` (1–5).
- **Validations (server):**
  - `event_id` required & exists.
  - `rating` integer ∈ [1..5].
  - `text` trimmed length 1–1000.
- **Sanitization/Rendering:** store user text **as provided**; **escape on render** (no HTML rendering). This preserves values like “<3” while remaining XSS-safe.
- **UX:** optimistic insert; reconcile with server payload.

### 5.2 Feedback Stream
- **Realtime transport:** WebSockets via Socket.IO.  
  - Global room: `feedbacks`.  
  - Per-event room: `event:<event_id>`.
- **Broadcast on create:** payload schema in §10.
- **Filters:** `event_id` (single), `rating` (single).
- **Sorting:**
  - `newest` (default): `created_at desc, id desc`.
  - `highest`: `rating desc, created_at desc, id desc`.
- **Pagination:** **keyset** cursors (`cursor` opaque, `limit` default 20).

### 5.3 Events
- **Seeded** list (name only). Exposed via API for dropdown/filters.

### 5.4 (Optional) AI Summaries
- Input: latest **N=100** feedback texts for event.
- Recompute: **debounce 5 min** after last change **or** every **K=10** new items (choose & document).
- Store in DB; broadcast `summary.updated` on completion.

---

## 6) Non-Functional Requirements

- **Performance:** list endpoint server time < 300ms under demo load (few hundreds).
- **Accessibility:** keyboard-operable star input (radio group), labels, ARIA, contrast.
- **Responsive:** desktop + mobile (Tailwind + shadcn/ui).
- **Security:** CSRF/CORS posture (see §16), input validation at API boundary, DB constraints, output escaping.
- **Observability:** API/server logs sufficient; UI error boundaries not required.

---

## 7) Information Architecture & UI

### Pages
- **Home**
  - Sticky **Submission Form**.
  - **Filters:** EventSelect, RatingSelect.
  - **Sort toggle:** Newest / Highest.
  - **Live Stream** (FeedbackCard rows) with relative timestamps.
  - **Infinite scroll**; empty states.
- **Event View (optional)**
  - Stream scoped to event.
  - **Summary panel** (if enabled).

### Components
`EventSelect`, `RatingSelect`, `SortToggle`, `FeedbackCard`, `InfiniteList`, `SubmitForm`.

---

## 8) Data Model & Constraints

**Event**
- `id: uuid (PK, NOT NULL)`
- `name: string (unique, indexed, NOT NULL)`

**Feedback**
- `id: uuid (PK, NOT NULL)`
- `event_id: uuid (FK → events.id, NOT NULL, indexed)`
- `rating: integer (NOT NULL, CHECK 1..5, indexed)`
- `text: text (NOT NULL, CHECK char_length(text) BETWEEN 1 AND 1000)`
- `created_at: timestamptz (NOT NULL, indexed)`

**EventSummary (optional)**
- `event_id: uuid (PK/FK, NOT NULL, unique)`
- `summary: text (NOT NULL)`
- `updated_at: timestamptz (NOT NULL)`

**Indexes (keyset-aligned)**
- Global newest: `(created_at DESC, id DESC)`
- Global highest: `(rating DESC, created_at DESC, id DESC)`
- Per-event newest: `(event_id, created_at DESC, id DESC)`
- Per-event highest (add if used often): `(event_id, rating DESC, created_at DESC, id DESC)`

---

## 9) API Design (versioned, plural resources)

All endpoints **versioned** under `/api/v1`. JSON. ISO8601/RFC3339 timestamps. Errors use HTTP semantics (422/404/400) with a consistent envelope.

### Events
**GET `/api/v1/events` → 200**
```json
[{ "id": "uuid", "name": "Workshop A" }]
```

### Feedbacks (global)
**GET `/api/v1/feedbacks?event_id=&rating=&sort=newest|highest&cursor=&limit=20` → 200**
```json
{
  "items": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "event_name": "Workshop A",
      "rating": 5,
      "text": "Loved it!",
      "created_at": "2025-08-18T15:34:12Z"
    }
  ],
  "next_cursor": "opaque-or-null"
}
```

**POST `/api/v1/feedbacks` → 201**
```json
{
  "id":"uuid","event_id":"uuid","event_name":"Workshop A",
  "rating":5,"text":"Loved it!","created_at":"2025-08-18T15:34:12Z"
}
```

**422 (validation)**
```json
{
  "error": {
    "code":"validation_error",
    "message":"Invalid parameters",
    "details": { "rating": ["must be between 1 and 5"] }
  }
}
```

**400 (bad parameter shape)**
```json
{ "error": { "code":"bad_request", "message":"Invalid cursor" } }
```

**404 (not found)**
```json
{ "error": { "code":"not_found", "message":"Event not found" } }
```

### Feedbacks (per-event)
**GET `/api/v1/events/:event_id/feedbacks?rating=&sort=&cursor=&limit=` → 200**  
Payload identical to global list; implicitly scoped by `:event_id`.

### Event Summary (optional singular subresource)
**GET `/api/v1/events/:event_id/summary` → 200**
```json
{
  "event_id":"uuid",
  "summary":"- Bullet 1\n- Bullet 2",
  "updated_at":"2025-08-18T15:40:00Z"
}
```
**404** if feature disabled or summary not available.

---

## 10) Realtime (WebSockets via Socket.IO)

**Namespaces/rooms**
- Global room: `feedbacks`.
- Per-event room: `event:<event_id>`.

**Broadcast on create**
```json
{
  "type":"feedback.created",
  "payload":{
    "id":"…","event_id":"…","event_name":"Workshop A",
    "rating":5,"text":"Loved it!","created_at":"2025-08-18T15:34:12Z"
  }
}
```

**(Optional) Summary update**
```json
{ "type":"summary.updated", "payload": { "event_id":"…", "summary":"…" } }
```

**Client behavior**
- `sort=newest`: **prepend** on arrival.
- `sort=highest`: insert by `(rating desc, created_at desc, id desc)`.
- Ignore items that don’t match current filters.

---

## 11) Pagination Strategy

**Keyset (cursor)**
- `newest`: cursor = `{ created_at, id }`; query  
  `WHERE (created_at, id) < (?, ?) ORDER BY created_at DESC, id DESC LIMIT ?`
- `highest`: cursor = `{ rating, created_at, id }`; query  
  `WHERE (rating, created_at, id) < (?, ?, ?) ORDER BY rating DESC, created_at DESC, id DESC LIMIT ?`
- Cursor is **opaque** (e.g., base64-encoded JSON). Validate `sort` to whitelist ORDER.

---

## 12) Accessibility

- Star input is a **radio group** with visually rendered stars and labels “1 star” … “5 stars”.
- Keyboard: 1–5 keys or arrows; clear focus states. WCAG AA contrast.

---

## 13) Architecture & Stack

**Monolith**
- **Next.js 14 (App Router)** with **React** and **TypeScript**.
- **Tailwind CSS + shadcn/ui**.
- **Postgres** with **Prisma ORM**.
- **WebSockets (Socket.IO)** for realtime.
- **Background jobs (optional summaries):** **BullMQ** (Redis) or in-process debounce for take-home.
- **Docker + docker-compose** for Next.js, Postgres, Redis.

**Directory Sketch**
```
app/
  api/v1/events/route.ts               # GET (list events)
  api/v1/feedbacks/route.ts            # GET (list), POST (create)
  api/v1/events/[event_id]/feedbacks/route.ts
  api/v1/events/[event_id]/summary/route.ts
  api/socket/route.ts                  # optional Socket.IO server endpoint
components/
  ui/                                   # shadcn/ui components
  FeedbackCard.tsx, SubmitForm.tsx, ...
lib/
  cursor.ts, queries/feedbacks.ts       # keyset + query helpers
prisma/
  schema.prisma, seed.ts
```

**Routes (Next.js file-based)**
```
/api/v1/events                         → GET
/api/v1/feedbacks                      → GET, POST
/api/v1/events/:event_id/feedbacks     → GET
/api/v1/events/:event_id/summary       → GET (optional)
/api/socket                            → Socket.IO server (if exposed)
```

---

## 14) (Optional) OpenAI Summary — Product & Tech Notes

- **Prompt:** neutral, concise bullets: themes, sentiment, common positives/negatives, notable suggestions.
- **Input:** latest **N=100** feedback texts.
- **Policy:** choose **debounce 5 min** *or* **every K=10** new items; document choice.
- **Resilience:** feature-flagged; if key missing/errors → skip and log; UI hides panel or shows empty state.
- **Broadcast:** `summary.updated` after save via Socket.IO.
- **Storage:** full text in `event_summaries.summary`, `updated_at` tracked (via Prisma).

---

## 15) Quality Plan (BDD) & CI

**Server/API**
- **Vitest**: request tests for route handlers (filters, sort, pagination, errors); socket emission tests; cursor helpers.

**Frontend**
- React components with **@testing-library/react** + **@testing-library/jest-dom**.

**E2E**
- **Playwright** for end-to-end happy path.

**Coverage**
- V8 coverage via Vitest.

**Linters & Hooks**
- ESLint (Next + TS + React Hooks + Tailwind) and Prettier (with Tailwind plugin).

**CI (GitHub Actions)**
- Jobs: `lint`, `typecheck`, `test`.
- Services: Postgres, Redis.
- Steps: checkout → setup Node → install deps → Prisma migrate → ESLint/Prettier check → Vitest → Playwright (optional/nightly).

---

## 16) Security & Privacy

- **CSRF & CORS modes (document which you choose):**
  - **Same-origin app (Next.js serves UI + API):** avoid cookies for anonymous flows; if cookies are introduced, use SameSite=Lax; no CSRF token needed when not using cookies for auth.
  - **Cross-origin SPA:** treat API as stateless JSON (no cookies), enforce CORS allowlist in route handlers.
- **Input validation** with Zod at API boundary; early coercion.
- **DB constraints** (CHECKs) enforce rating/text bounds.
- **Output escaping** everywhere; no Markdown/HTML rendering of user input.
- **WebSockets:** validate/whitelist room params; only server emits on create.

---

## 17) Performance & Ops Notes

- Indexes in §8 align with ORDER BY & tuple WHEREs (include `id` for tie-break).
- Include `event_name` in API payloads to avoid N+1.
- **Socket.IO CORS origins:** restrict to app origin(s) in dev/prod.
- **Background jobs:** BullMQ with Redis; for take-home, an inline debounce worker is acceptable (document).
- **Docker ergonomics:** Next.js app with `NODE_ENV`, Prisma `DATABASE_URL`; tune Node threads modestly.

---

## 18) Seed Data

- Seed several **events** (e.g., “Keynote”, “Workshop A/B”, “Product Panel”).
- Generate **200–400** feedback rows with varied ratings/timestamps for perf testing.

---

## 19) Manual QA Checklist

- [ ] Valid feedback submission → optimistic insert → server reconcile.  
- [ ] Validation errors shown (missing event, rating out of range, text too short/long).  
- [ ] Global stream updates across two tabs in ~1–2s.  
- [ ] Event view scoped correctly; new matching items live-insert.  
- [ ] Filters + sort correctness; non-matching realtime items ignored.  
- [ ] Infinite scroll loads additional pages; `next_cursor` null at end.  
- [ ] XSS attempt is **escaped** on render; no script execution.  
- [ ] Mobile layout & keyboard accessibility for stars.  
- [ ] (Optional) Summary appears/updates; `summary.updated` broadcast handled.

---

## 20) Risks & Mitigations

- **Unmoderated content:** out of scope; rely on escaping; note limitation.  
- **Realtime flakiness:** degrade to polling last page and surface a banner.  
- **Cursor bugs:** request specs + property-style tests for encode/decode & ordering.  
- **OpenAI dependency (optional):** feature flag; debounce/coalesce; graceful failure.

---

## 21) Definition of Done

1. **Skeleton up (Downhill starts):** CI green, Next.js page renders with Tailwind.  
2. **Data + Seeds:** DB constraints proven; seed script done.  
3. **List API w/ keyset:** curl demo of sorting & cursor progression.  
4. **Submit + Broadcast:** 201 + WebSocket message; two-tab demo.  
5. **Frontend UX:** Infinite scroll, filters/sort, optimistic insert, live updates.  
6. **(Optional) Summaries:** Flag on; panel shows & updates.  
7. **Hardening & README:** QA checklist passes; final polish.

---

## 22) Example Env Vars

```
FEATURE_SUMMARIES=true
OPENAI_API_KEY=…
DATABASE_URL=…
REDIS_URL=redis://redis:6379/0
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3000
```