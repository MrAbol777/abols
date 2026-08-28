# Abol Store — Progress

## Phase 11 follow-up 3 — Polish: users page, content pages, full E2E ✅

### What was implemented
- **`/admin/users`** (last remaining placeholder removed): real customer list with
  registration date, order count, total spent, phone-verification + active/inactive
  badges, and actions (verify phone, activate/deactivate). Non-admin users only;
  admins can never be touched from here.
- **Content pages rewritten from placeholders to real Persian content**
  (shared `ContentPage` + `ContentSection` components):
  `/about` (mission, why us), `/contact` (Telegram/Rubika from live settings + support
  form pointer), `/rules`, `/privacy`, `/refund`, `/tutorial` (6-step guide). FAQ was
  already DB-driven.
- **E2E extended to a real happy path**: `e2e/checkout.spec.ts` now covers add-to-cart →
  cart → checkout (guest) → order created → tracking page shows the code/status → receipt
  image upload → status becomes «در انتظار بررسی مدیر». Also fixed a UX gap the test
  surfaced: the tracking page now displays the tracking code as text (it was only in the URL).
- `e2e/storefront.spec.ts` gained a content-pages smoke test covering all 6 pages.
- AdminShell: «کاربران» no longer marked «بهزودی» — **no placeholder admin pages remain**.

### Commands verified (actually run, passed)
- `npm run test:e2e` ✅ — 12 tests (9 storefront/auth + 3 checkout/receipt happy-path).
- Runtime route audit: `/`, `/shop`, `/shop/cp-420`, `/cart`, `/checkout`, `/tracking`,
  `/login`, `/about`, `/contact`, `/faq`, `/rules`, `/privacy`, `/refund`, `/tutorial`,
  `/blog` all 200.
- `npm test` ✅ (7 files, 40 unit/integration), `npm run typecheck` ✅, `npm run lint` ✅,
  `npm run build` ✅.

### Known limitations (documented, not blocking)
- Receipts on local disk → object storage for serverless (guide in POSTGRES_MIGRATION).
- Redis store for rate limiting in multi-instance (pluggable via setRateLimitStore).
- No CI YAML committed yet; `npm run check` + `npm run test:e2e` are the CI commands.

---

## Phase 11 follow-up 2 — E2E browser tests (Playwright) ✅

### What was implemented
- `@playwright/test` + `playwright.config.ts`:
  - Uses the locally-installed Edge/Chrome via `channel: "msedge"` (no bundled
    Chromium download needed on machines that have a browser).
  - `webServer` auto-builds and starts `next start -p 3100` before the run; supports
    `reuseExistingServer` in dev and CI retries.
  - Single desktop-chromium project; trace on first retry.
- `e2e/storefront.spec.ts` — 9 smoke tests:
  - Public: homepage (title+h1+CTA), shop listing + category filter against seeded data,
    product detail (price + add-to-cart), tracking gracefully shows "not found".
  - Customer auth: login tabs, register → redirect to /dashboard, unauthenticated
    /dashboard → /login.
  - Admin: login page rejects bad creds with the generic (non-revealing) error; /admin
    redirects to /admin/login when unauthenticated.
- Fixed a real a11y bug the tests surfaced: password inputs in the customer auth forms
  had no `id`/`htmlFor` association — labels now correctly map (`login-password`,
  `reg-password`).
- `npm run test:e2e` script added; `.gitignore` covers `test-results/`, `playwright-report/`.

### Commands verified (actually run, passed)
- `npm run test:e2e` ✅ — 9/9 passed (~23s) against a production build.
- `npm test` ✅ (7 files, 40 unit/integration), `npm run typecheck` ✅, `npm run lint` ✅.

### Known limitations
- E2E uses a real browser and the local SQLite DB; the register test creates a throwaway
  user (acceptable for the local dev DB). Full checkout + receipt-upload flows are not yet
  covered (needs a stable seeded order + file upload fixtures).
- No CI YAML committed yet; `npm run check` (typecheck+lint+unit+build) and
  `npm run test:e2e` are the two commands CI should run.

---

## Phase 11 follow-up — Shared rate limiting ✅

### What was implemented
- `src/lib/rate-limit.ts` — a single, reusable, **pluggable** rate limiter:
  - `createRateLimiter({ max, windowMs, store })` with three operations matching the
    original semantics: `check(key)` (read-only, no increment), `recordFailure(key)`
    (increment + lazy window expiry), `reset(key)`.
  - `RateLimitStore` interface + default in-memory store. `setRateLimitStore(store)`
    (e.g. in `instrumentation.ts`) swaps in a Redis-backed store for multi-instance
    deployments without touching the call sites.
- Refactored both existing limiters onto the shared lib:
  - Admin login (`src/app/admin/auth-actions.ts`) — 5 attempts / 15 min, per IP+phone.
  - Support form (`src/app/actions.ts`) — 5 requests / 10 min per IP.
- `npm run check` script added: `typecheck && lint && test && build` (one command for CI).
- `docs/DEPLOYMENT.md` updated to document `setRateLimitStore` for Redis.

### Commands verified (actually run, passed)
- `npm test` ✅ — 7 files, 40 tests (added `rate-limit.test.ts`: locks at max, check()
  doesn't increment, reset works, window expiry).
- `npm run typecheck` ✅, `npm run lint` ✅, `npm run build` ✅.

---

## Phase 11 — Testing & deployment prep ✅ COMPLETE

### What was implemented
- **Automated tests (Vitest)** — `npm test`:
  - `vitest.config.mts` with `@` alias, `tests/setup.ts` (loads dotenv, safe AUTH_SECRET).
  - Unit tests: Persian digit/formatting (`format`), Zod schemas (mobile normalization,
    login, checkout fields), status labels/tones, tracking-code generator, discount math
    (`src/lib/pricing.ts` — extracted pure, DB-free resolver), and receipt file validation
    (magic bytes, content type, size, real PNG written+cleaned up).
  - DB-backed integration tests (`orders.integration.test.ts`): create order + lookup by
    tracking (items + history), unknown code → null, admin list/detail reads, status filter.
    Runs against local `dev.db`; cleans up its rows.
- **Security hardening**:
  - `next.config.ts` headers for all routes: `X-Content-Type-Options: nosniff`,
    `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` (no camera/mic/geo),
    `X-DNS-Prefetch-Control: off`, plus `serverActions.bodySizeLimit`.
  - `src/lib/pricing.ts` center of discount math (pure, unit-tested).
  - Documented in README + docs: bcrypt passwords, HTTP-only hashed sessions,
    server-side-only prices, in-memory rate limiting (Redis needed for multi-instance).
- **Production readiness**:
  - `.env.production.example` (PostgreSQL URL, AUTH_SECRET, admin creds).
  - `docs/POSTGRES_MIGRATION.md` — schema is already portable (no PG enums, money as Int);
    steps to switch provider + `@prisma/adapter-pg`, first migration, seed, receipts→object
    storage, post-migration checklist.
  - `docs/DEPLOYMENT.md` — pre-deploy checks, Node host + Dockerfile, serverless notes,
    rate-limiting/concurrency guidance, backups.
  - Rewrote stale create-next-app README into a real project README (features, setup,
    commands, docs links, security notes).

### Commands verified (actually run, passed)
- `npm test` ✅ — 6 files, 36 tests pass (32 unit + 4 integration).
- `npm run typecheck` ✅, `npm run lint` ✅, `npm run build` ✅.
- Runtime: `/` 200 with `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin` on the response.

### Known limitations (tracked for future work)
- Rate limiters (admin login, support form) are in-memory per-process — replace with a
  shared store (Redis) for multi-instance/serverless.
- Receipts are served from `public/` local disk — must move to object storage on
  serverless deployment.
- No CI workflow or end-to-end (Playwright) browser tests yet; current coverage is
  unit + DB integration.

---

## Phase 10 — Reviews, discounts, blog, support & settings ✅ COMPLETE

### What was implemented
- **Settings editor** (`/admin/settings` + `SettingsForm`): brand name, demo successful-order
  count, card holder/number, Telegram/Rubika URLs, support text — saved to the singleton
  `SiteSetting` (validated with `settingsSchema`).
- **Support inbox** (`/admin/support`): list of `SupportMessage`s (new/all filter), mark as
  READ or RESOLVED.
- **Review moderation** (`/admin/reviews`): pending/approved/all filters, approve/unapprove,
  toggle official testimonial, delete. Approving publishes the review to the homepage
  testimonials section.
- **Discount codes** (`/admin/discounts` + `DiscountForm`): create (percentage or fixed,
  optional min order / usage limit / start & end window), activate/deactivate, delete.
- **Discounts applied at checkout**: `resolveDiscount` in `placeOrder` validates the code
  server-side (active, window, usage limit, min order) and computes the discount server-side
  (never trusts the client). Discount is stored on the order (`discountAmount`, `discountId`)
  and usage count is incremented in the same transaction. Checkout form gained an optional
  code field.
- **Blog** (`/admin/blog`, new/edit): create/update/delete posts, publish/unpublish.
  Public pages added: `/blog` listing + `/blog/[slug]` article (published only).
- AdminShell: «نظرات», «تخفیفها», «پشتیبانی», «وبلاگ», «تنظیمات» no longer «بهزودی».
  Only «کاربران» remains a placeholder (Phase 9 admin-only customer list is minor).

### Commands verified (actually run, passed)
- `npm run typecheck` ✅, `npm run lint` ✅, `npm run build` ✅ (all phase-10 routes built).
- Runtime: `/blog` and `/` 200.
- DB round-trip via temp script: discount create + percentage math, settings read/update,
  support message create + status change, blog create + published filter — all pass; test
  rows removed and brand restored.

### Known limitations
- Discount usage-limit is checked pre-transaction (small race window in a single process is
  acceptable for MVP); order stores the applied discount so refunds stay consistent.
- Blog content is plain text (no rich text / markdown editor yet).
- «کاربران» admin page is still a placeholder (no customer list UI yet).

### Remaining work
- Phase 11: automated tests, SQLite → PostgreSQL migration, env/secret review, security
  hardening, production deployment config.

---

## Phase 9 — Order management (admin) ✅ COMPLETE

### What was implemented
Built on the Phase 5 foundation (order list/detail, receipt approve/reject) with the
missing management pieces:
- `OrderActions` panel on `/admin/orders/[id]` merging all status controls:
  - Save an internal admin note (`adminNote`, not shown to customers; displayed on the
    order detail as «یادداشت داخلی مدیر»).
  - `markOrderNeedsInfo` — transfer to NEEDS_INFO with a required reason recorded in
    history (and visible to the customer on the public tracking page).
  - `markOrderProcessing` / `markOrderCompleted` (from Phase 5) moved into the same panel.
  - `cancelOrder` with optional reason — marks CANCELLED and **restores EXACT_QUANTITY
    inventory** so cancelled stock isn't lost; reopen button restores AWAITING_PAYMENT.
  - `verifyOrderPhone` — manually marks the customer's user row `isPhoneVerified`
    (looked up by the order's phone).
- Search + status filter on `/admin/orders`: search by tracking code / phone / customer
  name, combined with the existing status tabs.
- Order detail now shows per-item cancellation/refund policy (from the product snapshot)
  and the existing customer note.
- Removed the old single-purpose `OrderTransitions` component (replaced by OrderActions).
- `getAdminOrders` gained a `query` param; `AdminOrderDetail` gained `adminNote` and per-item
  `cancellationPolicy`.

### Commands verified (actually run, passed)
- `npm run typecheck` ✅, `npm run lint` ✅, `npm run build` ✅.
- DB round-trip via temp script: order created with combo ×2 (stock 50→48), cancel restores
  stock (back to 50), status CANCELLED + 2 history rows, admin note + phone verify paths
  exercised. Test data cleaned up and combo stock restored.

### Known limitations
- NEEDS_INFO currently only lives on the admin side + public tracking status label; the
  customer has no dedicated "edit my order info" form yet (could be added in Phase 10/11).
- Cancel does not push an automatic refund record — it's a status + stock restoration
  (payment refunds are handled out-of-band with card-to-card).
- `reopenCancelledOrder` returns the order to AWAITING_PAYMENT (re-pay path).

### Remaining work
- Phase 10: reviews moderation + testimonials, discount codes, blog CRUD, support inbox,
  editable site settings.
- Phase 11: tests, PostgreSQL migration, security hardening, deployment.

---

## Phase 8 — Product management (admin) ✅ COMPLETE

### What was implemented
- `src/lib/admin-catalog.ts` — admin data access: product list (filters: category,
  active/inactive), product detail (attributes, checkout fields, media), category list
  with product counts.
- `src/app/admin/catalog-actions.ts` — server actions (all guarded by `requireAdmin`):
  - Categories: create / update (name, slug, description, sortOrder), toggle active.
  - Products: create / update with validation (`productSchema`) covering name, slug,
    type (CP/ACCOUNT/COMBO), price/compare-at (integer تومان), category, flags
    (active/featured/best-selling), inventory mode (UNLIMITED / STATUS_ONLY /
    EXACT_QUANTITY), attributes, checkout fields, media URL.
  - Products update replaces attributes / checkout fields / media in one transaction
    (idempotent edit), select-field options are parsed from newline-separated input.
  - Toggle actions: active / featured / best-selling.
- `src/components/admin/ProductForm.tsx` — full create/edit form: basic info, pricing,
  flags, inventory, media URL, dynamic attribute rows, dynamic checkout-field rows with
  per-type options (SELECT shows an options textarea). Used by both create and edit.
- `src/components/admin/CategoryForm.tsx` — create/edit category form.
- Pages: `/admin/products` (filter tabs + table with toggles + edit links), `/admin/products/new`,
  `/admin/products/[id]` (edit), `/admin/categories` (list + create + toggle), `/admin/categories/[id]` (edit).
- AdminShell: «محصولات» and «دستهبندیها» no longer marked «بهزودی».
- `src/lib/schemas.ts` — added `categorySchema` and `productSchema`.

### Commands verified (actually run, passed)
- `npm run typecheck` ✅, `npm run lint` ✅, `npm run build` ✅ (all catalog routes built).
- Runtime: `/admin/products` redirects to login (307) unauthenticated; `/shop/cp-420` still 200.
- DB round-trip via temp script: create category → create product (attribute + SELECT
  checkout field + media) → list/detail reads return correct nested data + product count →
  cleanup. Test data removed afterward.

### Known limitations
- Media is a single image URL in the form (no multi-image/file upload yet).
- No product deletion (soft toggle active instead) — safer for existing orders.
- Slug collisions surface as a generic error message.

### Remaining work
- Phase 9: order-management niceties (notes UI, cancellation, mobile verification).
- Phase 10: reviews / discounts / blog / support administration + editable settings.

---

## Phase 6 — Customer dashboard ✅ COMPLETE

### What was implemented
- Customer authentication (separate from admin sessions):
  - `src/lib/auth/session.ts` refactored — sessions now take a cookie name. Admin uses
    `abol_admin_session`, customers use `abol_customer_session` (a browser can be logged
    into both independently).
  - `src/lib/auth/customer.ts` — `getCurrentCustomer` / `requireCustomer` / `isCustomerSignedIn`.
  - `src/app/auth-actions.ts` — `registerAction` (name + mobile + password, bcrypt-hashed,
    phone uniqueness, blocks re-registering an admin's phone), `loginAction` (generic error,
    admins must use /admin/login), `customerLogoutAction`.
  - `/login` (+ `?mode=register`) page with tabbed login/register forms.
- Dashboard (protected by `requireCustomer`):
  - `src/components/dashboard/DashboardShell` + `src/app/dashboard/layout.tsx` — sidebar
    (نمای کلی / سفارشها / پروفایل / خروج).
  - `/dashboard` — counts (orders/completed/awaiting review), total spent, last 5 orders.
  - `/dashboard/orders` — order list; `/dashboard/orders/[id]` — items + checkout-field
    responses, status history, rejection banner with link to public tracking, tracking code.
  - `/dashboard/profile` + `profile-actions.ts` — edit name, change password (requires
    current password verified against hash).
- Reviews: `submitReviewAction` + `ReviewForm` — only the order owner can review, only
  COMPLETED orders, one review per product per order, `isVerifiedBuyer: true`, unapproved
  until an admin approves. Shown inline in the completed-order detail.
- Checkout now attaches `userId` when a customer is signed in (`placeOrder`), so the order
  appears in the dashboard. Guest orders remain guest.
- Header shows «حساب کاربری» → /dashboard when signed in, else «ورود / ثبتنام».

### Commands verified (actually run, passed)
- `npm run typecheck` ✅, `npm run lint` ✅, `npm run build` ✅ (all dashboard routes built).
- Runtime: `/login` and `/login?mode=register` 200; `/dashboard` redirects (307) to /login
  when unauthenticated.
- DB round-trip via temp script: register → order linked to user → orders list/detail →
  review created (unapproved, verified buyer) → cross-user isolation verified (another id
  cannot view the order's data). Test user/order cleaned up afterward.

### Known limitations
- Phone-verified accounts: `isPhoneVerified` is still admin-manual (Phase 9/11).
- No OTP / password-reset flow yet; password change requires the current password.
- Reviews are customer-side only; admin moderation UI is Phase 10 (pending reviews are
  already counted on the admin dashboard).
- Login rate limiting is intentionally deferred (admin login already rate-limits).

### Remaining work
- Phase 8: product management CRUD in admin.
- Phase 9: order management niceties (assignments, notes UI, cancellation).
- Phase 10: reviews/discounts/blog/support administration + settings editor.

---

## Phase 5 — Card-to-card receipt flow ✅ COMPLETE

### What was implemented (customer side)
- `src/lib/receipts.ts` — receipt validation + disk storage under
  `public/uploads/receipts/`: only JPG/PNG/WebP allowed, ≤ 5MB, magic-byte sniffing to
  reject non-images, random unguessable filenames.
- `src/app/tracking/actions.ts` — `submitReceipt` server action: authenticated by the
  public tracking code + the order's phone number (an uploaded receipt can't be attached
  to someone else's order). On success: creates a PENDING `PaymentReceipt`, transitions
  the order to `AWAITING_REVIEW`, records the status change in history.
- `ReceiptUpload` client component embedded in `/tracking`. The tracking page shows it
  when the order is `AWAITING_PAYMENT` or `RECEIPT_REJECTED`, shows the rejection reason
  when rejected, and shows an "under review" note while `AWAITING_REVIEW`.
- `next.config.ts` — `experimental.serverActions.bodySizeLimit: "8mb"` so image uploads
  fit through the server-action request body.

### Admin side
- Real `/admin/orders` list (replaces the placeholder): status filter tabs, per-row
  tracking code (link), customer, date, item count, latest receipt badge, status badge,
  total.
- Real `/admin/orders/[id]` detail: items with (parsed) checkout-field responses,
  customer info + note, full status timeline, all receipts with status + rejection
  reason, and a review panel for the latest PENDING receipt with paid image preview.
- `src/app/admin/order-actions.ts` — server actions (all guarded by `requireAdmin`):
  - `approveReceipt` → receipt APPROVED + order PAYMENT_APPROVED + history entry.
  - `rejectReceipt` (requires reason) → receipt REJECTED + order RECEIPT_REJECTED +
    reason saved to both receipt and history; reason is surfaced on the tracking page.
  - `markOrderProcessing` (PAYMENT_APPROVED → PROCESSING) and `markOrderCompleted`
    (→ COMPLETED), `reopenOrder` (RECEIPT_REJECTED → AWAITING_PAYMENT for a fresh try).
- `src/lib/status.ts` — order/ receipt Persian labels + badge-tone helpers.
- `src/components/ui.tsx` — Button gained `success` / `danger` variants.
- AdminShell: «سفارشها» no longer marked «بهزودی».

### Commands verified (actually run, passed)
- `npm run typecheck` ✅, `npm run lint` ✅, `npm run build` ✅ (orders list + detail built).
- Runtime: `/tracking`, `/admin/login` 200; `/admin/orders` 307→redirect to login when
  unauthenticated (authorization works).
- Full DB round-trip via temp script: PENDING receipt visible on tracking; approve →
  PAYMENT_APPROVED + history (3 steps); reject → RECEIPT_REJECTED with reason surfaced.
  Test orders cleaned up afterward.

### Known limitations
- Receipts are served from `public/` by Next static serving — anyone with the URL can
  view one, but filenames are random tokens. For production, store in opaque storage
  behind an authenticated route (planned for Phase 11).
- A customer can send multiple receipts over time; admins review the latest PENDING one.
- No separate "NEEDS_INFO" flow yet; statuses beyond receipts (CANCELLED, NEEDS_INFO)
  can be added in Phase 9 order management.

### Remaining work
- Phase 6: customer dashboard / registered checkout / reviews.
- Phase 9: richer order management (assignments, notes UI, cancellation).

---

## Phase 4 — Cart & checkout ✅ COMPLETE

### What was implemented
- Client-side shopping cart (`src/lib/cart.tsx`): React context backed by a module-level
  external store + localStorage persistence (`abol_cart_v1`), items added/updated/removed,
  total-unit count + display subtotal. Hydration is safe (no server/client mismatch).
- Cart is only `{ productId, quantity }` + display snapshots. **Prices are NEVER trusted
  from the browser** — every price is recomputed server-side from the DB when ordering.
- Header cart badge (desktop icon + mobile full-width button) linking to `/cart`.
- Real `/shop` listing page: category tabs (all / CP / account / combo via `?category=`),
  text search via `?q=`, full responsive product grid, empty states.
- Product detail page `/shop/[slug]`: breadcrumb, price/discount, attributes, full
  description, cancellation policy, add-to-cart with quantity stepper.
- `/cart` page: quantity steppers, remove, line totals, subtotal summary, checkout CTA.
- `/checkout` page (client): customer info (name, phone, optional messenger contact,
  optional note), per-product **custom checkout fields** (TEXT/TEXTAREA/NUMBER/EMAIL/
  SELECT with options) rendered from DB config, fresh price summary from server.
- Checkout server actions (`src/app/checkout/actions.ts`):
  - `getCheckoutProducts` — returns fresh prices + checkout-field config for display.
  - `placeOrder` — Zod validation, per-product required-field + type validation
    (SELECT options, NUMBER, EMAIL), server-side totals, tracking code, creates Order +
    immutable OrderItems (price snapshots) + OrderStatusHistory, decrements
    EXACT_QUANTITY inventory in a transaction.
- Public tracking: `/tracking?code=AB-XXXXXX` shows full order detail + status timeline.
  After checkout the customer is redirected here with their new code.
- Tracking code generator (`src/lib/orders.ts`): `AB-XXXXXX`, collision-checked.
- Seed extended: account product now has 2 checkout fields (region SELECT required,
  questId TEXT optional) — game credentials are never requested/stored.

### Commands verified (actually run, passed)
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅
- Runtime: production server started; `/shop`, `/shop/cp-420`, `/cart`, `/tracking?code=...` all 200.
- Order round-trip verified via temp script: order created with snapshots + status
  history, then looked up by tracking code (totals/items/history match). Test order
  removed afterward.
- `npm run db:seed` ✅ (idempotent; runs with new checkout fields).

### Known limitations
- Registered checkout is not yet available (customer auth is Phase 3 ext/Phase 6); every
  order today is guest (`userId` null). Server action accepts a `userId` in future.
- No discount codes applied at checkout yet (Phase 10).
- Receipt upload / payment-approval flow is Phase 5 — after checkout the order sits in
  `AWAITING_PAYMENT` with a "payment in progress" note; the success redirect relies on the
  public tracking page.
- `placeOrder` is rate-limited per-attempt implicitly by Zod validation only; brute-force
  protection for customer-facing order placement isn't added yet.

### Remaining work
- Phase 5: card-to-card receipt upload + admin approve/reject, statuses
  `AWAITING_REVIEW`/`PAYMENT_APPROVED`/`RECEIPT_REJECTED` surfaced to customer.
- Phase 6: customer dashboard / registered checkout / reviews.

---

## Phase 2 — Public storefront ✅ COMPLETE

### What was implemented
- Full dark premium RTL Persian storefront (Vazirmatn self-hosted font, black/gold/silver design tokens, visible focus, reduced-motion support).
- Global layout: `lang="fa" dir="rtl"`, Persian metadata + OpenGraph, dark theme, persistent Header / Footer / floating SupportWidget.
- Homepage rebuilt (server components, DB-driven sections): Hero, Trust strip, Category cards, Featured products, Best-selling products, Why Abol Store, Successful-orders statistic, Testimonials, Purchase steps, FAQ accordion, About preview, Final CTA.
- Safe brand logo fallback (`public/logo.png` optional → premium "Abol StoRe" wordmark, never a broken image).
- Functional support form via Next.js server action: Zod validation, Iranian mobile (Persian-digit aware), min/max lengths, honeypot + basic per-IP rate limiting, saved to SQLite `SupportMessage`, Persian feedback.
- 9 public placeholder routes with proper Persian titles: /shop /about /contact /faq /tracking /tutorial /rules /privacy /refund. No dead 404 links from navigation.

### Main files created / changed
- `src/app/layout.tsx` — RTL, Persian, metadata, Header/Footer/SupportWidget.
- `src/app/page.tsx` — rebuilt homepage.
- `src/app/globals.css` — design tokens + base styles (Tailwind v4 @theme).
- `src/app/actions.ts` — `submitSupportMessage` server action.
- `src/components/` — `Header`, `Footer`, `Logo`, `ProductCard`, `FaqAccordion`, `SupportWidget`, `ui.tsx` (Container/Button/Badge/SectionHeading/EmptyState/Card), `home-sections.tsx`, `PagePlaceholder`.
- `src/lib/` — `format.ts` (Persian digits + تومان), `schemas.ts` (Zod), `site.ts` (DB queries with graceful fallbacks).
- `next.config.ts` — `serverExternalPackages: ["better-sqlite3"]`.
- Placeholder pages under `src/app/{shop,about,contact,faq,tracking,tutorial,rules,privacy,refund}/`.

### Database-backed homepage sections
- Site settings (brand, successful order count 1,247 demo) — `getSiteSettings`.
- Categories (3 from DB, with fallback) — `getActiveCategories`.
- Featured products (3 CP + 1 account seeded) — `getFeaturedProducts`.
- Best-selling products — `getBestSellingProducts`.
- Approved testimonials (demo علی محمدی) — `getApprovedTestimonials`.
- Active FAQs (3 seeded) — `getActiveFaqs`.
- All queries catch errors and return safe defaults/empty arrays; homepage never crashes on empty DB.

### Support form status
- Works end-to-end. Verified: valid input passes and normalizes Persian digits; invalid input rejected with Persian errors (name ≥2 chars, phone 09 + 11 digits, message ≥10 chars); DB write creates a `SupportMessage`; honeypot + rate limit in action.

### Responsive / mobile status
- Fully responsive (320px to desktop). Mobile-first design. Header: collapsible mobile menu (accessible, keyboard-friendly). All sections adapt: hero, categories, products grid (2/3/4 cols), trust, testimonials, FAQ, footer. Support button positioned clear of content. Modal fits small screens. Logo fallback works on all sizes.

### Commands verified (actually run, passed)
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅ (13 routes prerendered, Turbopack)
- Runtime: dev server started; `/` returned 200 with DB content (stat 1,247, testimonial علی محمدی, FAQ, product 420 CP), RTL/fa, fallback logo; all 10 public routes 200; server stopped afterward.
- Support logic verified via temp script (removed after).

### Known limitations
- /shop is a placeholder (full listing, filtering, details, cart/checkout are later phases).
- Login links (`/login`) point to a route not yet implemented; clicking shows the app's 404 — intentional until Phase 3.
- Support form modal focuses close button on open (not full focus trap) — acceptable MVP; can be hardened later.
- `better-sqlite3` remains a native module; `next.config.ts` externalizes it.
- Real `public/logo.png` not present yet; fallback brand "Abol StoRe" used (no broken image).

### Remaining work
- Phase 3: Authentication (admin login `/admin/login` + protected `/admin`, customer auth) — see `docs/IMPLEMENTATION_PLAN.md`.

### Confirmation
- No Git commit was created (workspace is not a Git repository).

---

## Phase 1A — Data foundation ✅ COMPLETE

### What existed before this run
- Next.js 16 App Router scaffold (TypeScript, Tailwind v4, ESLint), default page/layout.
- Dependencies pre-installed: next, react, @prisma/client, prisma, zod, bcryptjs, jose,
  @fontsource-variable/vazirmatn, tsx.
- No prisma folder, no database, no config, no env files, no docs, no app architecture.

### Packages installed this run
- Runtime: `better-sqlite3`, `@prisma/adapter-better-sqlite3@7.9.1` (matches
  `@prisma/client@7.9.1`), `dotenv`.
- Dev: `@types/better-sqlite3`.

### Files created / changed
- `prisma/schema.prisma` — full Abol Store schema (Prisma 7 `prisma-client` generator,
  SQLite datasource, generated client at `src/generated/prisma`).
- `prisma.config.ts` — Prisma 7 config: dotenv, schema + migrations paths, seed command
  `tsx prisma/seed.ts`, datasource URL from `DATABASE_URL`.
- `prisma/seed.ts` — idempotent seed (upserts; game credentials never stored).
- `src/lib/prisma.ts` — Prisma client singleton using the better-sqlite3 driver adapter.
- `prisma/migrations/<ts>_init/` — initial migration.
- `.env` (git-ignored, dev-only values) and `.env.example` (safe placeholders).
- `.gitignore` — added SQLite db files + generated client; keep `.env.example`.
- `eslint.config.mjs` — ignore `src/generated/**`.
- `package.json` — scripts: `typecheck`, `prisma:generate`, `db:migrate`, `db:seed`,
  `db:studio`.
- `src/app/layout.tsx` — replaced generated `LayoutProps` with explicit prop type so
  typecheck passes without a build (theme/RTL deferred to Phase 2).
- `docs/PROJECT_CONTEXT.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/PROGRESS.md`.

### Schema summary (models)
User, Session, Category, Product, ProductMedia, ProductAttribute,
ProductCheckoutField, Order, OrderItem, OrderStatusHistory, PaymentReceipt, Review,
Discount, SupportMessage, SiteSetting, BlogPost, FAQ.
- Money = integer تومان. Role/type/status/inventoryMode are strings with documented
  allowed values (SQLite has no enums; keeps workflows configurable).
- Only hashed session tokens and hashed passwords are stored. No game credentials.

### Migration status
- `prisma migrate dev --name init` applied. Database at `./dev.db` (git-ignored).

### Seed status
- Ran successfully **twice** — idempotent (upserts + attribute reset). Seeded: 1 admin
  (ADMIN role, verified), 3 categories, 5 products (3 CP, 1 account + 4 attributes,
  1 combo), 1 site settings singleton (demo card/Telegram/Rubika, 1247 demo orders),
  1 approved testimonial, 3 FAQs, 1 blog post.

### Commands verified (actually run, passed)
- `prisma format` ✅
- `prisma validate` ✅
- `prisma generate` ✅
- `prisma migrate dev --name init` ✅
- `prisma db seed` ✅ (run twice → idempotent)
- `npm run typecheck` (`tsc --noEmit`) ✅
- `npm run lint` (`eslint`) ✅
- DB verification query ✅ (admin exists, 3 categories, 5 products, settings, 3 FAQs)

### Known limitations
- SQLite for local dev only; PostgreSQL migration planned (Phase 11).
- No enums at DB level by design (documented string values).
- Storefront/admin UI, auth, cart/checkout not built yet (Phase 2+).
- `better-sqlite3` is a native module; a compatible Node ABI is required.
- Production `next build` not run in this phase (deferred; homepage not built yet).

### Remaining work
- Phases 2–11 in `docs/IMPLEMENTATION_PLAN.md`. Next: **Phase 2 — Public storefront**.

## Global rule
- No Git commits are created by the assistant.
