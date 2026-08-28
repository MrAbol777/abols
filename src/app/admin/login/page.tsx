import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getCurrentAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "ورود به پنل مدیریت",
  description: "ورود مدیر فروشگاه ابول استور.",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // If already authenticated as admin, skip the form.
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Logo brandName="Abol Store" />
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">ورود به پنل مدیریت</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              برای مدیریت فروشگاه Abol Store وارد حساب مدیر شوید.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl">
          <AdminLoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          این صفحه مخصوص مدیران فروشگاه است.
        </p>
      </div>
    </div>
  );
}
