import Link from "next/link";
import { Container, SectionHeading, ButtonLink, Badge } from "./ui";
import type { CategoryView } from "@/lib/site";

/* Category cards -------------------------------------------------------- */
const categoryMeta: Record<
  string,
  { title: string; desc: string; href: string; glyph: string }
> = {
  cp: {
    title: "خرید CP",
    desc: "شارژ سریع سی‌پی کالاف دیوتی موبایل در مبالغ مختلف.",
    href: "/shop?category=cp",
    glyph: "CP",
  },
  account: {
    title: "خرید اکانت",
    desc: "اکانت‌های منتخب با سکین، اسلحه و مشخصات کامل.",
    href: "/shop?category=account",
    glyph: "AC",
  },
  combo: {
    title: "خرید کمبو",
    desc: "بسته‌های ترکیبی با قیمت مناسب‌تر.",
    href: "/shop?category=combo",
    glyph: "CO",
  },
};

// Fallback categories if the DB has none.
const fallbackCategories: CategoryView[] = [
  { id: "cp", name: "خرید CP", slug: "cp", description: null },
  { id: "account", name: "خرید اکانت", slug: "account", description: null },
  { id: "combo", name: "خرید کمبو", slug: "combo", description: null },
];

export function CategorySection({ categories }: { categories: CategoryView[] }) {
  const list = categories.length > 0 ? categories : fallbackCategories;
  return (
    <section className="py-14">
      <Container>
        <SectionHeading
          eyebrow="دسته‌بندی‌ها"
          title="چه چیزی می‌خواهید بخرید؟"
          description="محصولات ابول استور در سه دسته‌ی اصلی سازمان‌دهی شده‌اند."
        />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {list.map((cat) => {
            const meta = categoryMeta[cat.slug] ?? {
              title: cat.name,
              desc: cat.description ?? "",
              href: `/shop?category=${cat.slug}`,
              glyph: "★",
            };
            return (
              <Link
                key={cat.id}
                href={meta.href}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all hover:border-gold/50 hover:shadow-[0_16px_50px_-24px_rgba(212,175,55,0.6)]"
              >
                <div
                  className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    backgroundImage:
                      "radial-gradient(400px 120px at 100% 0%, rgba(212,175,55,0.12), transparent 60%)",
                  }}
                  aria-hidden
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gold/30 bg-gold/10">
                  <span className="brand-wordmark text-xl font-black">{meta.glyph}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-foreground">{meta.title}</h3>
                  <p className="text-sm leading-6 text-muted">
                    {cat.description ?? meta.desc}
                  </p>
                </div>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                  مشاهده محصولات
                  <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* Trust strip ----------------------------------------------------------- */
const trustItems = [
  { title: "پرداخت کارت‌به‌کارت", desc: "روش ساده و آشنا" },
  { title: "پیگیری سفارش", desc: "با کد رهگیری" },
  { title: "پشتیبانی در دسترس", desc: "پاسخ‌گویی به سوالات" },
  { title: "بررسی توسط ادمین", desc: "کنترل هر سفارش" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-surface/40">
      <Container className="py-6">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {trustItems.map((item) => (
            <li key={item.title} className="flex items-center gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground sm:text-sm">{item.title}</span>
                <span className="text-[11px] text-muted">{item.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* Why Abol Store -------------------------------------------------------- */
const whyItems = [
  { title: "فرایند خرید شفاف", desc: "مراحل سفارش مشخص و بدون ابهام است." },
  { title: "امکان پیگیری سفارش", desc: "با کد رهگیری وضعیت سفارش را ببینید." },
  { title: "پشتیبانی واقعی", desc: "برای سوال یا مشکل، در دسترس هستیم." },
  { title: "بررسی رسید توسط مدیر", desc: "هر پرداخت به‌صورت دستی بررسی می‌شود." },
  { title: "قوانین مشخص خرید", desc: "پیش از خرید، قوانین را می‌دانید." },
  { title: "محصولات تخصصی کالاف", desc: "تمرکز روی CP، اکانت و کمبو." },
];

export function WhySection() {
  return (
    <section className="py-14">
      <Container>
        <SectionHeading
          eyebrow="چرا ابول استور؟"
          title="خریدی که می‌توانید به آن اعتماد کنید"
          description="ما روی شفافیت و تجربه‌ی خرید ساده تمرکز کرده‌ایم."
        />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {whyItems.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-foreground">{item.title}</h3>
              <p className="text-sm leading-6 text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* Purchase steps -------------------------------------------------------- */
const steps = [
  { n: 1, title: "انتخاب محصول", desc: "محصول مورد نظر را انتخاب کنید." },
  { n: 2, title: "ثبت سفارش", desc: "اطلاعات لازم را وارد کنید." },
  { n: 3, title: "پرداخت و ارسال رسید", desc: "کارت‌به‌کارت و آپلود رسید." },
  { n: 4, title: "بررسی توسط ادمین", desc: "سفارش شما بررسی می‌شود." },
  { n: 5, title: "تکمیل سفارش", desc: "سفارش انجام و تحویل می‌شود." },
];

export function StepsSection() {
  return (
    <section className="border-y border-border bg-surface/40 py-14">
      <Container>
        <SectionHeading
          eyebrow="مراحل خرید"
          title="خرید در ۵ گام ساده"
          description="فرایند سفارش در ابول استور شفاف و مرحله‌به‌مرحله است."
        />
        <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step) => (
            <li
              key={step.n}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-base font-black text-gold tnum">
                {new Intl.NumberFormat("fa-IR").format(step.n)}
              </span>
              <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
              <p className="text-xs leading-6 text-muted">{step.desc}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* About preview + final CTA -------------------------------------------- */
export function AboutPreview() {
  return (
    <section className="py-14">
      <Container>
        <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-border bg-gradient-to-br from-surface to-elevated p-8 lg:grid-cols-2 lg:p-12">
          <div className="flex flex-col gap-4">
            <Badge tone="gold">درباره ابول استور</Badge>
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              فروشگاه تخصصی محصولات دیجیتال کالاف دیوتی
            </h2>
            <p className="text-sm leading-7 text-muted sm:text-base">
              ابول استور با هدف ارائه‌ی تجربه‌ای ساده و مطمئن برای خرید CP، اکانت و کمبوهای
              کالاف دیوتی موبایل راه‌اندازی شده است. تمرکز ما بر شفافیت، پشتیبانی واقعی و
              فرایند خرید بدون دردسر است.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/about" variant="outline">
                بیشتر بدانید
              </ButtonLink>
              <ButtonLink href="/shop" variant="primary">
                مشاهده فروشگاه
              </ButtonLink>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="brand-wordmark text-5xl font-black sm:text-6xl">Abol StoRe</div>
          </div>
        </div>
      </Container>
    </section>
  );
}
