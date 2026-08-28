import Link from "next/link";
import { Logo } from "./Logo";
import { Container } from "./ui";

const shopLinks = [
  { label: "همه محصولات", href: "/shop" },
  { label: "خرید CP", href: "/shop?category=cp" },
  { label: "خرید اکانت", href: "/shop?category=account" },
  { label: "خرید کمبو", href: "/shop?category=combo" },
];

const usefulLinks = [
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
  { label: "آموزش خرید", href: "/tutorial" },
  { label: "پیگیری سفارش", href: "/tracking" },
  { label: "سوالات متداول", href: "/faq" },
  { label: "وبلاگ", href: "/blog" },
];

const legalLinks = [
  { label: "قوانین خرید", href: "/rules" },
  { label: "حریم خصوصی", href: "/privacy" },
  { label: "بازگشت وجه", href: "/refund" },
];

export function Footer({
  brandName,
  telegramUrl,
  rubikaUrl,
}: {
  brandName: string;
  telegramUrl: string | null;
  rubikaUrl: string | null;
}) {
  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(new Date());

  return (
    <footer className="mt-16 border-t border-border bg-surface/50">
      <Container className="py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-4 lg:col-span-1">
            <Logo brandName={brandName} />
            <p className="max-w-xs text-xs leading-6 text-muted">
              فروشگاه تخصصی محصولات دیجیتال کالاف دیوتی موبایل؛ خرید ساده، شفاف و همراه با
              پشتیبانی.
            </p>
            <div className="flex gap-2">
              {telegramUrl ? (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border bg-elevated px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
                >
                  تلگرام
                </a>
              ) : null}
              {rubikaUrl ? (
                <a
                  href={rubikaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border bg-elevated px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold"
                >
                  روبیکا
                </a>
              ) : null}
            </div>
          </div>

          {/* Shop */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-foreground">فروشگاه</h3>
            <ul className="flex flex-col gap-2">
              {shopLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-muted transition-colors hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-foreground">دسترسی سریع</h3>
            <ul className="flex flex-col gap-2">
              {usefulLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-muted transition-colors hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-foreground">قوانین</h3>
            <ul className="flex flex-col gap-2">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-muted transition-colors hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {year} {brandName} — تمامی حقوق محفوظ است.
          </p>
          <p className="text-[11px] text-muted/70">
            این فروشگاه وابستگی رسمی به Activision یا Call of Duty ندارد.
          </p>
        </div>
      </Container>
    </footer>
  );
}
