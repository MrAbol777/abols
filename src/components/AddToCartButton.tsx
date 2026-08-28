"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart, type CartItem } from "@/lib/cart";

/**
 * Add-to-cart button with quantity selector. Uses the client cart store.
 * Prices shown here are display snapshots; checkout always recomputes server-side.
 */
export function AddToCartButton({ product }: { product: CartItem }) {
  const { addItem, count } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ ...product, quantity });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  const inputCls =
    "h-12 w-12 rounded-xl border border-border bg-elevated text-center text-sm font-semibold text-foreground outline-none focus:border-gold focus-visible:outline-gold";
  const stepBtnCls =
    "flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-elevated text-lg font-bold text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="کاهش تعداد"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className={stepBtnCls}
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              setQuantity(Number.isFinite(v) ? Math.min(99, Math.max(1, v)) : 1);
            }}
            className={inputCls}
            aria-label="تعداد"
          />
          <button
            type="button"
            aria-label="افزایش تعداد"
            disabled={quantity >= 99}
            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
            className={stepBtnCls}
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className={`inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-base font-bold transition-colors focus-visible:outline-2 focus-visible:outline-gold ${
            added
              ? "bg-success text-white"
              : "bg-gold text-black hover:bg-gold-hover shadow-[0_6px_20px_-8px_rgba(212,175,55,0.6)]"
          }`}
        >
          {added ? (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              اضافه شد
            </>
          ) : (
            "افزودن به سبد خرید"
          )}
        </button>
      </div>

      {added ? (
        <Link
          href="/cart"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/50 px-4 py-2.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/10 focus-visible:outline-gold"
        >
          مشاهده سبد خرید ({count} کالا)
        </Link>
      ) : null}
    </div>
  );
}