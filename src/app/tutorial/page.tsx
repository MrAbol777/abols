import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, ContentSection } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "آموزش خرید",
  description: "راهنمای گام‌به‌گام خرید از ابول استور.",
};

const steps = [
  { n: 1, title: "انتخاب محصول", desc: "از صفحه فروشگاه، محصول موردنظر را با توجه به دسته‌بندی و توضیحات انتخاب کنید." },
  { n: 2, title: "افزودن به سبد", desc: "در صفحه محصول، تعداد را مشخص کرده و روی «افزودن به سبد خرید» بزنید." },
  { n: 3, title: "ثبت سفارش", desc: "از سبد خرید به صفحه ثبت سفارش بروید و اطلاعات تماس و فیلدهای تکمیلی را وارد کنید." },
  { n: 4, title: "پرداخت کارت‌به‌کارت", desc: "طبق اطلاعات درج‌شده پرداخت کنید و تصویر رسید را از صفحه پیگیری ارسال کنید." },
  { n: 5, title: "بررسی توسط مدیر", desc: "پس از ارسال رسید، مدیر پرداخت را بررسی و تأیید می‌کند." },
  { n: 6, title: "تحویل", desc: "محصول طبق زمان درج‌شده تحویل داده می‌شود. می‌توانید وضعیت را با کد رهگیری دنبال کنید." },
];

export default function TutorialPage() {
  return (
    <ContentPage
      badge="آموزش"
      title="آموزش خرید"
      intro="خرید از ابول استور در شش گام ساده؛ بدون نیاز به دانش فنی."
    >
      <ContentSection title="مراحل خرید">
        <ol className="flex flex-col gap-4">
          {steps.map((s) => (
            <li key={s.n} className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-sm font-black text-gold tnum">
                {new Intl.NumberFormat("fa-IR").format(s.n)}
              </span>
              <p className="mt-1 text-base font-bold text-foreground">{s.title}</p>
              <p className="text-sm leading-7 text-muted">{s.desc}</p>
            </li>
          ))}
        </ol>
      </ContentSection>

      <ContentSection title="نکته‌های مهم">
        <ul className="flex flex-col gap-2">
          <li>• شماره موبایل را دقیق وارد کنید؛ تحویل بر اساس آن انجام می‌شود.</li>
          <li>• فیلدهای تکمیلی الزامی هر محصول را کامل کنید.</li>
          <li>• برای محصولات دارای موجودی محدود، پس از ثبت سفارش موجودی رزرو می‌شود.</li>
          <li>• کد رهگیری را نزد خود نگه دارید؛ برای پیگیری سفارش لازم است.</li>
        </ul>
      </ContentSection>

      <p className="text-sm text-muted">
        برای شروع، به{" "}
        <Link href="/shop" className="text-gold hover:underline focus-visible:outline-gold">
          فروشگاه
        </Link>{" "}
        بروید.
      </p>
    </ContentPage>
  );
}