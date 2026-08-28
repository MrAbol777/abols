"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SupportWidget } from "./SupportWidget";

/**
 * Wraps public pages with the storefront header, footer and floating support
 * widget. On admin routes (/admin*) this chrome is hidden — the admin section
 * has its own layout — so the customer support button never appears there.
 */
export function SiteChrome({
  brandName,
  telegramUrl,
  rubikaUrl,
  supportText,
  customerSignedIn,
  children,
}: {
  brandName: string;
  telegramUrl: string | null;
  rubikaUrl: string | null;
  supportText: string | null;
  customerSignedIn: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header brandName={brandName} customerSignedIn={customerSignedIn} />
      <main className="flex-1">{children}</main>
      <Footer brandName={brandName} telegramUrl={telegramUrl} rubikaUrl={rubikaUrl} />
      <SupportWidget
        supportText={supportText}
        telegramUrl={telegramUrl}
        rubikaUrl={rubikaUrl}
      />
    </>
  );
}
