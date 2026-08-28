# Abol Store — SQLite → PostgreSQL migration

This project is fully compatible with PostgreSQL **without any schema changes**:
- No native enum columns are used — status/type/inventoryMode fields are `String`
  with documented allowed values, so Prisma maps them to PG `TEXT` automatically.
- Money is stored as integer تومان (no floats), which is portable.
- Driver adapters are used, so switching the datasource provider + adapter is the
  whole migration.

## 1. Prerequisite

A PostgreSQL 14+ database reachable from the deployment environment.

## 2. Switch the datasource

### `prisma/schema.prisma`
Change the datasource provider to PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
}
```

(Keep `url = env("DATABASE_URL")` out — the URL is injected by `prisma.config.ts`.)

### `prisma.config.ts`
No change needed — it reads `DATABASE_URL` from env. Set production URL like:

```
DATABASE_URL="postgresql://user:password@host:5432/abols?schema=public"
```

## 3. Runtime adapter

`src/lib/prisma.ts` currently uses the better-sqlite3 driver adapter. For PostgreSQL
install the pg driver adapter:

```bash
npm install @prisma/adapter-pg pg
npm install -D @types/pg
```

Then change `src/lib/prisma.ts` to:

```ts
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = (globalThis as any).prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;
export { prisma };
```

## 4. Create the first PG migration

```bash
npx prisma migrate dev --name init
```

If `prisma migrate deploy` is preferred in CI (non-interactive):

```bash
npx prisma migrate deploy
```

## 5. Seed

```bash
npm run db:seed
```

(The seed is idempotent via upserts and works with either database.)

## 6. Receipt storage

Receipt images currently live on disk under `public/uploads/receipts/`. On a
serverless deployment (Vercel/Render) the filesystem is ephemeral — move receipts to
S3/R2/CloudFlare and store only the object URL in `PaymentReceipt.imagePath`.
`src/lib/receipts.ts` is the single place to change for this.

## 7. Production checks after switching

- [ ] `npm run db:migrate` succeeds and `npx prisma validate` is clean.
- [ ] `npm run test` passes against the new DB.
- [ ] `npm run build` succeeds.
- [ ] Login, checkout, receipt upload, tracking and admin reviews all work end-to-end.