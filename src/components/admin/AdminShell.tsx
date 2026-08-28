"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/auth-actions";

type NavItem = { label: string; href: string; soon?: boolean };

const navItems: NavItem[] = [
  { label: "داشبورد", href: "/admin" },
  { label: "سفارش‌ها", href: "/admin/orders" },
  { label: "محصولات", href: "/admin/products" },
  { label: "دسته‌بندی‌ها", href: "/admin/categories" },
  { label: "کاربران", href: "/admin/users" },
  { label: "نظرات", href: "/admin/reviews" },
  { label: "تخفیف‌ها", href: "/admin/discounts" },
  { label: "پیام‌های پشتیبانی", href: "/admin/support" },
  { label: "وبلاگ", href: "/admin/blog" },
  { label: "تنظیمات", href: "/admin/settings" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="مدیریت">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-gold ${
              active
                ? "bg-gold/15 text-gold"
                : "text-foreground hover:bg-elevated hover:text-gold"
            }`}
          >
            <span>{item.label}</span>
            {item.soon ? (
              <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] text-muted">
                به‌زودی
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton({ full = false }: { full?: boolean }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-elevated px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-danger/50 hover:text-danger focus-visible:outline-gold ${full ? "w-full" : ""}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        خروج
      </button>
    </form>
  );
}

export function AdminShell({
  adminName,
  children,
}: {
  adminName: string;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 right-0 hidden w-64 flex-col border-l border-border bg-surface lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <span className="brand-wordmark text-lg font-extrabold">Abol StoRe</span>
          <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">مدیریت</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavLinks />
        </div>
        <div className="border-t border-border p-3">
          <LogoutButton full />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="باز کردن منو"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-elevated focus-visible:outline-gold"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="brand-wordmark text-base font-extrabold">Abol StoRe</span>
        <div className="w-10" aria-hidden />
      </header>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="منوی مدیریت"
            className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col border-l border-border bg-surface"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <span className="brand-wordmark text-base font-extrabold">مدیریت</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="بستن منو"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-elevated hover:text-foreground focus-visible:outline-gold"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <NavLinks onNavigate={() => setDrawerOpen(false)} />
            </div>
            <div className="border-t border-border p-3">
              <LogoutButton full />
            </div>
          </div>
        </div>
      ) : null}

      {/* Main content */}
      <div className="lg:mr-64">
        <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
          <div className="mb-6 hidden items-center justify-between lg:flex">
            <p className="text-sm text-muted">
              خوش آمدید، <span className="font-semibold text-foreground">{adminName}</span>
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
