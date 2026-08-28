import { prisma } from "./prisma";

/**
 * Server-side data access for public pages. Every function degrades gracefully
 * (returns safe defaults / empty arrays) so pages never crash on an empty or
 * unreachable database.
 */

export type SiteSettingsView = {
  brandName: string;
  successfulOrders: number;
  cardHolderName: string | null;
  cardNumber: string | null;
  telegramUrl: string | null;
  rubikaUrl: string | null;
  supportText: string | null;
};

const DEFAULT_SETTINGS: SiteSettingsView = {
  brandName: "Abol Store",
  successfulOrders: 0,
  cardHolderName: null,
  cardNumber: null,
  telegramUrl: null,
  rubikaUrl: null,
  supportText: "برای ثبت سفارش یا پرسیدن سوال، از راه‌های زیر با ما در ارتباط باشید.",
};

export async function getSiteSettings(): Promise<SiteSettingsView> {
  try {
    const s = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
    if (!s) return DEFAULT_SETTINGS;
    return {
      brandName: s.brandName || DEFAULT_SETTINGS.brandName,
      successfulOrders: s.successfulOrders ?? 0,
      cardHolderName: s.cardHolderName,
      cardNumber: s.cardNumber,
      telegramUrl: s.telegramUrl,
      rubikaUrl: s.rubikaUrl,
      supportText: s.supportText ?? DEFAULT_SETTINGS.supportText,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  type: string;
  isFeatured: boolean;
  isBestSelling: boolean;
  inventoryMode: string;
  inStock: boolean;
  quantity: number | null;
  categoryName: string | null;
  imageUrl: string | null;
};

type ProductWhere = {
  isActive?: boolean;
  isFeatured?: boolean;
  isBestSelling?: boolean;
};

async function queryProducts(where: ProductWhere, take: number): Promise<ProductCardData[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, ...where },
      take,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        media: {
          where: { type: "IMAGE" },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      type: p.type,
      isFeatured: p.isFeatured,
      isBestSelling: p.isBestSelling,
      inventoryMode: p.inventoryMode,
      inStock: p.inStock,
      quantity: p.quantity,
      categoryName: p.category?.name ?? null,
      imageUrl: p.media[0]?.url ?? null,
    }));
  } catch {
    return [];
  }
}

export function getFeaturedProducts(take = 6): Promise<ProductCardData[]> {
  return queryProducts({ isFeatured: true }, take);
}

export function getBestSellingProducts(take = 4): Promise<ProductCardData[]> {
  return queryProducts({ isBestSelling: true }, take);
}

/** All active products for the shop listing, optionally filtered by category slug. */
export async function getShopProducts(opts: {
  categorySlug?: string | null;
  query?: string | null;
}): Promise<ProductCardData[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(opts.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
        ...(opts.query
          ? {
              OR: [
                { name: { contains: opts.query } },
                { shortDescription: { contains: opts.query } },
                { fullDescription: { contains: opts.query } },
              ],
            }
          : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        category: { select: { name: true, slug: true } },
        media: {
          where: { type: "IMAGE" },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      type: p.type,
      isFeatured: p.isFeatured,
      isBestSelling: p.isBestSelling,
      inventoryMode: p.inventoryMode,
      inStock: p.inStock,
      quantity: p.quantity,
      categoryName: p.category?.name ?? null,
      imageUrl: p.media[0]?.url ?? null,
    }));
  } catch {
    return [];
  }
}

export type ProductDetailData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  type: string;
  inventoryMode: string;
  inStock: boolean;
  quantity: number | null;
  cancellationPolicy: string | null;
  categoryName: string | null;
  imageUrl: string | null;
  attributes: Array<{ key: string; label: string; value: string }>;
  checkoutFields: Array<{
    id: string;
    label: string;
    fieldKey: string;
    fieldType: string;
    required: boolean;
    placeholder: string | null;
    helpText: string | null;
    options: string[];
  }>;
};

export async function getProductBySlug(slug: string): Promise<ProductDetailData | null> {
  try {
    const p = await prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        category: { select: { name: true } },
        media: {
          where: { type: "IMAGE" },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        attributes: { orderBy: { sortOrder: "asc" } },
        checkoutFields: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      type: p.type,
      inventoryMode: p.inventoryMode,
      inStock: p.inStock,
      quantity: p.quantity,
      cancellationPolicy: p.cancellationPolicy,
      categoryName: p.category?.name ?? null,
      imageUrl: p.media[0]?.url ?? null,
      attributes: p.attributes.map((a) => ({
        key: a.key,
        label: a.label,
        value: a.value,
      })),
      checkoutFields: p.checkoutFields.map((f) => ({
        id: f.id,
        label: f.label,
        fieldKey: f.fieldKey,
        fieldType: f.fieldType,
        required: f.required,
        placeholder: f.placeholder,
        helpText: f.helpText,
        options: parseOptions(f.options),
      })),
    };
  } catch {
    return null;
  }
}

function parseOptions(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

export type CategoryView = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export async function getActiveCategories(): Promise<CategoryView[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true, description: true },
    });
    return categories;
  } catch {
    return [];
  }
}

export type TestimonialView = {
  id: string;
  authorName: string | null;
  rating: number;
  comment: string;
  isVerifiedBuyer: boolean;
  isTestimonial: boolean;
};

export async function getApprovedTestimonials(take = 6): Promise<TestimonialView[]> {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true },
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        authorName: true,
        rating: true,
        comment: true,
        isVerifiedBuyer: true,
        isTestimonial: true,
      },
    });
    return reviews;
  } catch {
    return [];
  }
}

export type FaqView = {
  id: string;
  question: string;
  answer: string;
};

export async function getActiveFaqs(take = 8): Promise<FaqView[]> {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      take,
      orderBy: { sortOrder: "asc" },
      select: { id: true, question: true, answer: true },
    });
    return faqs;
  } catch {
    return [];
  }
}
