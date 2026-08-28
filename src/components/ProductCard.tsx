import Link from "next/link";
import type { ProductCardData } from "@/lib/site";
import { formatToman } from "@/lib/format";
import { Badge } from "./ui";

const typeLabels: Record<string, string> = {
  CP: "سی‌پی",
  ACCOUNT: "اکانت",
  COMBO: "کمبو",
};

// A tasteful branded glyph per product type used as the image fallback.
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
      <span className="brand-wordmark text-4xl font-black tracking-tight">{label}</span>
    </div>
  );
}

function availabilityBadge(p: ProductCardData) {
  if (p.inventoryMode === "EXACT_QUANTITY") {
    if ((p.quantity ?? 0) > 0) return <Badge tone="success">موجود</Badge>;
    return <Badge tone="danger">ناموجود</Badge>;
  }
  if (p.inventoryMode === "STATUS_ONLY") {
    return p.inStock ? <Badge tone="success">موجود</Badge> : <Badge tone="danger">ناموجود</Badge>;
  }
  return <Badge tone="success">موجود</Badge>;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-gold/40 hover:shadow-[0_10px_40px_-20px_rgba(212,175,55,0.5)]">
      {/* Media */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
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
        <div className="absolute right-3 top-3 flex flex-wrap gap-1.5">
          {product.isFeatured ? <Badge tone="gold">ویژه</Badge> : null}
          {product.isBestSelling ? <Badge tone="silver">پرفروش</Badge> : null}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted">
            {product.categoryName ?? typeLabels[product.type] ?? "محصول"}
          </span>
          {availabilityBadge(product)}
        </div>

        <h3 className="line-clamp-1 text-base font-bold text-foreground">{product.name}</h3>

        {product.shortDescription ? (
          <p className="line-clamp-2 min-h-[2.5rem] text-xs leading-6 text-muted">
            {product.shortDescription}
          </p>
        ) : (
          <p className="min-h-[2.5rem]" aria-hidden />
        )}

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-3">
          <div className="flex flex-col">
            {hasDiscount ? (
              <span className="text-xs text-muted line-through tnum">
                {formatToman(product.compareAtPrice as number)}
              </span>
            ) : null}
            <span className="text-sm font-extrabold text-gold tnum">
              {formatToman(product.price)}
            </span>
          </div>
          <Link
            href={`/shop/${product.slug}`}
            className="rounded-lg bg-elevated px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-gold hover:text-black focus-visible:outline-gold"
          >
            مشاهده
          </Link>
        </div>
      </div>
    </div>
  );
}
