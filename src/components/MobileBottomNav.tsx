"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

export function MobileBottomNav({
  customerSignedIn = false,
}: {
  customerSignedIn?: boolean;
}) {
  const pathname = usePathname();
  const { count } = useCart();

  const isHomeActive = pathname === "/";
  const isShopActive = pathname.startsWith("/shop");
  const isCartActive = pathname === "/cart";
  const isTrackingActive = pathname.startsWith("/tracking");
  const isAccountActive =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/account");

  return (
    <nav
      aria-label="ناوبری سریع موبایل"
      className="fixed bottom-0 inset-x-0 z-40 block lg:hidden border-t border-border/80 bg-background/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.7)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {/* ۱. خانه */}
        <Link
          href="/"
          aria-label="خانه"
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all ${
            isHomeActive
              ? "text-gold font-bold scale-105"
              : "text-muted hover:text-foreground"
          }`}
        >
          <div className={`flex h-6 w-6 items-center justify-center transition-transform ${isHomeActive ? "-translate-y-0.5" : ""}`}>
            <svg
              className="h-5 w-5"
              fill={isHomeActive ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={isHomeActive ? 2.2 : 1.8}
                d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10"
              />
            </svg>
          </div>
          <span className="text-[10px] font-medium tracking-tight">خانه</span>
          {isHomeActive ? (
            <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
          ) : null}
        </Link>

        {/* ۲. فروشگاه */}
        <Link
          href="/shop"
          aria-label="فروشگاه"
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all ${
            isShopActive
              ? "text-gold font-bold scale-105"
              : "text-muted hover:text-foreground"
          }`}
        >
          <div className={`flex h-6 w-6 items-center justify-center transition-transform ${isShopActive ? "-translate-y-0.5" : ""}`}>
            <svg
              className="h-5 w-5"
              fill={isShopActive ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={isShopActive ? 2.2 : 1.8}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <span className="text-[10px] font-medium tracking-tight">فروشگاه</span>
          {isShopActive ? (
            <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
          ) : null}
        </Link>

        {/* ۳. سبد خرید (مرکزی با نشانگر تعداد) */}
        <Link
          href="/cart"
          aria-label={`سبد خرید (${count} کالا)`}
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all ${
            isCartActive
              ? "text-gold font-bold scale-105"
              : "text-muted hover:text-foreground"
          }`}
        >
          <div className="relative flex h-6 w-6 items-center justify-center">
            <svg
              className="h-5 w-5"
              fill={isCartActive ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={isCartActive ? 2.2 : 1.8}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {count > 0 ? (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-extrabold text-black shadow-sm tnum animate-pulse">
                {count}
              </span>
            ) : null}
          </div>
          <span className="text-[10px] font-medium tracking-tight">سبد خرید</span>
          {isCartActive ? (
            <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
          ) : null}
        </Link>

        {/* ۴. پیگیری سفارش */}
        <Link
          href="/tracking"
          aria-label="پیگیری سفارش"
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all ${
            isTrackingActive
              ? "text-gold font-bold scale-105"
              : "text-muted hover:text-foreground"
          }`}
        >
          <div className={`flex h-6 w-6 items-center justify-center transition-transform ${isTrackingActive ? "-translate-y-0.5" : ""}`}>
            <svg
              className="h-5 w-5"
              fill={isTrackingActive ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={isTrackingActive ? 2.2 : 1.8}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <span className="text-[10px] font-medium tracking-tight">پیگیری</span>
          {isTrackingActive ? (
            <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
          ) : null}
        </Link>

        {/* ۵. حساب کاربری */}
        <Link
          href={customerSignedIn ? "/dashboard" : "/login"}
          aria-label={customerSignedIn ? "حساب کاربری" : "ورود"}
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all ${
            isAccountActive
              ? "text-gold font-bold scale-105"
              : "text-muted hover:text-foreground"
          }`}
        >
          <div className={`flex h-6 w-6 items-center justify-center transition-transform ${isAccountActive ? "-translate-y-0.5" : ""}`}>
            <svg
              className="h-5 w-5"
              fill={isAccountActive ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={isAccountActive ? 2.2 : 1.8}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <span className="text-[10px] font-medium tracking-tight">
            {customerSignedIn ? "حساب من" : "ورود"}
          </span>
          {isAccountActive ? (
            <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
          ) : null}
        </Link>
      </div>
    </nav>
  );
}
