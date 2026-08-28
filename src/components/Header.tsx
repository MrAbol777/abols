"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";

const navItems = [
  { label: "خانه", href: "/" },
  { label: "فروشگاه", href: "/shop" },
  { label: "خرید CP", href: "/shop?category=cp" },
  { label: "خرید اکانت", href: "/shop?category=account" },
  { label: "کمبوها", href: "/shop?category=combo" },
  { label: "آموزش خرید", href: "/tutorial" },
  { label: "پیگیری سفارش", href: "/tracking" },
  { label: "وبلاگ", href: "/blog" },
];

function CartButton() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`سبد خرید (${count} کالا)`}
      className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-elevated text-foreground transition-colors hover:border-gold/40 hover:bg-gold/10 hover:text-gold focus-visible:outline-gold"
    >
      <CartIcon />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-black tnum">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function CartIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function NavIcon({ href }: { href: string }) {
  const path =
    href === "/"
      ? "M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10"
      : href.startsWith("/shop")
        ? "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        : href === "/tutorial"
          ? "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          : href === "/tracking"
            ? "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            : href === "/blog"
              ? "M4 6h16M4 12h16M4 18h9"
              : "M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l.8-4A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
}

/**
 * Main site header. The mobile drawer is rendered OUTSIDE the sticky header
 * (a sibling fragment) because the header's backdrop-blur creates a containing
 * block that would otherwise clip a fixed-position overlay to the header's box.
 */
export function Header({
  brandName,
  customerSignedIn = false,
}: {
  brandName: string;
  customerSignedIn?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useCart();

  // Close on Escape and lock body scroll while the drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0" aria-label={brandName}>
            <Logo brandName={brandName} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="اصلی">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-elevated hover:text-gold focus-visible:outline-gold"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <CartButton />
            {customerSignedIn ? (
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gold transition-colors hover:text-gold-hover"
              >
                حساب کاربری
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                ورود / ثبت‌نام
              </Link>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <CartButton />
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-elevated text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="منو"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav — fixed to the viewport with header and close button */}
      {mobileOpen ? (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-[70] flex flex-col bg-background/98 backdrop-blur-2xl lg:hidden"
          onClick={() => setMobileOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="منوی موبایل"
        >
          <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-10 pt-3" onClick={(e) => e.stopPropagation()}>
            {/* Top Bar with Logo and prominent Close button */}
            <div className="flex items-center justify-between border-b border-border/80 pb-3 pt-1">
              <Link href="/" onClick={() => setMobileOpen(false)} aria-label={brandName}>
                <Logo brandName={brandName} />
              </Link>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-elevated text-foreground shadow-sm transition-colors hover:border-gold hover:bg-gold/10 hover:text-gold focus-visible:outline-gold"
                onClick={() => setMobileOpen(false)}
                aria-label="بستن منو"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Primary nav */}
            <p className="px-2 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-widest text-muted">
              منوی اصلی
            </p>
            <nav className="flex flex-col gap-1.5" aria-label="موبایل">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 text-base font-medium text-foreground transition-colors hover:border-gold/40 hover:bg-gold/5 hover:text-gold focus-visible:outline-gold"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-gold">
                    <NavIcon href={item.href} />
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <p className="px-2 pb-2 pt-6 text-[11px] font-semibold uppercase tracking-widest text-muted">
              حساب و سفارش
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/cart"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 text-base font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-gold">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                سبد خرید
                {count > 0 ? (
                  <span className="ms-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-gold px-1.5 text-xs font-bold text-black tnum">
                    {count}
                  </span>
                ) : null}
              </Link>
              <Link
                href={customerSignedIn ? "/dashboard" : "/login"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 text-base font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-gold">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                {customerSignedIn ? "حساب کاربری" : "ورود / ثبت‌نام"}
              </Link>
            </div>

            {/* Bottom close button */}
            <div className="mt-8 pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-elevated py-3 text-sm font-semibold text-muted transition-colors hover:border-gold/40 hover:text-foreground"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                بستن منو
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}