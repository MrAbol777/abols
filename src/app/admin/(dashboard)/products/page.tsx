import type { Metadata } from "next";
import Link from "next/link";
import { Badge, buttonClasses } from "@/components/ui";
import { getAdminProducts, getAdminCategories } from "@/lib/admin-catalog";
import { toggleProductActiveAction, toggleProductFeaturedAction, toggleProductBestSellingAction } from "@/app/admin/catalog-actions";
import { formatToman } from "@/lib/format";

export const metadata: Metadata = {
  title: "محصولات",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = { CP: "سی‌پی", ACCOUNT: "اکانت", COMBO: "کمبو" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; active?: string }>;
}) {
  const { category, active } = await searchParams;
  const activeFilter = active === "inactive" ? "inactive" : active === "all" ? "all" : "active";

  const [products, categories] = await Promise.all([
    getAdminProducts({ categoryId: category || null, active: activeFilter }),
    getAdminCategories(),
  ]);

  const activeCatId = categories.some((c) => c.id === category) ? category : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">محصولات</h1>
          <p className="mt-1 text-sm text-muted">مدیریت محصولات CP، اکانت و کمبو.</p>
        </div>
        <Link href="/admin/products/new" className={buttonClasses("primary", "md")}>
          + محصول جدید
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/products"
          aria-current={activeFilter === "active" && !activeCatId ? "page" : undefined}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-gold ${
            activeFilter === "active" && !activeCatId
              ? "border-gold/60 bg-gold/10 text-gold"
              : "border-border bg-surface text-foreground hover:border-gold/40 hover:text-gold"
          }`}
        >
          فعال
        </Link>
        <Link
          href="/admin/products?active=inactive"
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-gold ${
            activeFilter === "inactive" && !activeCatId
              ? "border-gold/60 bg-gold/10 text-gold"
              : "border-border bg-surface text-foreground hover:border-gold/40 hover:text-gold"
          }`}
        >
          غیرفعال
        </Link>
        <Link
          href="/admin/products?active=all"
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-gold ${
            activeFilter === "all" && !activeCatId
              ? "border-gold/60 bg-gold/10 text-gold"
              : "border-border bg-surface text-foreground hover:border-gold/40 hover:text-gold"
          }`}
        >
          همه
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/admin/products?category=${c.id}`}
            aria-current={activeCatId === c.id ? "page" : undefined}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-gold ${
              activeCatId === c.id
                ? "border-gold/60 bg-gold/10 text-gold"
                : "border-border bg-surface text-foreground hover:border-gold/40 hover:text-gold"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* List */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
          <p className="font-semibold text-foreground">محصولی یافت نشد</p>
          <p className="mt-1 text-sm text-muted">اولین محصول را بسازید.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs text-muted">
                <th scope="col" className="px-4 py-3 text-start font-medium">نام</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">دسته</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">قیمت</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">موجودی</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">فلگ‌ها</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-elevated/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-medium text-foreground transition-colors hover:text-gold focus-visible:outline-gold"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted">
                      {typeLabels[p.type] ?? p.type} · <span dir="ltr">{p.slug}</span>
                      {!p.isActive ? " · غیرفعال" : null}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.categoryName ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold text-foreground tnum">{formatToman(p.price)}</td>
                  <td className="px-4 py-3">
                    {p.inventoryMode === "EXACT_QUANTITY" ? (
                      p.quantity && p.quantity > 0 ? (
                        <Badge tone="success">موجود</Badge>
                      ) : (
                        <Badge tone="danger">ناموجود</Badge>
                      )
                    ) : p.inventoryMode === "STATUS_ONLY" ? (
                      p.inStock ? <Badge tone="success">موجود</Badge> : <Badge tone="danger">ناموجود</Badge>
                    ) : (
                      <Badge tone="neutral">نامحدود</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <form action={toggleProductFeaturedAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors focus-visible:outline-gold ${p.isFeatured ? "border-gold/50 bg-gold/15 text-gold" : "border-border text-muted hover:text-gold"}`}>
                          {p.isFeatured ? "ویژه ✓" : "ویژه"}
                        </button>
                      </form>
                      <form action={toggleProductBestSellingAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors focus-visible:outline-gold ${p.isBestSelling ? "border-silver/50 bg-silver/15 text-silver" : "border-border text-muted hover:text-gold"}`}>
                          {p.isBestSelling ? "پرفروش ✓" : "پرفروش"}
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/${p.id}`} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold">
                        ویرایش
                      </Link>
                      <form action={toggleProductActiveAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold">
                          {p.isActive ? "غیرفعال کن" : "فعال کن"}
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