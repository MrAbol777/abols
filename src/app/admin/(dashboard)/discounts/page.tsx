import type { Metadata } from "next";
import { Badge } from "@/components/ui";
import { getAdminDiscounts } from "@/lib/admin-content";
import { DiscountForm } from "@/components/admin/DiscountForm";
import { toggleDiscountActive, deleteDiscountAction } from "@/app/admin/content-actions";
import { formatToman, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "تخفیف‌ها",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export default async function AdminDiscountsPage() {
  const discounts = await getAdminDiscounts();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">کدهای تخفیف</h1>
        <p className="mt-1 text-sm text-muted">کدهای تخفیف قابل استفاده در چک‌اوت فروشگاه.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* List */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-bold text-foreground">کدهای موجود</h2>
          {discounts.length === 0 ? (
            <p className="mt-3 text-sm text-muted">هنوز کدی ساخته نشده است.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-border">
              {discounts.map((d) => (
                <li key={d.id} className="flex flex-col gap-2 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span dir="ltr" className="font-bold text-gold">{d.code}</span>
                      {d.isActive ? <Badge tone="success">فعال</Badge> : <Badge tone="danger">غیرفعال</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={toggleDiscountActive.bind(null, d.id)}>
                        <button type="submit" className="rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold">
                          {d.isActive ? "غیرفعال کن" : "فعال کن"}
                        </button>
                      </form>
                      <form action={deleteDiscountAction.bind(null, d.id)}>
                        <button type="submit" className="rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-danger/50 hover:text-danger focus-visible:outline-gold">
                          حذف
                        </button>
                      </form>
                    </div>
                  </div>
                  <p className="text-xs text-muted">
                    {d.type === "PERCENTAGE" ? `${formatNumber(d.value)}٪ تخفیف` : `تخفیف ${formatToman(d.value)}`}
                    {d.minOrderAmount ? ` · حداقل ${formatToman(d.minOrderAmount)}` : ""} ·
                    استفاده {formatNumber(d.usageCount)}{d.usageLimit ? ` از ${formatNumber(d.usageLimit)}` : ""}
                  </p>
                  <p className="text-[11px] text-muted">
                    از {formatDate(d.startsAt)} تا {formatDate(d.endsAt)}
                    {d.description ? ` · ${d.description}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Create form inline */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-bold text-foreground">کد تخفیف جدید</h2>
          <div className="mt-4">
            <DiscountForm />
          </div>
        </section>
      </div>
    </div>
  );
}