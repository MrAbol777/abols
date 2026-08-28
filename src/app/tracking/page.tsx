import type { Metadata } from "next";
import { Container, Badge } from "@/components/ui";
import { getOrderByTrackingCode } from "@/lib/orders";
import { orderStatusLabel } from "@/lib/status";
import { formatToman } from "@/lib/format";
import { ReceiptUpload } from "@/components/ReceiptUpload";

export const metadata: Metadata = {
  title: "پیگیری سفارش",
  description: "پیگیری وضعیت سفارش با کد رهگیری در ابول استور.",
};

// Always check the latest status.
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

function Timeline({ history }: { history: Array<{ toStatus: string; note: string | null; createdAt: Date }> }) {
  return (
    <ol className="relative flex flex-col gap-0 border-s border-border ps-5">
      {history.map((h, i) => (
        <li key={i} className="relative pb-6 last:pb-0">
          <span className="absolute -start-[27px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-gold bg-background" aria-hidden />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">{orderStatusLabel(h.toStatus)}</span>
            <time className="text-xs text-muted tnum">{formatDateTime(h.createdAt)}</time>
            {h.note ? <p className="text-xs leading-6 text-muted">{h.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

async function OrderResult({ code }: { code: string }) {
  const order = await getOrderByTrackingCode(code);

  if (!order) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
        <p className="font-semibold text-foreground">سفارشی با این کد پیدا نشد</p>
        <p className="mt-1 text-sm text-muted">کد رهگیری را بررسی کنید یا از بخش پشتیبانی کمک بگیرید.</p>
      </div>
    );
  }

  const canUpload = ["AWAITING_PAYMENT", "RECEIPT_REJECTED"].includes(order.status);
  const latestReceipt = order.receipts[0] ?? null;
  const latestRejection =
    order.status === "RECEIPT_REJECTED" ? latestReceipt?.rejectionReason : null;

  return (
    <div className="mt-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2 rounded-2xl border border-gold/30 bg-gold/10 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted">کد رهگیری</p>
          <p dir="ltr" className="font-bold text-gold tnum">{order.trackingCode}</p>
        </div>
        <Badge tone="gold" className="self-start text-sm">{orderStatusLabel(order.status)}</Badge>
      </div>

      {/* Receipt flow */}
      {canUpload ? (
        <section className="rounded-2xl border border-border bg-surface p-5">
          {latestRejection ? (
            <div className="mb-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
              <p className="font-semibold">رسید قبلی شما رد شد</p>
              {latestRejection ? <p className="mt-1 text-xs leading-6">{latestRejection}</p> : null}
              <p className="mt-2 text-xs text-muted">
                پس از اصلاح، می‌توانید رسید جدیدی ارسال کنید.
              </p>
            </div>
          ) : null}
          <ReceiptUpload trackingCode={order.trackingCode} />
        </section>
      ) : null}

      {/* Payment status */}
      {order.status === "AWAITING_REVIEW" && order.receipts.length > 0 ? (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-bold text-foreground">رسید پرداخت</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 text-gold">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            رسید شما دریافت شد و در حال بررسی توسط مدیر است.
          </p>
        </section>
      ) : null}

      {/* Payment approved — we will contact the customer */}
      {order.status === "PAYMENT_APPROVED" ? (
        <section className="rounded-2xl border border-success/30 bg-success/10 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-bold text-foreground">پرداخت شما تأیید شد</p>
              <p className="text-sm leading-7 text-muted">
                مبلغ پرداختی شما تأیید شده است. همکاران ما {order.supportContact ? "از طریق «" + order.supportContact + "»" : "به‌زودی"} با شما تماس می‌گیرند و سفارش را تحویل می‌دهند.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Processing / completed */}
      {order.status === "PROCESSING" ? (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm leading-7 text-muted">
            سفارش شما در حال انجام است؛ درباره زمان تحویل به‌زودی با شما تماس گرفته می‌شود.
          </p>
        </section>
      ) : null}

      {order.status === "COMPLETED" ? (
        <section className="rounded-2xl border border-success/30 bg-success/10 p-5">
          <p className="font-bold text-foreground">سفارش شما تکمیل شد</p>
          <p className="mt-1 text-sm leading-7 text-muted">
            سفارش تحویل داده شده است. از خرید شما متشکریم؛ در صورت تمایل در صفحه «داشبورد» می‌توانید نظر خود را ثبت کنید.
          </p>
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items */}
        <section className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
          <h2 className="font-bold text-foreground">اقلام سفارش</h2>
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="font-medium text-foreground">{item.productName}</span>
                <span className="flex items-center gap-4">
                  <span className="text-xs text-muted tnum">×{item.quantity}</span>
                  <span className="font-semibold text-foreground tnum">{formatToman(item.lineTotal)}</span>
                </span>
              </li>
            ))}
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

        {/* Timeline */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-bold text-foreground">تاریخچه وضعیت</h2>
          <div className="mt-5">
            {order.statusHistory.length > 0 ? (
              <Timeline history={order.statusHistory} />
            ) : (
              <p className="text-sm text-muted">هنوز تغییری در وضعیت ثبت نشده است.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default async function TrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const trimmedCode = (code ?? "").trim();

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">پیگیری سفارش</h1>
        <p className="max-w-md text-sm leading-7 text-muted">
          کد رهگیری خود را وارد کنید تا وضعیت سفارش و تاریخچه‌ی آن را ببینید.
        </p>
      </div>

      {/* Search form */}
      <form action="/tracking" method="get" className="mx-auto mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <input
          type="text"
          name="code"
          defaultValue={trimmedCode}
          dir="ltr"
          required
          aria-label="کد رهگیری"
          placeholder="AB-XXXXXX"
          className="h-12 flex-1 rounded-xl border border-border bg-surface px-4 text-start text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold"
        />
        <button
          type="submit"
          className="h-12 rounded-xl bg-gold px-6 text-sm font-bold text-black transition-colors hover:bg-gold-hover focus-visible:outline-2 focus-visible:outline-gold"
        >
          پیگیری
        </button>
      </form>

      {trimmedCode ? <OrderResult code={trimmedCode} /> : null}

      {trimmedCode ? null : (
        <p className="mt-8 text-center text-xs text-muted">
          کد رهگیری پس از ثبت سفارش در اختیار شما قرار می‌گیرد.
        </p>
      )}
    </Container>
  );
}