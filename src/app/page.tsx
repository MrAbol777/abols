import { Container, SectionHeading, ButtonLink, Badge, EmptyState } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";
import { FaqAccordion } from "@/components/FaqAccordion";
import {
  CategorySection,
  TrustStrip,
  WhySection,
  StepsSection,
  AboutPreview,
} from "@/components/home-sections";
import {
  getSiteSettings,
  getFeaturedProducts,
  getBestSellingProducts,
  getActiveCategories,
  getApprovedTestimonials,
  getActiveFaqs,
} from "@/lib/site";
import { formatNumber } from "@/lib/format";

/* Hero ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(50rem 30rem at 80% -10%, rgba(212,175,55,0.14), transparent 60%)",
        }}
        aria-hidden
      />
      <Container className="relative py-16 sm:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <Badge tone="gold">CP · اکانت · کمبو کالاف دیوتی موبایل</Badge>
          <h1 className="text-3xl font-black leading-tight text-foreground sm:text-5xl">
            خرید مطمئن محصولات کالاف،
            <span className="brand-wordmark"> بدون دردسر</span>
          </h1>
          <p className="max-w-xl text-sm leading-7 text-muted sm:text-lg">
            سی‌پی، اکانت و کمبوهای منتخب کالاف دیوتی موبایل با فرایند خرید ساده، پرداخت
            کارت‌به‌کارت و پشتیبانی در دسترس.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/shop" variant="primary" size="lg">
              مشاهده محصولات
            </ButtonLink>
            <ButtonLink href="/shop?category=cp" variant="outline" size="lg">
              خرید CP
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* Stat ------------------------------------------------------------------ */
function StatSection({ successfulOrders }: { successfulOrders: number }) {
  if (successfulOrders <= 0) return null;
  return (
    <section className="py-10">
      <Container>
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-gold/25 bg-gradient-to-br from-gold/10 to-transparent px-6 py-10 text-center">
          <span className="brand-wordmark text-4xl font-black tnum sm:text-5xl">
            +{formatNumber(successfulOrders)}
          </span>
          <p className="text-sm font-semibold text-foreground sm:text-base">سفارش موفق</p>
          <p className="text-xs text-muted">آماری نمونه از عملکرد فروشگاه (قابل ویرایش)</p>
        </div>
      </Container>
    </section>
  );
}

/* Testimonials ---------------------------------------------------------- */
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`امتیاز ${rating} از ۵`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-gold" : "text-border"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.784.57-1.838-.196-1.539-1.118l1.286-3.957a1 1 0 00-.362-1.118L2.98 9.384c-.783-.57-.38-1.81.588-1.81h4.16a1 1 0 00.951-.69l1.286-3.957z" />
        </svg>
      ))}
    </div>
  );
}

async function TestimonialsSection() {
  const testimonials = await getApprovedTestimonials(6);
  return (
    <section className="py-14">
      <Container>
        <SectionHeading
          eyebrow="نظرات"
          title="رضایت مشتریان"
          description="بخشی از بازخوردهای ثبت‌شده در ابول استور."
        />
        <div className="mt-10">
          {testimonials.length === 0 ? (
            <EmptyState
              title="هنوز نظری ثبت نشده است"
              description="پس از اولین سفارش‌ها، نظرات مشتریان اینجا نمایش داده می‌شود."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <figure
                  key={t.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
                >
                  <div className="flex items-center justify-between">
                    <StarRow rating={t.rating} />
                    {t.isVerifiedBuyer ? (
                      <Badge tone="success">خریدار تأییدشده</Badge>
                    ) : t.isTestimonial ? (
                      <Badge tone="silver">ثبت‌شده توسط فروشگاه</Badge>
                    ) : null}
                  </div>
                  <blockquote className="text-sm leading-7 text-foreground/90">
                    «{t.comment}»
                  </blockquote>
                  <figcaption className="text-xs font-semibold text-muted">
                    — {t.authorName ?? "کاربر ابول استور"}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

/* Products grid --------------------------------------------------------- */
async function FeaturedSection() {
  const products = await getFeaturedProducts(6);
  return (
    <section className="py-14">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow="محصولات ویژه"
            title="پیشنهادهای منتخب"
            align="start"
          />
          <ButtonLink href="/shop" variant="ghost" size="sm" className="hidden sm:inline-flex">
            مشاهده همه
          </ButtonLink>
        </div>
        <div className="mt-8">
          {products.length === 0 ? (
            <EmptyState
              title="هنوز محصول ویژه‌ای ثبت نشده"
              description="به‌زودی محصولات منتخب اینجا نمایش داده می‌شوند."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

async function BestSellingSection() {
  const products = await getBestSellingProducts(4);
  if (products.length === 0) return null; // keep homepage tight when empty
  return (
    <section className="border-y border-border bg-surface/40 py-14">
      <Container>
        <SectionHeading eyebrow="پرفروش‌ها" title="محبوب‌ترین‌ محصولات" align="start" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}

/* FAQ ------------------------------------------------------------------- */
async function FaqSection() {
  const faqs = await getActiveFaqs(6);
  return (
    <section className="py-14">
      <Container>
        <SectionHeading
          eyebrow="سوالات متداول"
          title="پاسخ سوالات پرتکرار"
          description="اگر پاسخ سوال خود را پیدا نکردید، از دکمه‌ی پشتیبانی استفاده کنید."
        />
        <div className="mt-10">
          {faqs.length === 0 ? (
            <EmptyState title="هنوز سوالی ثبت نشده است" />
          ) : (
            <FaqAccordion faqs={faqs} />
          )}
        </div>
      </Container>
    </section>
  );
}

/* Final CTA ------------------------------------------------------------- */
function FinalCta() {
  return (
    <section className="pb-16">
      <Container>
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-gold/30 bg-gradient-to-b from-gold/10 to-transparent px-6 py-12 text-center">
          <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            آماده‌ی شروع خرید هستید؟
          </h2>
          <p className="max-w-lg text-sm leading-7 text-muted">
            همین حالا محصولات ابول استور را ببینید و سفارش خود را ثبت کنید.
          </p>
          <ButtonLink href="/shop" variant="primary" size="lg">
            ورود به فروشگاه
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

/* Page ------------------------------------------------------------------ */
export default async function HomePage() {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    getActiveCategories(),
  ]);

  return (
    <>
      <Hero />
      <TrustStrip />
      <CategorySection categories={categories} />
      <FeaturedSection />
      <BestSellingSection />
      <WhySection />
      <StatSection successfulOrders={settings.successfulOrders} />
      <TestimonialsSection />
      <StepsSection />
      <FaqSection />
      <AboutPreview />
      <FinalCta />
    </>
  );
}
