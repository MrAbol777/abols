import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Badge } from "@/components/ui";
import { AddToCartButton } from "@/components/AddToCartButton";
import { getProductBySlug } from "@/lib/site";
import { formatToman } from "@/lib/format";

// Fresh stock/price on every visit.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "محصول یافت نشد" };
  return {
    title: product.name,
    description: product.shortDescription ?? product.fullDescription ?? undefined,
  };
}

const typeLabels: Record<string, string> = {
  CP: "سی‌پی",
  ACCOUNT: "اکانت",
  COMBO: "کمبو",
};

function TypeGlyph({ type }: { type: string }) {
  const label = type === "CP" ? "CP" : type === "ACCOUNT" ? "AC" : "CO";
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-elevated to-surface">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(1200px 200px at 50% 0%, rgba(212,175,55,0.25), transparent 60%)",
        }}
        aria-hidden
      />
      <span className="brand-wordmark text-5xl font-black sm:text-6xl">{label}</span>
    </div>
  );
}

function availability(p: {
  inventoryMode: string;
  inStock: boolean;
  quantity: number | null;
}) {
  if (p.inventoryMode === "EXACT_QUANTITY") {
    return (p.quantity ?? 0) > 0 ? (
      <Badge tone="success">موجود</Badge>
    ) : (
      <Badge tone="danger">ناموجود</Badge>
    );
  }
  if (p.inventoryMode === "STATUS_ONLY") {
    return p.inStock ? <Badge tone="success">موجود</Badge> : <Badge tone="danger">ناموجود</Badge>;
  }
  return <Badge tone="success">موجود</Badge>;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <Container className="py-10 sm:py-14">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted" aria-label="مسیر">
        <Link href="/" className="transition-colors hover:text-gold focus-visible:outline-gold">
          خانه
        </Link>
        <span aria-hidden>/</span>
        <Link href="/shop" className="transition-colors hover:text-gold focus-visible:outline-gold">
          فروشگاه
        </Link>
        {product.categoryName ? (
          <>
            <span aria-hidden>/</span>
            <span>{product.categoryName}</span>
          </>
        ) : null}
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Media */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <TypeGlyph type={product.type} />
          )}
          {product.type !== "CP" ? (
            <div className="absolute right-3 top-3">
              <Badge tone="gold">{typeLabels[product.type] ?? product.type}</Badge>
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {product.categoryName ? (
                <span className="text-xs text-muted">{product.categoryName}</span>
              ) : null}
              {availability(product)}
            </div>
            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              {product.name}
            </h1>
            {product.shortDescription ? (
              <p className="text-sm leading-7 text-muted">{product.shortDescription}</p>
            ) : null}
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 rounded-2xl border border-gold/25 bg-gold/10 px-5 py-4">
            <div className="flex flex-col gap-1">
              {hasDiscount ? (
                <span className="text-sm text-muted line-through tnum">
                  {formatToman(product.compareAtPrice as number)}
                </span>
              ) : null}
              <span className="text-3xl font-black text-gold tnum">
                {formatToman(product.price)}
              </span>
            </div>
            {hasDiscount ? <Badge tone="danger">تخفیف</Badge> : null}
          </div>

          {/* Add to cart */}
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              quantity: 1,
            }}
          />

          {product.cancellationPolicy ? (
            <p className="rounded-xl border border-border bg-surface px-4 py-3 text-xs leading-6 text-muted">
              <span className="font-semibold text-foreground">قوانین لغو:</span>{" "}
              {product.cancellationPolicy}
            </p>
          ) : null}

          {/* Attributes */}
          {product.attributes.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold text-foreground">مشخصات محصول</h2>
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.attributes.map((a) => (
                  <div
                    key={a.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                  >
                    <dt className="text-muted">{a.label}</dt>
                    <dd className="font-medium text-foreground">{a.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {product.fullDescription ? (
            <div className="flex flex-col gap-2 border-t border-border pt-5">
              <h2 className="text-sm font-bold text-foreground">توضیحات کامل</h2>
              <p className="whitespace-pre-line text-sm leading-7 text-muted">
                {product.fullDescription}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </Container>
  );
}