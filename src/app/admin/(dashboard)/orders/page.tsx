import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { getAdminOrders } from "@/lib/orders";
import { orderStatusLabel, orderStatusTone, receiptStatusLabel, receiptStatusTone } from "@/lib/status";
import { formatToman, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "سفارش‌ها",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const statusFilters = [
  { label: "همه", value: "ALL" },
  { label: "در انتظار پرداخت", value: "AWAITING_PAYMENT" },
  { label: "در انتظار بررسی رسید", value: "AWAITING_REVIEW" },
  { label: "پرداخت تأییدشده", value: "PAYMENT_APPROVED" },
  { label: "در حال انجام", value: "PROCESSING" },
  { label: "تکمیل شده", value: "COMPLETED" },
  { label: "لغو شده", value: "CANCELLED" },
];

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const active = statusFilters.some((f) => f.value === status) ? status : "ALL";

  const orders = await getAdminOrders({ status: active, query: q?.trim() || null });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">سفارش‌ها</h1>
        <p className="mt-1 text-sm text-muted">مدیریت سفارش‌ها و بررسی رسید پرداخت.</p>
      </div>

      {/* Search */}
      <form
        action="/admin/orders"
        method="get"
        className="flex w-full max-w-md gap-2"
      >
        <input
          type="hidden"
          name="status"
          value={active === "ALL" ? "" : active}
        />
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          dir="ltr"
          placeholder="جستجو: کد رهگیری، شماره موبایل یا نام"
          aria-label="جستجوی سفارش"
          className="h-11 flex-1 rounded-xl border border-border bg-surface px-4 text-start text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold"
        />
        <button
          type="submit"
          className="h-11 rounded-xl bg-gold px-5 text-sm font-bold text-black transition-colors hover:bg-gold-hover focus-visible:outline-2 focus-visible:outline-gold"
        >
          جستجو
        </button>
        {q ? (
          <Link
            href="/admin/orders"
            className="flex h-11 items-center rounded-xl border border-border px-4 text-sm text-muted transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold"
          >
            پاک
          </Link>
        ) : null}
      </form>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => {
          const isActive = f.value === active;
          const href = f.value === "ALL" ? "/admin/orders" : `/admin/orders?status=${f.value}`;
          return (
            <Link
              key={f.value}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-gold ${
                isActive
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-border bg-surface text-foreground hover:border-gold/40 hover:text-gold"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Orders table */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
          <p className="font-semibold text-foreground">سفارشی یافت نشد</p>
          <p className="mt-1 text-sm text-muted">در این فیلتر سفارشی وجود ندارد.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs text-muted">
                <th scope="col" className="px-4 py-3 font-medium">کد رهگیری</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">مشتری</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">تاریخ</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">اقلام</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">رسید</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">وضعیت</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">مبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-elevated/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      dir="ltr"
                      className="text-start font-semibold text-gold transition-colors hover:underline focus-visible:outline-gold"
                    >
                      {o.trackingCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{o.customerName}</p>
                    <p dir="ltr" className="text-xs text-muted">{o.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted tnum">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-muted tnum">{formatNumber(o.itemCount)}</td>
                  <td className="px-4 py-3">
                    {o.receiptStatus ? (
                      <Badge tone={receiptStatusTone(o.receiptStatus)}>
                        {receiptStatusLabel(o.receiptStatus)}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={orderStatusTone(o.status)}>{orderStatusLabel(o.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground tnum">{formatToman(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}