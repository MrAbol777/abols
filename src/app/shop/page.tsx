import type { Metadata } from "next";
import Link from "next/link";
import { Container, EmptyState, Badge } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";
import { getShopProducts, getActiveCategories } from "@/lib/site";

export const metadata: Metadata = {
  title: "فروشگاه",
  description: "فروشگاه ابول استور — خرید CP، اکانت و کمبو کالاف دیوتی موبایل.",
};

// Fresh stock/price data on every visit.
export const dynamic = "force-dynamic";

const categoryTabs = [
  { label: "همه", slug: null },
  { label: "خرید CP", slug: "cp" },
  { label: "خرید اکانت", slug: "account" },
  { label: "خرید کمبو", slug: "combo" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const activeSlug =
    categoryTabs.some((t) => t.slug === category) && category ? category : null;

  const [products, categories] = await Promise.all([
    getShopProducts({ categorySlug: activeSlug, query: q?.trim() || null }),
    getActiveCategories(),
  ]);

  const activeCategoryName =
    categories.find((c) => c.slug === activeSlug)?.name ?? null;

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
          فروشگاه ابول استور
        </h1>
        <p className="text-sm leading-7 text-muted">
          {activeCategoryName
            ? `محصولات دسته‌ی «${activeCategoryName}»`
            : "همه‌ی محصولات CP، اکانت و کمبو"}
        </p>
      </div>

      {/* Category tabs */}
      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="دسته‌بندی">
        {categoryTabs.map((tab) => {
          const isActive = tab.slug === activeSlug;
          const href = tab.slug
            ? `/shop?category=${tab.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`
            : `/shop${q ? `?q=${encodeURIComponent(q)}` : ""}`;
          return (
            <Link
              key={tab.slug ?? "all"}
              href={href}
              role="tab"
              aria-selected={isActive}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-gold ${
                isActive
                  ? "border-gold/60 bg-gold/10 text-gold"
                  : "border-border bg-surface text-foreground hover:border-gold/40 hover:text-gold"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Products */}
      <div className="mt-8">
        {products.length === 0 ? (
          <EmptyState
            title={q ? "نتیجه‌ای برای جستجو پیدا نشد" : "محصولی در این دسته موجود نیست"}
            description={
              q
                ? `برای «${q}» محصولی پیدا نکردیم. عبارت دیگری را امتحان کنید.`
                : "محصولات این دسته به‌زودی اضافه می‌شوند."
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {q ? (
        <p className="mt-6 text-sm text-muted">
          <Badge tone="neutral">جستجو:</Badge> <span className="ps-1">{q}</span> —{" "}
          <Link href="/shop" className="text-gold hover:underline focus-visible:outline-gold">
            پاک کردن
          </Link>
        </p>
      ) : null}
    </Container>
  );
}