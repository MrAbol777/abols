import type { Metadata } from "next";
import { Container, ButtonLink, Badge } from "@/components/ui";
import { ContentSection } from "@/components/ContentPage";
import { getSiteSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "درباره ما",
  description: "درباره ابول استور — فروشگاه تخصصی محصولات کالاف دیوتی موبایل.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <Container className="py-12 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-3">
          <Badge tone="gold" className="self-start">درباره ابول استور</Badge>
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">درباره ما</h1>
          <p className="text-sm leading-7 text-muted sm:text-base">
            ابول استور با هدف ارائه‌ی تجربه‌ای ساده، شفاف و مطمئن برای خرید محصولات کالاف
            دیوتی موبایل راه‌اندازی شده است.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <ContentSection title="ما که هستیم؟">
            <p>
              ما یک تیم کوچک و تخصصی هستیم که سال‌هاست روی فروش محصولات دیجیتال بازی‌های
              موبایل کار می‌کنیم. تمرکز ما روی کالاف دیوتی موبایل است: سی‌پی (CP)، اکانت‌های
              منتخب و بسته‌های ترکیبی با قیمت منصفانه.
            </p>
          </ContentSection>

          <ContentSection title="چرا ابول استور؟">
            <ul className="flex flex-col gap-2">
              <li>• فرایند خرید ساده و شفاف، گام‌به‌گام</li>
              <li>• پرداخت کارت‌به‌کارت با روشی آشنا</li>
              <li>• پیگیری سفارش با کد رهگیری از لحظه ثبت تا تحویل</li>
              <li>• بررسی هر پرداخت توسط مدیر پیش از تحویل</li>
              <li>• پشتیبانی واقعی و در دسترس برای سوالات و مشکلات</li>
              <li>• قوانین مشخص برای لغو و بازگشت وجه</li>
            </ul>
          </ContentSection>

          <ContentSection title="تعهد ما">
            <p>
              ما به هر سفارش به چشم یک تجربه نگاه می‌کنیم و تلاش می‌کنیم آن را بدون دردسر
              کامل کنیم. اگر سوالی دارید یا سفارشی نیاز به پیگیری دارد، از راه‌های زیر با ما
              در ارتباط باشید.
            </p>
          </ContentSection>

          <div className="flex flex-wrap gap-3">
            {settings.telegramUrl ? (
              <a
                href={settings.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gold/50 px-6 text-sm font-semibold text-gold transition-colors hover:bg-gold/10 focus-visible:outline-gold"
              >
                تلگرام
              </a>
            ) : null}
            {settings.rubikaUrl ? (
              <a
                href={settings.rubikaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gold/50 px-6 text-sm font-semibold text-gold transition-colors hover:bg-gold/10 focus-visible:outline-gold"
              >
                روبیکا
              </a>
            ) : null}
            <ButtonLink href="/contact" variant="primary">
              تماس با ما
            </ButtonLink>
          </div>
        </div>
      </article>
    </Container>
  );
}