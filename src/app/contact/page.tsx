import type { Metadata } from "next";
import Link from "next/link";
import { Container, Badge } from "@/components/ui";
import { getSiteSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباط با ابول استور — تلگرام، روبیکا و فرم پشتیبانی.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const channels = [
    settings.telegramUrl ? { label: "تلگرام", value: settings.telegramUrl, href: settings.telegramUrl } : null,
    settings.rubikaUrl ? { label: "روبیکا", value: settings.rubikaUrl, href: settings.rubikaUrl } : null,
  ].filter(Boolean) as Array<{ label: string; value: string; href: string }>;

  return (
    <Container className="py-12 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-3">
          <Badge tone="gold" className="self-start">تماس با ما</Badge>
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">در ارتباط باشید</h1>
          <p className="text-sm leading-7 text-muted sm:text-base">
            {settings.supportText ?? "برای ثبت سفارش، سوال یا پیگیری، از راه‌های زیر با ما در تماس باشید."}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {channels.map((ch) => (
            <a
              key={ch.label}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-gold/40 focus-visible:outline-gold"
            >
              <span className="text-sm font-bold text-foreground">{ch.label}</span>
              <span dir="ltr" className="text-start text-xs text-muted">{ch.value}</span>
            </a>
          ))}

          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 sm:col-span-2">
            <span className="text-sm font-bold text-foreground">فرم پشتیبانی</span>
            <p className="text-xs leading-6 text-muted">
              از طریق دکمه‌ی «پشتیبانی» در گوشه‌ی پایین صفحه، می‌توانید پیام خود را ثبت کنید؛
              پیام شما مستقیماً برای تیم پشتیبانی ارسال می‌شود.
            </p>
            <Link href="/faq" className="text-xs text-gold hover:underline focus-visible:outline-gold">
              سوالات متداول را ببینید
            </Link>
          </div>
        </div>
      </article>
    </Container>
  );
}