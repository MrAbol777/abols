import type { Metadata } from "next";
import Link from "next/link";
import { Badge, buttonClasses } from "@/components/ui";
import { getAdminBlogPosts } from "@/lib/admin-content";
import { toggleBlogPublish, deleteBlogPostAction } from "@/app/admin/content-actions";

export const metadata: Metadata = {
  title: "وبلاگ",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export default async function AdminBlogPage() {
  const posts = await getAdminBlogPosts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">وبلاگ</h1>
          <p className="mt-1 text-sm text-muted">مقالات آموزشی و اطلاع‌رسانی فروشگاه.</p>
        </div>
        <Link href="/admin/blog/new" className={buttonClasses("primary", "md")}>
          + مقاله جدید
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
          <p className="font-semibold text-foreground">هنوز مقاله‌ای نوشته نشده است.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs text-muted">
                <th scope="col" className="px-4 py-3 text-start font-medium">عنوان</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">تاریخ</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">وضعیت</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-elevated/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/blog/${p.id}`}
                      className="font-medium text-foreground transition-colors hover:text-gold focus-visible:outline-gold"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted"><span dir="ltr">{p.slug}</span></p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted tnum">{formatDate(p.updatedAt)}</td>
                  <td className="px-4 py-3">
                    {p.isPublished ? <Badge tone="success">منتشر شده</Badge> : <Badge tone="neutral">پیش‌نویس</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/blog/${p.id}`} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold">
                        ویرایش
                      </Link>
                      <form action={toggleBlogPublish.bind(null, p.id)}>
                        <button type="submit" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold">
                          {p.isPublished ? "پیش‌نویس" : "انتشار"}
                        </button>
                      </form>
                      <form action={deleteBlogPostAction.bind(null, p.id)}>
                        <button type="submit" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-danger/50 hover:text-danger focus-visible:outline-gold">
                          حذف
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}