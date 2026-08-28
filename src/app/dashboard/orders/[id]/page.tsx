import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui";
import { requireCustomer } from "@/lib/auth/customer";
import { getCustomerOrderById } from "@/lib/customer-data";
import { orderStatusLabel, orderStatusTone } from "@/lib/status";
import { formatToman } from "@/lib/format";
import { ReviewForm } from "@/components/dashboard/ReviewForm";

export const metadata: Metadata = { title: "جزئیات سفارش" };

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

function parseResponses(json: string | null): Record<string, string> | null {
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

export default async function DashboardOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const customer = await requireCustomer();
  const { id } = await params;
  const order = await getCustomerOrderById(customer.id, id);
  if (!order) notFound();

  const canReview = order.status === "COMPLETED";
  const reviewedProductIds = new Set(order.reviews.map((r) => r.productId));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold"
            aria-label="بازگشت به سفارش‌ها"
          >
            <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <div>
            <h2 className="text-lg font-extrabold text-foreground">
              سفارش <span dir="ltr" className="text-gold">{order.trackingCode}</span>
            </h2>
            <p className="text-xs text-muted tnum">ثبت: {formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <Badge tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</Badge>
      </div>

      {order.status === "RECEIPT_REJECTED" && order.receipts[0]?.rejectionReason ? (
        <div className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
          <p className="font-semibold">رسید شما رد شد</p>
          <p className="mt-1 text-xs leading-6">{order.receipts[0].rejectionReason}</p>
          <p className="mt-1 text-xs text-muted">
            می‌توانید از طریق{" "}
            <Link
              href={`/tracking?code=${encodeURIComponent(order.trackingCode)}`}
              className="text-gold hover:underline focus-visible:outline-gold"
            >
              صفحه پیگیری سفارش
            </Link>{" "}
            رسید جدید ارسال کنید.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
          <h3 className="font-bold text-foreground">اقلام سفارش</h3>
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {order.items.map((item) => {
              const responses = parseResponses(item.fieldResponses);
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

        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-bold text-foreground">تاریخچه وضعیت</h3>
            <ol className="mt-4 flex flex-col gap-0 border-s border-border ps-4">
              {order.statusHistory.map((h) => (
                <li key={h.id} className="relative pb-5 last:pb-0">
                  <span className="absolute -start-[23px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-gold bg-background" aria-hidden />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">{orderStatusLabel(h.toStatus)}</span>
                    <time className="text-[11px] text-muted tnum">{formatDateTime(h.createdAt)}</time>
                    {h.note ? <p className="text-xs leading-6 text-muted">{h.note}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-bold text-foreground">کد رهگیری</h3>
            <p dir="ltr" className="mt-2 text-sm font-bold text-gold tnum">{order.trackingCode}</p>
            <Link
              href={`/tracking?code=${encodeURIComponent(order.trackingCode)}`}
              className="mt-2 inline-block text-xs text-gold hover:underline focus-visible:outline-gold"
            >
              مشاهده در صفحه پیگیری عمومی
            </Link>
          </section>
        </div>
      </div>

      {canReview ? (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-bold text-foreground">ثبت نظر برای این سفارش</h3>
          <p className="mt-1 text-xs text-muted">
            پس از تکمیل سفارش می‌توانید برای هر محصول نظر بدهید؛ نظرات پس از تأیید مدیر نمایش داده می‌شوند.
          </p>

          {order.reviews.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-3">
              {order.reviews.map((r) => (
                <li key={r.id} className="rounded-xl bg-elevated px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="text-gold tnum">{"★".repeat(r.rating)}</span>
                    {r.isApproved ? (
                      <Badge tone="success">منتشر شده</Badge>
                    ) : (
                      <Badge tone="neutral">در انتظار تأیید</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-foreground">{r.comment}</p>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-4 flex flex-col gap-4">
            {order.items.map((item) => {
              if (!item.productId) return null;
              const already = reviewedProductIds.has(item.productId);
              return (
                <div key={item.id} className="rounded-xl border border-border p-4">
                  <p className="text-sm font-semibold text-foreground">{item.productName}</p>
                  {already ? (
                    <p className="mt-2 text-xs text-success">نظر شما برای این محصول ثبت شده است.</p>
                  ) : (
                    <div className="mt-3">
                      <ReviewForm
                        orderId={order.id}
                        productId={item.productId}
                        productName={item.productName}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}