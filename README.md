This is the Event Feedback HUB app. See `docs/Implementation Plan.md` for scope.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `dev`: start dev server
- `build`: production build
- `start`: start production server
- `lint`: ESLint
- `typecheck`: TypeScript check
- `format`: Prettier write
- `format:check`: Prettier check
- `test`: Vitest unit tests
- `test:e2e`: Playwright E2E tests
- `ci`: lint + typecheck + unit tests with coverage

## Docker

```bash
docker build -t event-feedback-hub .
docker run -p 3000:3000 event-feedback-hub
```

## Database

- Copy env: `cp .env.local.example .env.local` and set `DATABASE_URL`
- Start DBs: `make db-up`
- Prisma: `make prisma-generate`, `make prisma-migrate`, `make prisma-studio`

## Environment

Copy `.env.local.example` to `.env.local` and set the following variables:

```
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

 
NEXT_PUBLIC_POLL_INTERVAL_MS=5000

# Feature flags
FEATURE_SUMMARIES=false

# OpenAI (only if summaries are enabled)
OPENAI_API_KEY=

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
```

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
 
