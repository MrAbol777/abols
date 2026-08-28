import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LoginForm, RegisterForm } from "@/components/auth/CustomerAuthForms";
import { getCurrentCustomer } from "@/lib/auth/customer";

export const metadata: Metadata = {
  title: "ورود | ثبت‌نام",
  description: "ورود یا ثبت‌نام در ابول استور.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const customer = await getCurrentCustomer();
  if (customer) redirect("/dashboard");

  const { mode } = await searchParams;
  const register = mode === "register";

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Logo brandName="Abol Store" />
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">
              {register ? "ساخت حساب کاربری" : "ورود به حساب"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              {register
                ? "با ثبت‌نام، سفارش‌های خود را دنبال کنید و نظر بدهید."
                : "برای دیدن سفارش‌ها و پروفایل خود وارد شوید."}
            </p>
          </div>
        </div>

        <div className="mb-4 flex rounded-xl border border-border bg-surface p-1">
          <Link
            href="/login"
            aria-current={!register ? "page" : undefined}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors ${
              !register ? "bg-gold/15 text-gold" : "text-muted hover:text-foreground"
            }`}
          >
            ورود
          </Link>
          <Link
            href="/login?mode=register"
            aria-current={register ? "page" : undefined}
            className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold transition-colors ${
              register ? "bg-gold/15 text-gold" : "text-muted hover:text-foreground"
            }`}
          >
            ثبت‌نام
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl">
          {register ? <RegisterForm /> : <LoginForm />}
        </div>
      </div>
    </div>
  );
}