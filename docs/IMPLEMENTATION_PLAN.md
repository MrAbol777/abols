# Abol Store — Implementation Plan

Ordered phases. Each phase should end with passing typecheck, lint, and (from Phase 2
onward) a successful production build, plus updated `docs/PROGRESS.md`.

## ✅ ALL PHASES COMPLETE — see `docs/PROGRESS.md` for the latest status.

## Phase 1A — Data foundation ✅
Prisma 7 + SQLite via better-sqlite3 driver adapter, full schema, initial migration,
idempotent seed (admin from env, categories, products, settings, testimonial, FAQ,
blog), Prisma client singleton, env files, npm scripts, docs.

## Phase 2 — Public storefront ✅
Global RTL + Persian theme (black/gold/silver design tokens, Vazirmatn font), reusable
UI primitives (button, card, input, badge, container, headings), homepage: header +
logo fallback, hero, category cards (CP/account/combo), featured products, trust
indicators, testimonials preview, FAQ preview, about preview, footer, floating support
button + support popup, static content pages.

## Phase 3 — Authentication ✅
Session model + HTTP-only secure cookies, admin login at `/admin/login`,
protected `/admin`, logout, login validation (Zod) with friendly Persian errors, basic
login-attempt rate limiting. Customer registration/login with mobile + password.

## Phase 4 — Cart & checkout ✅
Cart (client) + server-side price calculation (never trust client prices), guest and
registered checkout, per-product custom checkout fields, order + order items created
with immutable price snapshots, public tracking code, order tracking page.

## Phase 5 — Card-to-card receipt flow ✅
Receipt image upload (restricted types/size), order status → «در انتظار بررسی مدیر»,
admin approve/reject with reason surfaced to the customer, order status history.

## Phase 6 — Customer dashboard ✅
Orders list, order detail, status history, profile, submit reviews for completed orders.

## Phase 7 — Admin dashboard ✅
Responsive dashboard shell (sidebar/mobile nav), summary cards from DB, recent orders,
quick links, role-ready structure.

## Phase 8 — Product management ✅
CRUD for categories & products, media, attributes, checkout fields, inventory modes,
featured/best-selling/special-offer flags.

## Phase 9 — Order management ✅
Order list/detail, status transitions, receipt review, manual mobile verification,
admin notes, per-product cancellation/refund rules.

## Phase 10 — Reviews, discounts, blog & support ✅
Review moderation + manual testimonials, discount codes / time-limited / special
offers, blog CRUD, support message inbox, editable site settings (card, Telegram,
Rubika, support text, homepage content).

## Phase 11 — Testing & deployment prep ✅
Automated tests (Vitest + Playwright E2E), migrate SQLite → PostgreSQL guide,
environment/secret review, security hardening, production build & deployment
configuration.
