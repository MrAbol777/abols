"use server";

import { prisma } from "@/lib/prisma";
import { iranianMobileSchema } from "@/lib/schemas";
import { saveReceipt } from "@/lib/receipts";

export type ReceiptUploadState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

const UPLOADABLE_STATUSES = ["AWAITING_PAYMENT", "RECEIPT_REJECTED"];

/**
 * Customer submits a card-to-card receipt image for an order. Only the order's
 * phone number can upload (authenticated by the public tracking code + phone).
 * Transitions the order to AWAITING_REVIEW and records the status change.
 */
export async function submitReceipt(
  _prev: ReceiptUploadState,
  formData: FormData,
): Promise<ReceiptUploadState> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const phone = String(formData.get("phone") ?? "");

  const fieldErrors: Record<string, string> = {};

  const parsedPhone = iranianMobileSchema.safeParse(phone);
  if (!parsedPhone.success) {
    fieldErrors.phone = "شماره موبایل معتبر نیست.";
  }

  if (!code) {
    fieldErrors.code = "کد رهگیری الزامی است.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "لطفاً خطاهای فرم را برطرف کنید.", fieldErrors };
  }

  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "تصویر رسید را انتخاب کنید." };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { trackingCode: code },
      select: { id: true, status: true, customerPhone: true },
    });

    if (!order) {
      return {
        status: "error",
        message: "سفارشی با این کد رهگیری پیدا نشد. کد را بررسی کنید.",
      };
    }

    if (order.customerPhone !== parsedPhone.data) {
      return {
        status: "error",
        message: "شماره موبایل با سفارش مطابقت ندارد.",
      };
    }

    if (!UPLOADABLE_STATUSES.includes(order.status)) {
      return {
        status: "error",
        message: "در وضعیت فعلی سفارش، امکان ارسال رسید وجود ندارد.",
      };
    }

    const saved = await saveReceipt(file);
    if (!saved.ok) {
      return { status: "error", message: saved.error };
    }

    // Receipt + status transition in one transaction.
    await prisma.$transaction(async (tx) => {
      await tx.paymentReceipt.create({
        data: { orderId: order.id, imagePath: saved.url, status: "PENDING" },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: "AWAITING_REVIEW" },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: "AWAITING_REVIEW",
          actor: "customer",
          note: "رسید پرداخت ارسال شد؛ در انتظار بررسی مدیر.",
        },
      });
    });

    return {
      status: "success",
      message: "رسید شما ثبت شد و سفارش در انتظار بررسی مدیر است.",
    };
  } catch {
    return {
      status: "error",
      message: "خطایی در ثبت رسید رخ داد. لطفاً دوباره تلاش کنید.",
    };
  }
}
