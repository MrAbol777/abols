import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { requireCustomer } from "@/lib/auth/customer";
import { getCustomerOrders } from "@/lib/customer-data";
import { orderStatusLabel, orderStatusTone } from "@/lib/status";
import { formatToman, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "نمای کلی",
};

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default async function DashboardPage() {
  const customer = await requireCustomer();
  const orders = await getCustomerOrders(customer.id);
  const completed = orders.filter((o) => o.status === "COMPLETED").length;
  const awaitingReview = orders.filter((o) => o.status === "AWAITING_REVIEW").length;
  const totalSpent = orders
    .filter((o) => o.status === "COMPLETED" || o.status === "PROCESSING")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4">
          <span className="text-xs text-muted">سفارش‌ها</span>
          <span className="text-2xl font-extrabold text-foreground tnum">{formatNumber(orders.length)}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4">
          <span className="text-xs text-muted">تکمیل‌شده</span>
          <span className="text-2xl font-extrabold text-success tnum">{formatNumber(completed)}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4">
          <span className="text-xs text-muted">در انتظار بررسی</span>
          <span className="text-2xl font-extrabold text-gold tnum">{formatNumber(awaitingReview)}</span>
        </div>
      </section>

      {totalSpent > 0 ? (
        <p className="rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3 text-sm text-muted">
          مجموع خریدهای انجام‌شده شما:{" "}
          <span className="font-extrabold text-gold tnum">{formatToman(totalSpent)}</span>
        </p>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-foreground">آخرین سفارش‌ها</h2>
          <Link href="/dashboard/orders" className="text-xs text-gold hover:underline focus-visible:outline-gold">
            مشاهده همه
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-10 text-center">
            <p className="font-semibold text-foreground">هنوز سفارشی ندارید</p>
            <p className="mt-1 text-sm text-muted">از فروشگاه خرید کنید تا سفارش‌هایتان اینجا نمایش داده شود.</p>
            <Link href="/shop" className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-gold px-6 text-sm font-bold text-black transition-colors hover:bg-gold-hover focus-visible:outline-gold">
              رفتن به فروشگاه
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/orders/${o.id}`}
                    dir="ltr"
                    className="block truncate text-start text-sm font-bold text-gold transition-colors hover:underline focus-visible:outline-gold"
                  >
                    {o.trackingCode}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted tnum">
                    {formatDate(o.createdAt)} · {formatNumber(o.itemCount)} قلم
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={orderStatusTone(o.status)}>{orderStatusLabel(o.status)}</Badge>
                  <span className="text-sm font-semibold text-foreground tnum">{formatToman(o.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}