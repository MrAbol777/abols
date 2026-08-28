import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { getAdminCategories } from "@/lib/admin-catalog";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { toggleCategoryAction } from "@/app/admin/catalog-actions";

export const metadata: Metadata = {
  title: "دسته‌بندی‌ها",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">دسته‌بندی‌ها</h1>
        <p className="mt-1 text-sm text-muted">مدیریت دسته‌بندی محصولات فروشگاه.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* List */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-bold text-foreground">دسته‌های موجود</h2>
          {categories.length === 0 ? (
            <p className="mt-3 text-sm text-muted">هنوز دسته‌ای ساخته نشده است.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-border">
              {categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{c.name}</span>
                      {c.isActive ? (
                        <Badge tone="success">فعال</Badge>
                      ) : (
                        <Badge tone="danger">غیرفعال</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      <span dir="ltr">{c.slug}</span> · {c.productCount} محصول
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <form action={toggleCategoryAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold"
                      >
                        {c.isActive ? "غیرفعال کن" : "فعال کن"}
                      </button>
                    </form>
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold"
                    >
                      ویرایش
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Create */}
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-bold text-foreground">دسته جدید</h2>
          <div className="mt-4">
            <CategoryForm />
          </div>
        </section>
      </div>
    </div>
  );
}