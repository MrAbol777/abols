# Deploying Abol Store (production)

## Overview

Stack: Next.js 16 (App Router) + Prisma 7 + better-sqlite3 (dev) / PostgreSQL
(prod) + Tailwind v4. SQLite is for local development only.

> **Before production, read `docs/POSTGRES_MIGRATION.md`.** SQLite does not run
> reliably on most serverless platforms and is single-instance. The app is fully
> portable to PostgreSQL with no schema changes.

## 0. Quick checks (run before every deploy)

```bash
npm ci
npm run check      # typecheck + lint + unit/integration tests + build
npm run test:e2e   # Playwright browser smoke tests (needs a local Edge/Chrome)
```

## 1. Environment

Set `NODE_ENV=production` and provide:
- `DATABASE_URL` (PostgreSQL — see the migration guide)
- `AUTH_SECRET` (long random string) — used to sign HTTP-only session cookies
- `ADMIN_PHONE` / `ADMIN_PASSWORD` (only needed once for seeding)

Never commit `.env.production`. `.env.production.example` lists all variables.

## 2. Database

```bash
npm run db:migrate      # apply migrations
npm run db:seed         # create admin + catalog (idempotent)
```

## 3. Build & run (Node host — e.g. a VPS / Docker)

```bash
npm run build
npm run start           # serves the production build on :3000
```

### Docker

The `better-sqlite3`/`pg` native modules require a matching Node ABI. Build the
image on the same Node major version as the runtime (Node 20 LTS):

```dockerfile
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]
```

## 4. Serverless (Vercel / Netlify)

- Move to PostgreSQL (see migration guide); the better-sqlite3 native module is
  not suitable for serverless.
- Move receipt uploads off local disk to object storage (`src/lib/receipts.ts`).
- Set the env vars listed in section 1 in the dashboard.
- `next.config.ts` already externalizes `better-sqlite3`; with PG remove it from
  `serverExternalPackages`.

## 5. Rate limiting & concurrency

- Admin-login brute-force protection and the support-form rate limit use the
  **shared pluggable limiter** in `src/lib/rate-limit.ts`. The default store is
  in-memory (single process). For multi-instance/serverless, call
  `setRateLimitStore(...)` on startup (e.g. in `instrumentation.ts`) with a
  Redis-backed store implementing `RateLimitStore` so counters are shared.
- `better-sqlite3` (dev) is single-writer; for production the PG transaction in
  `placeOrder` guarantees inventory/discount integrity across requests.

## 6. Backups

- PostgreSQL: enable point-in-time backups of the `abols` database.
- Receipt images in object storage: enable versioning/retention.