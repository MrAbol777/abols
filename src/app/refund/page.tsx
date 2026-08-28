import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "بازگشت وجه",
  description: "شرایط بازگشت وجه و لغو سفارش در ابول استور.",
};

export default function RefundPage() {
  return (
    <ContentPage
      badge="بازگشت وجه"
      title="بازگشت وجه"
      intro="شرایط لغو سفارش و بازگشت وجه به‌صورت شفاف در این صفحه توضیح داده شده است."
    >
      <ContentSection title="اصل کلی">
        <p>
          سیاست بازگشت وجه به نوع محصول بستگی دارد. برای هر محصول، شرایط در صفحه همان
          محصول («قوانین لغو») درج شده است؛ لطفاً پیش از خرید آن را مطالعه کنید.
        </p>
      </ContentSection>

      <ContentSection title="محصولات سی‌پی (CP)">
        <p>
          اگر سفارش هنوز تحویل نشده است، امکان لغو و بازگشت وجه وجود دارد. پس از تحویل،
          به دلیل ماهیت دیجیتال محصول امکان بازگشت وجه نیست.
        </p>
      </ContentSection>

      <ContentSection title="اکانت‌ها و کمبوها">
        <p>
          پس از تحویل اکانت، امکان لغو و استرداد وجه وجود ندارد؛ مگر اینکه اطلاعات تحویلی
          با توضیحات درج‌شده مغایرت داشته باشد. در این صورت مشکل را با پشتیبانی مطرح کنید.
        </p>
      </ContentSection>

      <ContentSection title="فرایند درخواست">
        <p>
          برای درخواست بازگشت وجه، از طریق صفحه پیگیری سفارش یا فرم پشتیبانی پیام دهید.
          پس از بررسی، وجه طبق روش پرداخت (کارت‌به‌کارت) بازگردانده می‌شود.
        </p>
      </ContentSection>
    </ContentPage>
  );
}