import { prisma } from "./prisma";

/**
 * Admin data access for reviews, discounts, blog, support messages and settings.
 */

/* Reviews ----------------------------------------------------------------- */

export type AdminReviewItem = {
  id: string;
  authorName: string | null;
  phone: string | null;
  rating: number;
  comment: string;
  productName: string | null;
  isApproved: boolean;
  isTestimonial: boolean;
  isVerifiedBuyer: boolean;
  createdAt: Date;
};

export async function getAdminReviews(opts: {
  filter?: "pending" | "approved" | "all";
}): Promise<AdminReviewItem[]> {
  const where =
    opts.filter === "pending"
      ? { isApproved: false }
      : opts.filter === "approved"
        ? { isApproved: true }
        : {};
  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true } },
      user: { select: { phone: true } },
    },
  });
  return reviews.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    phone: r.user?.phone ?? null,
    rating: r.rating,
    comment: r.comment,
    productName: r.product?.name ?? null,
    isApproved: r.isApproved,
    isTestimonial: r.isTestimonial,
    isVerifiedBuyer: r.isVerifiedBuyer,
    createdAt: r.createdAt,
  }));
}

/* Discounts --------------------------------------------------------------- */

export type AdminDiscountItem = {
  id: string;
  code: string;
  description: string | null;
  type: string;
  value: number;
  isActive: boolean;
  usageLimit: number | null;
  usageCount: number;
  minOrderAmount: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
};

export async function getAdminDiscounts(): Promise<AdminDiscountItem[]> {
  const discounts = await prisma.discount.findMany({ orderBy: { createdAt: "desc" } });
  return discounts.map((d) => ({
    id: d.id,
    code: d.code,
    description: d.description,
    type: d.type,
    value: d.value,
    isActive: d.isActive,
    usageLimit: d.usageLimit,
    usageCount: d.usageCount,
    minOrderAmount: d.minOrderAmount,
    startsAt: d.startsAt,
    endsAt: d.endsAt,
  }));
}

/* Blog -------------------------------------------------------------------- */

export type AdminBlogItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
};

export async function getAdminBlogPosts(): Promise<AdminBlogItem[]> {
  const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    isPublished: p.isPublished,
    publishedAt: p.publishedAt,
    updatedAt: p.updatedAt,
  }));
}

export async function getAdminBlogPostById(id: string) {
  try {
    return await prisma.blogPost.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

/* Support messages -------------------------------------------------------- */

export type AdminSupportItem = {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: string;
  userId: string | null;
  createdAt: Date;
};

export async function getAdminSupportMessages(opts: {
  filter?: "new" | "all";
}): Promise<AdminSupportItem[]> {
  const where = opts.filter === "new" ? { status: "NEW" } : {};
  const messages = await prisma.supportMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return messages.map((m) => ({
    id: m.id,
    name: m.name,
    phone: m.phone,
    message: m.message,
    status: m.status,
    userId: m.userId,
    createdAt: m.createdAt,
  }));
}

/* Settings ---------------------------------------------------------------- */

export type SettingsInput = {
  brandName: string;
  successfulOrders: number;
  cardHolderName: string;
  cardNumber: string;
  telegramUrl: string;
  rubikaUrl: string;
  supportText: string;
};

export async function getSettingsForForm(): Promise<SettingsInput> {
  const s = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
  return {
    brandName: s?.brandName ?? "Abol Store",
    successfulOrders: s?.successfulOrders ?? 0,
    cardHolderName: s?.cardHolderName ?? "",
    cardNumber: s?.cardNumber ?? "",
    telegramUrl: s?.telegramUrl ?? "",
    rubikaUrl: s?.rubikaUrl ?? "",
    supportText: s?.supportText ?? "",
  };
}
