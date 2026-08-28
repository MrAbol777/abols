"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { customerLogoutAction } from "@/app/auth-actions";

const items = [
  { label: "نمای کلی", href: "/dashboard" },
  { label: "سفارش‌ها", href: "/dashboard/orders" },
  { label: "پروفایل", href: "/dashboard/profile" },
];

function Logout() {
  return (
    <form action={customerLogoutAction}>
      <button
        type="submit"
        className="w-full rounded-xl border border-border bg-elevated px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-danger/50 hover:text-danger focus-visible:outline-gold"
      >
        خروج از حساب
      </button>
    </form>
  );
}

export function DashboardShell({
  customerName,
  children,
}: {
  customerName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            حساب کاربری
          </h1>
          <p className="mt-1 text-sm text-muted">سلام، {customerName}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="flex flex-col gap-2 lg:col-span-1">
          <nav className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-2" aria-label="حساب کاربری">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-gold ${
                    active
                      ? "bg-gold/15 text-gold"
                      : "text-foreground hover:bg-elevated hover:text-gold"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 border-t border-border pt-2">
              <Logout />
            </div>
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}