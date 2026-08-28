"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatToman } from "@/lib/format";
import { EmptyState, ButtonLink } from "@/components/ui";

/**
 * Cart page. Display-only prices are cart snapshots; the real prices are
 * always recomputed server-side at checkout.
 */
export default function CartPage() {
  const { items, subtotal, setQuantity, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <EmptyState
          title="سبد خرید شما خالی است"
          description="محصولات مورد نظرتان را از فروشگاه اضافه کنید."
        />
        <div className="mt-6 flex justify-center">
          <ButtonLink href="/shop">مشاهده فروشگاه</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">سبد خرید</h1>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-muted transition-colors hover:text-danger focus-visible:outline-gold"
        >
          خالی کردن سبد
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Items */}
        <ul className="flex flex-col gap-3 lg:col-span-2">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <Link
                  href={`/shop/${item.slug}`}
                  className="truncate font-bold text-foreground transition-colors hover:text-gold focus-visible:outline-gold"
                >
                  {item.name}
                </Link>
                <span className="text-sm text-muted tnum">{formatToman(item.price)}</span>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                {/* Quantity stepper */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="کاهش تعداد"
                    disabled={item.quantity <= 1}
                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-elevated text-base font-bold text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-9 text-center text-sm font-semibold text-foreground tnum">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="افزایش تعداد"
                    disabled={item.quantity >= 99}
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-elevated text-base font-bold text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <span className="w-28 text-end font-extrabold text-gold tnum">
                  {formatToman(item.price * item.quantity)}
                </span>

                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  aria-label={`حذف ${item.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-gold"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-24">
          <h2 className="font-bold text-foreground">خلاصه سفارش</h2>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">جمع سبد</dt>
              <dd className="font-semibold text-foreground tnum">{formatToman(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <dt className="font-bold text-foreground">مبلغ قابل پرداخت</dt>
              <dd className="text-lg font-extrabold text-gold tnum">{formatToman(subtotal)}</dd>
            </div>
          </dl>
          <Link
            href="/checkout"
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 text-base font-bold text-black transition-colors hover:bg-gold-hover focus-visible:outline-2 focus-visible:outline-gold"
          >
            ادامه و ثبت سفارش
          </Link>
          <Link
            href="/shop"
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-border text-sm font-semibold text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold"
          >
            ادامه خرید
          </Link>
          <p className="mt-4 text-[11px] leading-5 text-muted">
            مبلغ نهایی هنگام ثبت سفارش بر اساس قیمت روز محصولات محاسبه می‌شود.
          </p>
        </aside>
      </div>
    </div>
  );
}