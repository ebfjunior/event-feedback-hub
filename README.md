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
