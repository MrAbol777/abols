import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/vazirmatn";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { CartProvider } from "@/lib/cart";
import { getSiteSettings } from "@/lib/site";
import { isCustomerSignedIn } from "@/lib/auth/customer";

export const metadata: Metadata = {
  metadataBase: new URL("https://abol.store"),
  title: {
    default: "ابول استور | خرید CP، اکانت و کمبو کالاف دیوتی موبایل",
    template: "%s | ابول استور",
  },
  description:
    "خرید مطمئن سی‌پی (CP)، اکانت و بسته‌های کمبو کالاف دیوتی موبایل با فرایند ساده، پرداخت کارت‌به‌کارت، پیگیری سفارش و پشتیبانی در دسترس.",
  keywords: [
    "ابول استور",
    "خرید CP",
    "سی پی کالاف دیوتی",
    "خرید اکانت کالاف دیوتی",
    "کمبو کالاف",
    "call of duty mobile",
  ],
  applicationName: "Abol Store",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "Abol Store",
    title: "ابول استور | خرید CP، اکانت و کمبو کالاف دیوتی موبایل",
    description:
      "خرید مطمئن CP، اکانت و کمبو کالاف دیوتی موبایل با فرایند ساده و پشتیبانی در دسترس.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const settings = await getSiteSettings();
  const customerSignedIn = await isCustomerSignedIn();

  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <SiteChrome
            brandName={settings.brandName}
            telegramUrl={settings.telegramUrl}
            rubikaUrl={settings.rubikaUrl}
            supportText={settings.supportText}
            customerSignedIn={customerSignedIn}
          >
            {children}
          </SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
