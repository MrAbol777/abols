import type { Metadata } from "next";
import { Container, SectionHeading, EmptyState } from "@/components/ui";
import { FaqAccordion } from "@/components/FaqAccordion";
import { getActiveFaqs } from "@/lib/site";

export const metadata: Metadata = {
  title: "سوالات متداول",
  description: "پاسخ سوالات پرتکرار درباره خرید از ابول استور.",
};

export default async function FaqPage() {
  const faqs = await getActiveFaqs(20);
  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="راهنما"
        title="سوالات متداول"
        description="اگر پاسخ سوال خود را نیافتید، از دکمه‌ی پشتیبانی استفاده کنید."
      />
      <div className="mt-10">
        {faqs.length === 0 ? (
          <EmptyState title="هنوز سوالی ثبت نشده است" />
        ) : (
          <FaqAccordion faqs={faqs} />
        )}
      </div>
    </Container>
  );
}
