"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { settingsSchema } from "@/lib/schemas";

export type ContentActionState = {
  status?: "idle" | "success" | "error";
  message?: string;
};

/* Settings ---------------------------------------------------------------- */

export async function saveSettingsAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    brandName: String(formData.get("brandName") ?? ""),
    successfulOrders: formData.get("successfulOrders") ?? 0,
    cardHolderName: String(formData.get("cardHolderName") ?? ""),
    cardNumber: String(formData.get("cardNumber") ?? ""),
    telegramUrl: String(formData.get("telegramUrl") ?? ""),
    rubikaUrl: String(formData.get("rubikaUrl") ?? ""),
    supportText: String(formData.get("supportText") ?? ""),
  });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "اطلاعات معتبر نیست.";
    return { status: "error", message: msg };
  }
  const d = parsed.data;
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: { ...d },
    create: { id: "singleton", ...d },
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { status: "success", message: "تنظیمات ذخیره شد." };
}

/* Support ---------------------------------------------------------------- */

export async function markSupportStatus(
  id: string,
  status: string,
): Promise<void> {
  await requireAdmin();
  if (!["NEW", "READ", "RESOLVED"].includes(status)) return;
  await prisma.supportMessage.update({ where: { id }, data: { status } });
  revalidatePath("/admin/support");
}

/* Reviews ---------------------------------------------------------------- */

export async function setReviewApproved(
  id: string,
  approved: boolean,
): Promise<void> {
  await requireAdmin();
  await prisma.review.update({ where: { id }, data: { isApproved: approved } });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function setReviewTestimonial(
  id: string,
  testimonial: boolean,
): Promise<void> {
  await requireAdmin();
  await prisma.review.update({ where: { id }, data: { isTestimonial: testimonial } });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function deleteReviewAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

/* Discounts -------------------------------------------------------------- */

export async function createDiscountAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  await requireAdmin();
  const input = parseDiscountForm(formData);
  if (input.error) return { status: "error", message: input.error };
  try {
    await prisma.discount.create({ data: input.data! });
  } catch {
    return { status: "error", message: "این کد قبلاً استفاده شده است." };
  }
  revalidatePath("/admin/discounts");
  return { status: "success", message: "کد تخفیف ایجاد شد." };
}

export async function updateDiscountAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const input = parseDiscountForm(formData);
  if (input.error) return { status: "error", message: input.error };
  try {
    await prisma.discount.update({ where: { id }, data: input.data! });
  } catch {
    return { status: "error", message: "این کد قبلاً استفاده شده است." };
  }
  revalidatePath("/admin/discounts");
  return { status: "success", message: "کد تخفیف به‌روزرسانی شد." };
}

export async function toggleDiscountActive(id: string): Promise<void> {
  await requireAdmin();
  const d = await prisma.discount.findUnique({ where: { id } });
  if (!d) return;
  await prisma.discount.update({ where: { id }, data: { isActive: !d.isActive } });
  revalidatePath("/admin/discounts");
}

export async function deleteDiscountAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.discount.delete({ where: { id } });
  revalidatePath("/admin/discounts");
}

function parseDiscountForm(formData: FormData) {
  const type = String(formData.get("type") ?? "PERCENTAGE");
  const value = Number(formData.get("value") ?? 0);
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return { error: "کد تخفیف الزامی است." };
  if (type === "PERCENTAGE" && (value < 1 || value > 100)) {
    return { error: "درصد تخفیف باید بین ۱ تا ۱۰۰ باشد." };
  }
  if (type === "FIXED" && value < 0) return { error: "مبلغ تخفیف نامعتبر است." };
  const minOrderAmountRaw = String(formData.get("minOrderAmount") ?? "").trim();
  const usageLimitRaw = String(formData.get("usageLimit") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();
  const endsAtRaw = String(formData.get("endsAt") ?? "").trim();
  return {
    data: {
      code,
      type,
      value: Math.round(value),
      description: String(formData.get("description") ?? "") || null,
      isActive: String(formData.get("isActive") ?? "on") === "on",
      minOrderAmount: minOrderAmountRaw ? Math.round(Number(minOrderAmountRaw)) : null,
      usageLimit: usageLimitRaw ? Math.round(Number(usageLimitRaw)) : null,
      startsAt: startsAtRaw ? new Date(startsAtRaw) : null,
      endsAt: endsAtRaw ? new Date(endsAtRaw) : null,
    },
  };
}

/* Blog ------------------------------------------------------------------- */

export async function createBlogPostAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  await requireAdmin();
  const input = parseBlogForm(formData);
  if (input.error) return { status: "error", message: input.error };
  try {
    await prisma.blogPost.create({ data: input.data! });
  } catch {
    return { status: "error", message: "این اسلاگ قبلاً استفاده شده است." };
  }
  revalidatePath("/admin/blog");
  return { status: "success", message: "مقاله ایجاد شد." };
}

export async function updateBlogPostAction(
  _prev: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const input = parseBlogForm(formData);
  if (input.error) return { status: "error", message: input.error };
  try {
    await prisma.blogPost.update({ where: { id }, data: input.data! });
  } catch {
    return { status: "error", message: "این اسلاگ قبلاً استفاده شده است." };
  }
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { status: "success", message: "مقاله به‌روزرسانی شد." };
}

export async function toggleBlogPublish(id: string): Promise<void> {
  await requireAdmin();
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return;
  await prisma.blogPost.update({
    where: { id },
    data: {
      isPublished: !post.isPublished,
      publishedAt: !post.isPublished ? new Date() : post.publishedAt,
    },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function deleteBlogPostAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

function parseBlogForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const content = String(formData.get("content") ?? "");
  const isPublished = String(formData.get("isPublished") ?? "on") === "on";
  if (!title) return { error: "عنوان الزامی است." };
  if (!slug) return { error: "اسلاگ الزامی است." };
  return {
    data: {
      title,
      slug,
      content,
      excerpt: String(formData.get("excerpt") ?? "").trim() || null,
      featuredImage: String(formData.get("featuredImage") ?? "").trim() || null,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
  };
}
