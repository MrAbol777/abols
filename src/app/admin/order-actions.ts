"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";

export type OrderReviewState = { error?: string };

/**
 * Approve a pending payment receipt: marks it APPROVED and moves the order to
 * PAYMENT_APPROVED with a recorded status-history entry.
 */
export async function approveReceipt(
  orderId: string,
  receiptId: string,
): Promise<OrderReviewState> {
  const admin = await requireAdmin();
  const receipt = await prisma.paymentReceipt.findUnique({ where: { id: receiptId } });

  if (!receipt || receipt.orderId !== orderId) {
    return { error: "رسید پیدا نشد." };
  }
  if (receipt.status === "APPROVED") {
    revalidatePath(`/admin/orders/${orderId}`);
    return {};
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentReceipt.update({
      where: { id: receiptId },
      data: { status: "APPROVED", reviewedBy: admin.id, reviewedAt: new Date() },
    });
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAYMENT_APPROVED" },
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: "PAYMENT_APPROVED",
        actor: `admin:${admin.id}`,
        note: "پرداخت تأیید شد.",
      },
    });
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}

/**
 * Reject a pending payment receipt: marks it REJECTED with a reason and moves
 * the order to RECEIPT_REJECTED so the customer can see why and re-upload.
 */
export async function rejectReceipt(
  orderId: string,
  receiptId: string,
  formData: FormData,
): Promise<OrderReviewState> {
  const admin = await requireAdmin();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) {
    return { error: "دلیل رد کردن رسید را بنویسید." };
  }

  const receipt = await prisma.paymentReceipt.findUnique({ where: { id: receiptId } });
  if (!receipt || receipt.orderId !== orderId) {
    return { error: "رسید پیدا نشد." };
  }
  if (receipt.status === "REJECTED") {
    revalidatePath(`/admin/orders/${orderId}`);
    return {};
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentReceipt.update({
      where: { id: receiptId },
      data: { status: "REJECTED", rejectionReason: reason, reviewedBy: admin.id, reviewedAt: new Date() },
    });
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    await tx.order.update({
      where: { id: orderId },
      data: { status: "RECEIPT_REJECTED" },
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: "RECEIPT_REJECTED",
        actor: `admin:${admin.id}`,
        note: `رسید رد شد: ${reason}`,
      },
    });
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}

/** Advance an order to PROCESSING (used after payment approval). */
export async function markOrderProcessing(
  orderId: string,
): Promise<OrderReviewState> {
  const admin = await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "سفارش پیدا نشد." };
  if (order.status !== "PAYMENT_APPROVED") {
    return { error: "فقط سفارش‌های با پرداخت تأییدشده را می‌توان به مرحله‌ی انجام برد." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "PROCESSING" } });
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: "PROCESSING",
        actor: `admin:${admin.id}`,
        note: "سفارش در حال انجام است.",
      },
    });
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}

/** Mark an order COMPLETED. */
export async function markOrderCompleted(
  orderId: string,
): Promise<OrderReviewState> {
  const admin = await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "سفارش پیدا نشد." };
  if (order.status !== "PROCESSING" && order.status !== "PAYMENT_APPROVED") {
    return { error: "سفارش باید ابتدا در حال انجام باشد." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "COMPLETED" } });
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: "COMPLETED",
        actor: `admin:${admin.id}`,
        note: "سفارش تکمیل شد.",
      },
    });
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}

/** Re-open a rejected order for a fresh receipt attempt. */
export async function reopenOrder(
  orderId: string,
): Promise<OrderReviewState> {
  const admin = await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "سفارش پیدا نشد." };

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "AWAITING_PAYMENT" } });
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: "AWAITING_PAYMENT",
        actor: `admin:${admin.id}`,
        note: "سفارش دوباره باز شد؛ در انتظار پرداخت.",
      },
    });
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}

/** Admin convenience: go to the order detail page (used by list links). */
export async function goToOrder(_prev: unknown, formData: FormData): Promise<void> {
  const orderId = String(formData.get("orderId") ?? "");
  redirect(`/admin/orders/${orderId}`);
}

/** Save an admin note on an order (visible to admins only). */
export async function saveOrderNote(
  orderId: string,
  note: string,
): Promise<OrderReviewState> {
  await requireAdmin();
  const trimmed = note.trim();
  if (trimmed.length > 2000) return { error: "یادداشت بیش از حد طولانی است." };
  try {
    await prisma.order.update({ where: { id: orderId }, data: { adminNote: trimmed || null } });
    revalidatePath(`/admin/orders/${orderId}`);
    return {};
  } catch {
    return { error: "خطا در ذخیره یادداشت." };
  }
}

/** Transfer an order to NEEDS_INFO (customer must provide more info). */
export async function markOrderNeedsInfo(
  orderId: string,
  note: string,
): Promise<OrderReviewState> {
  const admin = await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: "سفارش پیدا نشد." };
  const reason = note.trim();
  if (!reason) return { error: "دلیل نیاز به اطلاعات اصلاحی را بنویسید." };

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "NEEDS_INFO" } });
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: "NEEDS_INFO",
        actor: `admin:${admin.id}`,
        note: `نیازمند اطلاعات تکمیلی: ${reason}`,
      },
    });
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}

/** Cancel an order. Marks it CANCELLED and (for EXACT_QUANTITY items) restores
 *  inventory so customers aren't charged unless the admin re-opens and charges. */
export async function cancelOrder(
  orderId: string,
  note: string,
): Promise<OrderReviewState> {
  const admin = await requireAdmin();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { select: { productId: true, quantity: true } } },
  });
  if (!order) return { error: "سفارش پیدا نشد." };
  if (order.status === "CANCELLED" || order.status === "COMPLETED") {
    return { error: "این سفارش قابل لغو نیست." };
  }
  const reason = note.trim();

  await prisma.$transaction(async (tx) => {
    const productIds = order.items
      .filter((i) => i.productId)
      .map((i) => i.productId!);

    // Restore exact-quantity stock for cancelled items.
    if (productIds.length > 0) {
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, inventoryMode: "EXACT_QUANTITY" },
        select: { id: true, quantity: true },
      });
      const qtyByProduct = order.items.reduce<Record<string, number>>((acc, i) => {
        if (i.productId) acc[i.productId] = (acc[i.productId] ?? 0) + i.quantity;
        return acc;
      }, {});
      for (const p of products) {
        await tx.product.update({
          where: { id: p.id },
          data: { quantity: (p.quantity ?? 0) + (qtyByProduct[p.id] ?? 0) },
        });
      }
    }

    await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: "CANCELLED",
        actor: `admin:${admin.id}`,
        note: reason ? `لغو شد: ${reason}` : "سفارش لغو شد.",
      },
    });
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}

/** Approve a refund for a CANCELLED order (returns order to AWAITING_PAYMENT so
 *  the customer can decide; this effectively reopens the order). */
export async function reopenCancelledOrder(
  orderId: string,
): Promise<OrderReviewState> {
  const admin = await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "CANCELLED") return { error: "فقط سفارش‌های لغو‌شده قابل بازگشایی هستند." };

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "AWAITING_PAYMENT" } });
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: "CANCELLED",
        toStatus: "AWAITING_PAYMENT",
        actor: `admin:${admin.id}`,
        note: "سفارش لغو‌شده بازگشایی شد.",
      },
    });
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}

/** Manually mark a user's phone as verified (the user is looked up by the
 *  order's customer phone number). */
export async function verifyOrderPhone(
  orderId: string,
): Promise<OrderReviewState> {
  await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { customerPhone: true } });
  if (!order) return { error: "سفارش پیدا نشد." };

  try {
    const user = await prisma.user.findUnique({ where: { phone: order.customerPhone } });
    if (!user) return { error: "کاربری با این شماره ثبت نشده است." };
    if (!user.isPhoneVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isPhoneVerified: true, phoneVerifiedAt: new Date() },
      });
    }
    revalidatePath(`/admin/orders/${orderId}`);
    return {};
  } catch {
    return { error: "خطا در تأیید شماره." };
  }
}

/* User management (admin /users) ------------------------------------------ */

export async function toggleUserActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role === "ADMIN") return; // never touch admins from here
  await prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  revalidatePath("/admin/users");
}

export async function verifyUserPhoneAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role === "ADMIN") return;
  await prisma.user.update({
    where: { id },
    data: { isPhoneVerified: true, phoneVerifiedAt: new Date() },
  });
  revalidatePath("/admin/users");
}