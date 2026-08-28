import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { requireCustomer } from "@/lib/auth/customer";
import { getCustomerOrders } from "@/lib/customer-data";
import { orderStatusLabel, orderStatusTone, receiptStatusLabel, receiptStatusTone } from "@/lib/status";
import { formatToman, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "سفارش‌های من",
};

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function DashboardOrdersPage() {
  const customer = await requireCustomer();
  const orders = await getCustomerOrders(customer.id);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold text-foreground">سفارش‌های من</h2>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
          <p className="font-semibold text-foreground">هنوز سفارشی ندارید</p>
          <p className="mt-1 text-sm text-muted">
            سفارش‌های ثبت‌شده با این حساب اینجا نمایش داده می‌شوند.
          </p>
          <Link href="/shop" className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-gold px-6 text-sm font-bold text-black transition-colors hover:bg-gold-hover focus-visible:outline-gold">
            رفتن به فروشگاه
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
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
                <div className="flex items-center gap-2">
                  {o.latestReceiptStatus ? (
                    <Badge tone={receiptStatusTone(o.latestReceiptStatus)}>
                      رسید: {receiptStatusLabel(o.latestReceiptStatus)}
                    </Badge>
                  ) : null}
                  <Badge tone={orderStatusTone(o.status)}>{orderStatusLabel(o.status)}</Badge>
                </div>
                <span className="text-sm font-semibold text-foreground tnum">{formatToman(o.total)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}