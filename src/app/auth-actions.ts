"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { customerRegisterSchema, customerLoginSchema } from "@/lib/schemas";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  deleteCurrentSession,
  CUSTOMER_SESSION_COOKIE,
} from "@/lib/auth/session";

export type CustomerAuthState = { error?: string };

const GENERIC_ERROR = "شماره موبایل یا رمز عبور صحیح نیست.";

/**
 * Register a new customer account. Phone numbers are unique; the password is
 * hashed (bcrypt) and never stored in plain text. Customers with an existing
 * ADMIN account are not allowed to re-register as customers.
 */
export async function registerAction(
  _prev: CustomerAuthState,
  formData: FormData,
): Promise<CustomerAuthState> {
  const parsed = customerRegisterSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات معتبر نیست." };
  }

  const { name, phone, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing?.role === "ADMIN") {
      return { error: "این شماره برای مدیر فروشگاه است؛ از پنل مدیریت وارد شوید." };
    }
    if (existing) {
      return { error: "این شماره موبایل قبلاً ثبت شده است. وارد شوید." };
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        name,
        role: "CUSTOMER",
        isActive: true,
      },
    });

    await createSession(user.id, CUSTOMER_SESSION_COOKIE);
  } catch {
    return { error: "خطایی در ثبت‌نام رخ داد. لطفاً دوباره تلاش کنید." };
  }

  redirect("/dashboard");
}

/**
 * Login with mobile + password. Generic error on wrong phone/password so we
 * never reveal whether a given phone number exists in the system.
 */
export async function loginAction(
  _prev: CustomerAuthState,
  formData: FormData,
): Promise<CustomerAuthState> {
  const parsed = customerLoginSchema.safeParse({
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات معتبر نیست." };
  }

  const { phone, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { phone } });

    let ok = false;
    if (user && user.isActive) {
      // Customers log in through this action; admins use /admin/login.
      const isCustomer = user.role !== "ADMIN";
      if (isCustomer) {
        ok = await verifyPassword(password, user.passwordHash);
      }
    }

    if (!ok || !user) {
      // Same generic error for any failure case.
      return { error: GENERIC_ERROR };
    }

    await createSession(user.id, CUSTOMER_SESSION_COOKIE);
  } catch {
    return { error: "خطایی در ورود رخ داد. لطفاً دوباره تلاش کنید." };
  }

  redirect("/dashboard");
}

export async function customerLogoutAction(): Promise<void> {
  await deleteCurrentSession(CUSTOMER_SESSION_COOKIE);
  redirect("/");
}