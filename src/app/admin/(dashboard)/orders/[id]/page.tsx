import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui";
import { getAdminOrderById } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { orderStatusLabel, orderStatusTone, receiptStatusLabel, receiptStatusTone } from "@/lib/status";
import { formatToman, formatNumber } from "@/lib/format";
import { ReceiptReview } from "@/components/admin/ReceiptReview";
import { OrderActions } from "@/components/admin/OrderActions";

export const metadata: Metadata = {
  title: "جزئیات سفارش",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function parseFieldResponses(json: string | null): Record<string, string> | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const pendingReceipt = order.receipts.find((r) => r.status === "PENDING") ?? null;

  const user = await prisma.user
    .findUnique({ where: { phone: order.customerPhone } })
    .catch(() => null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold"
            aria-label="بازگشت به لیست سفارش‌ها"
          >
            <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-foreground sm:text-2xl">
              سفارش <span dir="ltr" className="text-gold">{order.trackingCode}</span>
            </h1>
            <p className="mt-0.5 text-xs text-muted tnum">ثبت: {formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
      </div>

      {/* Receipt review (highest priority when pending) */}
      {pendingReceipt ? (
        <ReceiptReview orderId={order.id} receipt={pendingReceipt} />
      ) : null}

      {/* Admin actions: note, status transitions, phone verification */}
      <OrderActions
        orderId={order.id}
        status={order.status}
        isPhoneVerified={!!user?.isPhoneVerified}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items */}
        <section className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
          <h2 className="font-bold text-foreground">اقلام سفارش</h2>
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {order.items.map((item) => {
              const responses = parseFieldResponses(item.fieldResponses);
              return (
                <li key={item.id} className="flex flex-col gap-1 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-foreground">{item.productName}</span>
                    <span className="flex items-center gap-4">
                      <span className="text-xs text-muted tnum">×{item.quantity}</span>
                      <span className="font-semibold text-foreground tnum">{formatToman(item.lineTotal)}</span>
                    </span>
                  </div>
                  {responses && Object.keys(responses).length > 0 ? (
                    <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                      {Object.entries(responses).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-1">
                          <dt>{k}:</dt>
                          <dd className="text-foreground">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {item.cancellationPolicy ? (
                    <p className="text-xs leading-5 text-muted">
                      <span className="font-semibold text-foreground">قوانین لغو/بازگشت:</span>{" "}
                      {item.cancellationPolicy}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <dl className="mt-4 flex flex-col gap-2 border-t border-border pt-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">جمع</dt>
              <dd className="font-semibold text-foreground tnum">{formatToman(order.subtotal)}</dd>
            </div>
            {order.discountAmount > 0 ? (
              <div className="flex items-center justify-between">
                <dt className="text-muted">تخفیف</dt>
                <dd className="font-semibold text-success tnum">{formatToman(order.discountAmount)}</dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between border-t border-border pt-2">
              <dt className="font-bold text-foreground">مبلغ</dt>
              <dd className="text-lg font-extrabold text-gold tnum">{formatToman(order.total)}</dd>
            </div>
          </dl>
        </section>

        {/* Customer + history */}
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-bold text-foreground">مشتری</h2>
            <dl className="mt-3 flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">نام</dt>
                <dd className="font-medium text-foreground">{order.customerName}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted">موبایل</dt>
                <dd dir="ltr" className="font-medium text-foreground tnum">{order.customerPhone}</dd>
              </div>
              {order.supportContact ? (
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted">شناسه تماس</dt>
                  <dd className="font-medium text-foreground">{order.supportContact}</dd>
                </div>
              ) : null}
            </dl>
            {order.customerNote ? (
              <p className="mt-3 rounded-xl bg-elevated px-3 py-2 text-xs leading-6 text-muted">
                <span className="font-semibold text-foreground">یادداشت مشتری: </span>
                {order.customerNote}
              </p>
            ) : null}
            {order.adminNote ? (
              <p className="mt-3 rounded-xl border border-gold/25 bg-gold/10 px-3 py-2 text-xs leading-6 text-muted">
                <span className="font-semibold text-gold">یادداشت داخلی مدیر: </span>
                {order.adminNote}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-bold text-foreground">تاریخچه وضعیت</h2>
            <ol className="mt-4 flex flex-col gap-0 border-s border-border ps-4">
              {order.statusHistory.map((h) => (
                <li key={h.id} className="relative pb-5 last:pb-0">
                  <span
                    className="absolute -start-[23px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-gold bg-background"
                    aria-hidden
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      {orderStatusLabel(h.toStatus)}
                    </span>
                    <time className="text-[11px] text-muted tnum">{formatDateTime(h.createdAt)}</time>
                    {h.note ? <p className="text-xs leading-6 text-muted">{h.note}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {/* All receipts */}
      {order.receipts.length > 0 ? (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-bold text-foreground">رسیدهای پرداخت</h2>
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {order.receipts.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 rounded-xl border border-border bg-elevated p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.imagePath}
                  alt={`رسید پرداخت ${formatNumber(order.items.length)}`}
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                />
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={receiptStatusTone(r.status)}>{receiptStatusLabel(r.status)}</Badge>
                  <span className="text-[11px] text-muted tnum">{formatDateTime(r.createdAt)}</span>
                </div>
                {r.status === "REJECTED" && r.rejectionReason ? (
                  <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
                    دلیل رد: {r.rejectionReason}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}