import { prisma } from "./prisma";

/**
 * Admin product & category data access.
 */

export type AdminProductListItem = {
  id: string;
  name: string;
  slug: string;
  type: string;
  price: number;
  compareAtPrice: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isBestSelling: boolean;
  inventoryMode: string;
  inStock: boolean;
  quantity: number | null;
  categoryName: string | null;
  updatedAt: Date;
};

export async function getAdminProducts(opts: {
  categoryId?: string | null;
  active?: "all" | "active" | "inactive";
}): Promise<AdminProductListItem[]> {
  const where = {
    ...(opts.categoryId ? { categoryId: opts.categoryId } : {}),
    ...(opts.active === "active"
      ? { isActive: true }
      : opts.active === "inactive"
        ? { isActive: false }
        : {}),
  };
  const products = await prisma.product.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { category: { select: { name: true } } },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    type: p.type,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isBestSelling: p.isBestSelling,
    inventoryMode: p.inventoryMode,
    inStock: p.inStock,
    quantity: p.quantity,
    categoryName: p.category?.name ?? null,
    updatedAt: p.updatedAt,
  }));
}

export type AdminCategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
};

export async function getAdminCategories(): Promise<AdminCategoryItem[]> {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    isActive: c.isActive,
    sortOrder: c.sortOrder,
    productCount: c._count.products,
  }));
}

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  type: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestSelling: boolean;
  inventoryMode: string;
  inStock: boolean;
  quantity: number | null;
  cancellationPolicy: string | null;
  attributes: Array<{ id: string; key: string; label: string; value: string; sortOrder: number }>;
  checkoutFields: Array<{
    id: string;
    label: string;
    fieldKey: string;
    fieldType: string;
    required: boolean;
    placeholder: string | null;
    helpText: string | null;
    options: string[]; // parsed
    sortOrder: number;
  }>;
  media: Array<{ id: string; url: string; type: string; alt: string | null; sortOrder: number }>;
};

export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  try {
    const p = await prisma.product.findUnique({
      where: { id },
      include: {
        attributes: { orderBy: { sortOrder: "asc" } },
        checkoutFields: { orderBy: { sortOrder: "asc" } },
        media: { orderBy: { sortOrder: "asc" } },
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
      categoryId: p.categoryId,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      isBestSelling: p.isBestSelling,
      inventoryMode: p.inventoryMode,
      inStock: p.inStock,
      quantity: p.quantity,
      cancellationPolicy: p.cancellationPolicy,
      attributes: p.attributes.map((a) => ({
        id: a.id,
        key: a.key,
        label: a.label,
        value: a.value,
        sortOrder: a.sortOrder,
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
        sortOrder: f.sortOrder,
      })),
      media: p.media.map((m) => ({
        id: m.id,
        url: m.url,
        type: m.type,
        alt: m.alt,
        sortOrder: m.sortOrder,
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
