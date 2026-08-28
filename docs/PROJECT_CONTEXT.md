# Abol Store — Project Context

## Business
Abol Store (ابول استور) is a professional Persian online store for the Call of Duty
Mobile community. It sells three product families:

1. **CP packages** (COD Points) — each CP amount is its own product (80, 420, 880, ...).
2. **Game accounts** — rich products with region, level, skins, guns, media and custom fields.
3. **Combo packages** — fixed predefined bundles now; customizable bundles later.

Primary goals: brand credibility, customer trust, professional presentation, and a
simple **mobile-first** ordering experience (≈98% of traffic is mobile).

## Language, direction & design
- Fully **Persian**, **RTL**, prices in **تومان**.
- Mobile-first, fully responsive.
- Dark, modern, minimal, premium identity: black, gold, silver, neutral dark grays.
- Persian typography via self-hosted **Vazirmatn** (no fragile runtime font deps).
- Real logo will live at `public/logo.png`; UI must show a safe text fallback until then.

## Customers & authentication
- **Guest checkout** and **registered accounts** both supported.
- Initial login: **mobile number + password**.
- Mobile verification is **manual by the admin** for now (SMS later).
- Passwords are always hashed (bcryptjs) — never stored or logged in plain text.
- **Game-account credentials (CoD email/password) are NEVER stored.** Customers send
  game login info through support after ordering when required.

## Payment & fulfillment
- First method: **Iranian card-to-card**. One active card, editable in admin.
- Customer uploads a **receipt image**; order becomes «در انتظار بررسی مدیر».
- Admin approves or rejects (with a reason visible to the customer).
- **Manual fulfillment** first; architecture allows automation later.
- No online gateway, no SMS, no Telegram/Rubika API, no live chat in the MVP.

## Data & platform
- **Next.js 16 (App Router)** + **TypeScript** + **Tailwind CSS v4**.
- **Prisma 7** ORM with **driver adapters**.
- **SQLite now** (local dev) → **PostgreSQL later**. Schema avoids SQLite-only
  assumptions (money stored as integer تومان; status/type/role fields are strings
  with documented allowed values instead of DB enums so workflows stay configurable).
- Admin login at **`/admin/login`**, admin dashboard at **`/admin`**.
- Initial administrator created by an **idempotent Prisma seed** reading `ADMIN_PHONE`
  and `ADMIN_PASSWORD` from the environment.

## Rules
- **No automatic Git commits** are ever created by the assistant.
- Secrets live only in `.env` (git-ignored). `.env.example` holds safe placeholders.
- Demo financial/contact data only — no real bank or contact information seeded.
