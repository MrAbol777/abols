"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth/customer";

export type ReviewActionState = { error?: string };

/**
 * Submit a review for a COMPLETED order item. Only the order owner can review,
 * the order must be COMPLETED, and one review per product per order is allowed.
 * New reviews are unapproved until an admin approves them.
 */
export async function submitReviewAction(
  orderId: string,
  productId: string,
  rating: number,
  comment: string,
): Promise<ReviewActionState> {
  const customer = await requireCustomer();

  const safeRating = Number.isFinite(rating) ? Math.round(rating) : 0;
  const safeComment = String(comment ?? "").trim();

  if (safeRating < 1 || safeRating > 5) {
    return { error: "امتیاز باید بین ۱ تا ۵ باشد." };
  }
  if (safeComment.length < 3) {
    return { error: "متن نظر خیلی کوتاه است." };
  }
  if (safeComment.length > 500) {
    return { error: "متن نظر نباید بیش از ۵۰۰ حرف باشد." };
  }

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: customer.id },
      select: { id: true, status: true },
    });
    if (!order) return { error: "سفارش پیدا نشد." };
    if (order.status !== "COMPLETED") {
      return { error: "فقط برای سفارش‌های تکمیل‌شده می‌توانید نظر ثبت کنید." };
    }

    const item = await prisma.orderItem.findFirst({
      where: { orderId: order.id, productId },
      select: { id: true, productId: true },
    });
    if (!item || !item.productId) {
      return { error: "محصول مورد نظر در این سفارش وجود ندارد." };
    }

    const existing = await prisma.review.findFirst({
      where: { orderId: order.id, productId: item.productId, userId: customer.id },
      select: { id: true },
    });
    if (existing) {
      return { error: "شما قبلاً برای این محصول در این سفارش نظر ثبت کرده‌اید." };
    }

    await prisma.review.create({
      data: {
        orderId: order.id,
        productId: item.productId,
        userId: customer.id,
        rating: safeRating,
        comment: safeComment,
        isVerifiedBuyer: true,
        isApproved: false,
      },
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return {};
  } catch {
    return { error: "خطایی در ثبت نظر رخ داد. لطفاً دوباره تلاش کنید." };
  }
}
