"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { supportMessageSchema } from "@/lib/schemas";
import { createRateLimiter } from "@/lib/rate-limit";

export type SupportFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<"name" | "phone" | "message", string>>;
};

// Per-IP rate limiting via the shared limiter (in-memory by default; swap in a
// Redis store for multi-instance production via setRateLimitStore).
const supportLimiter = createRateLimiter({
  max: 5,
  windowMs: 10 * 60 * 1000, // 10 minutes
});

function isRateLimited(key: string): boolean {
  // Count this request, then check whether the window is exhausted.
  supportLimiter.recordFailure(key);
  return supportLimiter.check(key);
}

export async function submitSupportMessage(
  _prevState: SupportFormState,
  formData: FormData,
): Promise<SupportFormState> {
  // Honeypot: real users never fill this hidden field.
  const honeypot = String(formData.get("company") ?? "");
  if (honeypot.trim().length > 0) {
    // Silently accept to avoid tipping off bots.
    return { status: "success", message: "پیام شما با موفقیت ثبت شد." };
  }

  // Basic abuse protection by client IP.
  try {
    const headerList = await headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "local";
    if (isRateLimited(ip)) {
      return {
        status: "error",
        message: "تعداد درخواست‌های شما زیاد است. لطفاً کمی بعد دوباره تلاش کنید.",
      };
    }
  } catch {
    // headers() unavailable — continue without IP limiting.
  }

  const parsed = supportMessageSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    message: String(formData.get("message") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: SupportFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "name" || field === "phone" || field === "message") {
        fieldErrors[field] = fieldErrors[field] ?? issue.message;
      }
    }
    return {
      status: "error",
      message: "لطفاً خطاهای فرم را برطرف کنید.",
      fieldErrors,
    };
  }

  try {
    await prisma.supportMessage.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        message: parsed.data.message,
        status: "NEW",
      },
    });
    return {
      status: "success",
      message: "پیام شما با موفقیت ثبت شد. به‌زودی با شما تماس می‌گیریم.",
    };
  } catch {
    return {
      status: "error",
      message: "خطایی در ثبت پیام رخ داد. لطفاً دوباره تلاش کنید.",
    };
  }
}
