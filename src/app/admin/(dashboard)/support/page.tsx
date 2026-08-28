import type { Metadata } from "next";
import { Badge } from "@/components/ui";
import { getAdminSupportMessages } from "@/lib/admin-content";
import { markSupportStatus } from "@/app/admin/content-actions";

export const metadata: Metadata = {
  title: "پیام‌های پشتیبانی",
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

function statusLabel(status: string): string {
  return status === "NEW" ? "جدید" : status === "READ" ? "خوانده‌شده" : "پاسخ‌داده‌شده";
}

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const newOnly = filter === "all" ? "all" : "new";
  const messages = await getAdminSupportMessages({ filter: newOnly });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">پیام‌های پشتیبانی</h1>
        <p className="mt-1 text-sm text-muted">پیام‌های دریافتی از فرم تماس فروشگاه.</p>
      </div>

      <div className="flex gap-2">
        <a
          href="/admin/support"
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-gold ${
            newOnly === "new"
              ? "border-gold/60 bg-gold/10 text-gold"
              : "border-border bg-surface text-foreground hover:border-gold/40 hover:text-gold"
          }`}
        >
          جدید
        </a>
        <a
          href="/admin/support?filter=all"
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-gold ${
            newOnly === "all"
              ? "border-gold/60 bg-gold/10 text-gold"
              : "border-border bg-surface text-foreground hover:border-gold/40 hover:text-gold"
          }`}
        >
          همه
        </a>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
          <p className="font-semibold text-foreground">پیامی وجود ندارد</p>
          <p className="mt-1 text-sm text-muted">پیام‌های پشتیبانی اینجا نمایش داده می‌شوند.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((m) => (
            <li key={m.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{m.name}</span>
                  <span dir="ltr" className="text-xs text-muted tnum">{m.phone}</span>
                  {m.status === "NEW" ? <Badge tone="gold">جدید</Badge> : <Badge tone="neutral">{statusLabel(m.status)}</Badge>}
                </div>
                <span className="text-xs text-muted tnum">{formatDateTime(m.createdAt)}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted">{m.message}</p>
              <div className="mt-3 flex gap-2">
                {m.status === "NEW" ? (
                  <form action={markSupportStatus.bind(null, m.id, "READ")}>
                    <button type="submit" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold">
                      علامت خوانده‌شده
                    </button>
                  </form>
                ) : null}
                {m.status !== "RESOLVED" ? (
                  <form action={markSupportStatus.bind(null, m.id, "RESOLVED")}>
                    <button type="submit" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold">
                      علامت پاسخ‌داده‌شده
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}