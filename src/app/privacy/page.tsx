import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: "سیاست حریم خصوصی ابول استور.",
};

export default function PrivacyPage() {
  return (
    <ContentPage
      badge="حریم خصوصی"
      title="حریم خصوصی"
      intro="ما به اطلاعات شما احترام می‌گذاریم و آن را شفاف توضیح می‌دهیم."
    >
      <ContentSection title="چه اطلاعاتی جمع‌آوری می‌شود؟">
        <p>
          برای ثبت سفارش، نام، شماره موبایل و (اختیاری) شناسه تماس شما جمع‌آوری می‌شود.
          هنگام ثبت حساب کاربری، رمز عبور شما به‌صورت هش‌شده (bcrypt) ذخیره می‌شود و هرگز
          به‌صورت متن ساده نگهداری نمی‌شود.
        </p>
      </ContentSection>

      <ContentSection title="بازیابی نمی‌شود">
        <ul className="flex flex-col gap-2">
          <li>• اطلاعات ورود به حساب‌های بازی (ایمیل/رمز) هرگز از شما خواسته یا ذخیره نمی‌شود.</li>
          <li>• شماره کارت بانکی شما ذخیره نمی‌شود؛ پرداخت مستقیم کارت‌به‌کارت انجام می‌شود.</li>
        </ul>
      </ContentSection>

      <ContentSection title="استفاده از اطلاعات">
        <p>
          اطلاعات شما فقط برای پردازش سفارش، پیگیری و پشتیبانی استفاده می‌شود و با هیچ شخص
          ثالثی به اشتراک گذاشته نمی‌شود مگر در موارد قانونی الزامی.
        </p>
      </ContentSection>

      <ContentSection title="کوکی‌ها و نشست‌ها">
        <p>
          برای ورود و حفظ نشست، یک کوکی HTTP-only امن استفاده می‌شود که سمت جاوااسکریپت
          قابل خواندن نیست. سبد خرید به‌صورت محلی در مرورگر شما نگهداری می‌شود.
        </p>
      </ContentSection>

      <ContentSection title="تماس">
        <p>
          برای هرگونه سوال درباره حریم خصوصی، از صفحه تماس با ما پیام دهید.
        </p>
      </ContentSection>
    </ContentPage>
  );
}