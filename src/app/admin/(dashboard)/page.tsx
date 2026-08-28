import type { Metadata } from "next";
import Link from "next/link";
import { getAdminDashboard } from "@/lib/admin-data";
import { formatToman, formatNumber } from "@/lib/format";
import { orderStatusLabel } from "@/lib/status";

export const metadata: Metadata = {
  title: "داشبورد",
  robots: { index: false, follow: false },
};

// Always render fresh counts.
export const dynamic = "force-dynamic";

function MetricCard({
  label,
  value,
  href,
  accent = false,
}: {
  label: string;
  value: number;
  href?: string;
  accent?: boolean;
}) {
  const body = (
    <div
      className={`flex flex-col gap-1 rounded-2xl border p-4 transition-colors ${
        accent
          ? "border-gold/40 bg-gold/10 hover:border-gold/60"
          : "border-border bg-surface hover:border-gold/30"
      }`}
    >
      <span className="text-xs text-muted">{label}</span>
      <span className={`text-2xl font-extrabold ${accent ? "text-gold" : "text-foreground"}`}>
        {formatNumber(value)}
      </span>
    </div>
  );
  return href ? (
    <Link href={href} className="focus-visible:outline-gold rounded-2xl">
      {body}
    </Link>
  ) : (
    body
  );
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboard();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">سلام، مدیر Abol Store</h1>
        <p className="mt-1 text-sm text-muted">نمای کلی فروشگاه شما.</p>
      </div>

      {/* Metrics */}
      <section aria-label="آمار" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="محصولات" value={data.productCount} href="/admin/products" />
        <MetricCard label="کاربران" value={data.userCount} href="/admin/users" />
        <MetricCard label="سفارش‌ها" value={data.orderCount} href="/admin/orders" />
        <MetricCard label="در انتظار بررسی" value={data.awaitingReviewOrders} href="/admin/orders" accent />
        <MetricCard label="پیام پشتیبانی جدید" value={data.newSupportMessages} href="/admin/support" />
        <MetricCard label="نظرات در انتظار" value={data.pendingReviews} href="/admin/reviews" />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-foreground">سفارش‌های اخیر</h2>
            <Link href="/admin/orders" className="text-xs text-gold hover:underline focus-visible:outline-gold">
              مشاهده همه
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              هنوز سفارشی ثبت نشده است.
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {data.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{o.customerName}</p>
                    <p dir="ltr" className="truncate text-start text-xs text-muted">{o.trackingCode}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="whitespace-nowrap text-xs text-muted">{orderStatusLabel(o.status)}</span>
                    <span className="whitespace-nowrap font-semibold text-foreground">{formatToman(o.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent support messages */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-foreground">پیام‌های پشتیبانی اخیر</h2>
            <Link href="/admin/support" className="text-xs text-gold hover:underline focus-visible:outline-gold">
              مشاهده همه
            </Link>
          </div>
          {data.recentSupportMessages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              پیام پشتیبانی جدیدی وجود ندارد.
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {data.recentSupportMessages.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{m.name}</p>
                    <p dir="ltr" className="truncate text-start text-xs text-muted">{m.phone}</p>
                  </div>
                  {m.status === "NEW" ? (
                    <span className="whitespace-nowrap rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold">جدید</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 font-bold text-foreground">دسترسی سریع</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "محصولات", href: "/admin/products" },
            { label: "سفارش‌ها", href: "/admin/orders" },
            { label: "پیام‌های پشتیبانی", href: "/admin/support" },
            { label: "تنظیمات فروشگاه", href: "/admin/settings" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-xl border border-border bg-surface px-4 py-4 text-center text-sm font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </section>

      {/* System facts (true project facts) */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-3 font-bold text-foreground">وضعیت سیستم</h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-elevated px-3 py-2">
            <dt className="text-muted">دیتابیس</dt>
            <dd className="font-medium text-foreground">SQLite</dd>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-xl bg-elevated px-3 py-2">
            <dt className="text-muted">روش پرداخت</dt>
            <dd className="font-medium text-foreground">کارت‌به‌کارت</dd>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-xl bg-elevated px-3 py-2">
            <dt className="text-muted">انجام سفارش</dt>
            <dd className="font-medium text-foreground">دستی</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
