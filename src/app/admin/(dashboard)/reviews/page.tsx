import type { Metadata } from "next";
import { Badge } from "@/components/ui";
import { getAdminReviews } from "@/lib/admin-content";
import { setReviewApproved, setReviewTestimonial, deleteReviewAction } from "@/app/admin/content-actions";

export const metadata: Metadata = {
  title: "نظرات",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const active = filter === "approved" || filter === "all" ? filter : "pending";
  const reviews = await getAdminReviews({ filter: active });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">نظرات و بازخوردها</h1>
        <p className="mt-1 text-sm text-muted">تأیید یا رد نظرات مشتریان و ساخت بازخورد رسمی.</p>
      </div>

      <div className="flex gap-2">
        {[
          { label: "در انتظار تأیید", value: "pending", href: "/admin/reviews" },
          { label: "منتشرشده", value: "approved", href: "/admin/reviews?filter=approved" },
          { label: "همه", value: "all", href: "/admin/reviews?filter=all" },
        ].map((f) => (
          <a
            key={f.value}
            href={f.href}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-gold ${
              active === f.value
                ? "border-gold/60 bg-gold/10 text-gold"
                : "border-border bg-surface text-foreground hover:border-gold/40 hover:text-gold"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
          <p className="font-semibold text-foreground">نظری در این بخش نیست</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gold tnum">{"★".repeat(r.rating)}</span>
                  <span className="font-semibold text-foreground">{r.authorName ?? "کاربر"}</span>
                  {r.phone ? <span dir="ltr" className="text-xs text-muted tnum">{r.phone}</span> : null}
                  {r.isVerifiedBuyer ? <Badge tone="success">خریدار تأییدشده</Badge> : null}
                  {r.isTestimonial ? <Badge tone="silver">بازخورد رسمی</Badge> : null}
                  {r.isApproved ? <Badge tone="success">منتشر شده</Badge> : <Badge tone="neutral">در انتظار</Badge>}
                </div>
              </div>
              {r.productName ? <p className="mt-1 text-xs text-muted">برای: {r.productName}</p> : null}
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted">{r.comment}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <form action={setReviewApproved.bind(null, r.id, !r.isApproved)}>
                  <button type="submit" className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-gold ${r.isApproved ? "border-danger/40 text-danger hover:border-danger/70" : "border-success/40 text-success hover:border-success/70"}`}>
                    {r.isApproved ? "برداشتن انتشار" : "انتشار نظر"}
                  </button>
                </form>
                <form action={setReviewTestimonial.bind(null, r.id, !r.isTestimonial)}>
                  <button type="submit" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold">
                    {r.isTestimonial ? "برداشتن بازخورد رسمی" : "بازخورد رسمی"}
                  </button>
                </form>
                <form action={deleteReviewAction.bind(null, r.id)}>
                  <button type="submit" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-danger/50 hover:text-danger focus-visible:outline-gold">
                    حذف
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}