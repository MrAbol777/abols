"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { adminLoginSchema } from "@/lib/schemas";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  deleteCurrentSession,
  ADMIN_SESSION_COOKIE,
} from "@/lib/auth/session";
import { createRateLimiter } from "@/lib/rate-limit";

export type AdminLoginState = { error?: string };

/**
 * Brute-force protection keyed by client IP + normalized phone. Uses the
 * shared rate limiter (`src/lib/rate-limit.ts`). Default store is in-memory
 * (per-process); for multi-instance production swap in a Redis store via
 * `setRateLimitStore`.
 */
const loginLimiter = createRateLimiter({
  max: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "local"
    );
  } catch {
    return "local";
  }
}

const GENERIC_ERROR = "شماره موبایل یا رمز عبور صحیح نیست.";

export async function loginAction(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const parsed = adminLoginSchema.safeParse({
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    const firstMessage = parsed.error.issues[0]?.message ?? "اطلاعات واردشده معتبر نیست.";
    return { error: firstMessage };
  }

  const { phone, password } = parsed.data;
  const ip = await getClientIp();
  const rateKey = `${ip}:${phone}`;

  if (loginLimiter.check(rateKey)) {
    return {
      error: "تعداد تلاش‌های ناموفق زیاد است. لطفاً چند دقیقه بعد دوباره تلاش کنید.",
    };
  }

  try {
    const user = await prisma.user.findUnique({ where: { phone } });

    let ok = false;
    if (user && user.isActive && user.role === "ADMIN") {
      ok = await verifyPassword(password, user.passwordHash);
    }

    if (!ok || !user) {
      // Same generic error whether the phone exists, is non-admin, disabled, or
      // the password is wrong — never reveal which.
      loginLimiter.recordFailure(rateKey);
      return { error: GENERIC_ERROR };
    }

    loginLimiter.reset(rateKey);
    await createSession(user.id, ADMIN_SESSION_COOKIE);
  } catch {
    return { error: "خطایی در ورود رخ داد. لطفاً دوباره تلاش کنید." };
  }

  // Redirect AFTER the try/catch so the NEXT_REDIRECT signal isn't swallowed.
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await deleteCurrentSession(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
