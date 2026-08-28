"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth/customer";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export type ProfileState = {
  status?: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Update the customer's display name and/or password. Changing the password
 * requires the current password to be correct (verified against the hash).
 */
export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const customer = await requireCustomer();

  const name = String(formData.get("name") ?? "").trim();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  const fieldErrors: Record<string, string> = {};

  if (name && (name.length < 2 || name.length > 100)) {
    fieldErrors.name = "نام باید بین ۲ تا ۱۰۰ حرف باشد.";
  }

  const wantsPasswordChange = currentPassword.length > 0 || newPassword.length > 0;

  if (wantsPasswordChange) {
    if (!currentPassword) {
      fieldErrors.currentPassword = "برای تغییر رمز، رمز فعلی را وارد کنید.";
    }
    if (newPassword && newPassword.length < 8) {
      fieldErrors.newPassword = "رمز جدید باید حداقل ۸ حرف باشد.";
    }
    if (newPassword.length > 200) {
      fieldErrors.newPassword = "رمز جدید بیش از حد طولانی است.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "لطفاً خطاها را برطرف کنید.", fieldErrors };
  }

  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: customer.id } });

    if (wantsPasswordChange) {
      const ok = await verifyPassword(currentPassword, user.passwordHash);
      if (!ok) {
        return {
          status: "error",
          message: "رمز عبور فعلی صحیح نیست.",
          fieldErrors: { currentPassword: "رمز فعلی اشتباه است." },
        };
      }
    }

    await prisma.user.update({
      where: { id: customer.id },
      data: {
        ...(name ? { name } : {}),
        ...(newPassword ? { passwordHash: await hashPassword(newPassword) } : {}),
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    return { status: "success", message: "اطلاعات حساب با موفقیت به‌روزرسانی شد." };
  } catch {
    return {
      status: "error",
      message: "خطایی در ذخیره‌سازی رخ داد. لطفاً دوباره تلاش کنید.",
    };
  }
}
