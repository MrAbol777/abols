"use client";

import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatToman } from "@/lib/format";
import {
  getCheckoutProducts,
  placeOrder,
  type CheckoutProductInfo,
  type CheckoutState,
} from "@/app/checkout/actions";
import { buttonClasses } from "@/components/ui";

const initialState: CheckoutState = { status: "idle" };

const inputCls =
  "h-12 w-full rounded-xl border border-border bg-elevated px-4 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [products, setProducts] = useState<CheckoutProductInfo[]>([]);
  const [responses, setResponses] = useState<Record<string, Record<string, string>>>({});
  const [discountCode, setDiscountCode] = useState("");

  // Fetch fresh product data (prices + custom fields) from the server.
  const cartKey = useMemo(
    () => items.map((i) => `${i.productId}:${i.quantity}`).join("|"),
    [items],
  );

  useEffect(() => {
    const ids = items.map((i) => i.productId);
    if (ids.length === 0) return;
    let cancelled = false;
    getCheckoutProducts(ids).then((data) => {
      if (cancelled) return;
      setProducts(data);
    });
    return () => {
      cancelled = true;
    };
  }, [cartKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const [state, formAction, pending] = useActionState(placeOrder, initialState);

  // On success: clear the cart and go to tracking with the fresh code.
  useEffect(() => {
    if (state.status === "success" && state.trackingCode) {
      clear();
      router.replace(`/tracking?code=${encodeURIComponent(state.trackingCode)}`);
    }
  }, [state, clear, router]);

  const productById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  // "Loading" = we still need fresh server data for every item in the cart.
  const loading = items.length > 0 && items.some((i) => !productById.has(i.productId));

  function setResponse(productId: string, fieldKey: string, value: string) {
    setResponses((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] ?? {}), [fieldKey]: value },
    }));
  }

  if (!loading && items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
          <p className="font-semibold text-foreground">سبد خرید شما خالی است</p>
          <p className="max-w-sm text-sm text-muted">برای ثبت سفارش ابتدا محصولی به سبد اضافه کنید.</p>
          <Link href="/shop" className={buttonClasses("primary")}>
            مشاهده فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  // Merge fresh server prices into the line items for the summary.
  const lines = items
    .map((item) => {
      const product = productById.get(item.productId);
      const price = product?.price ?? item.price;
      return { ...item, product, price };
    })
    .filter((l) => !!l.product);

  const serverSubtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">ثبت سفارش</h1>
      <p className="mt-1 text-sm text-muted">
        اطلاعات زیر را تکمیل کنید؛ مبلغ نهایی هنگام ثبت، بر اساس قیمت روز محاسبه می‌شود.
      </p>

      <form action={formAction} className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <input type="hidden" name="items" value={JSON.stringify(
          items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            fieldResponses: responses[i.productId] ?? {},
          })),
        )} />

        {/* Discount code is submitted via its own input below */}

        {/* Left column: customer info + per-product fields */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Customer info */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-bold text-foreground">اطلاعات تماس</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs font-medium text-foreground">
                  نام و نام خانوادگی <span className="text-danger">*</span>
                </label>
                <input id="name" name="name" type="text" required className={inputCls} placeholder="نام شما" />
                {state.fieldErrors?.name ? (
                  <span className="text-xs text-danger">{state.fieldErrors.name}</span>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-xs font-medium text-foreground">
                  شماره موبایل <span className="text-danger">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  dir="ltr"
                  className={inputCls}
                  placeholder="09xxxxxxxxx"
                />
                {state.fieldErrors?.phone ? (
                  <span className="text-xs text-danger">{state.fieldErrors.phone}</span>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="supportContact" className="text-xs font-medium text-foreground">
                  شناسه‌ی تماس (تلگرام/روبیکا) — اختیاری
                </label>
                <input
                  id="supportContact"
                  name="supportContact"
                  type="text"
                  className={inputCls}
                  placeholder="مثلاً @username"
                />
                {state.fieldErrors?.supportContact ? (
                  <span className="text-xs text-danger">{state.fieldErrors.supportContact}</span>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="note" className="text-xs font-medium text-foreground">
                  یادداشت سفارش — اختیاری
                </label>
                <textarea
                  id="note"
                  name="note"
                  rows={2}
                  className="resize-none rounded-xl border border-border bg-elevated px-4 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold"
                />
              </div>
            </div>
          </section>

          {/* Per-product custom checkout fields */}
          {lines.map((line) => {
            const product = line.product!;
            const fields = product.checkoutFields ?? [];
            return (
              <section key={product.id} className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-bold text-foreground">{product.name}</h2>
                  <span className="text-sm text-muted">
                    {line.quantity} عدد × <span className="tnum">{formatToman(line.price)}</span>
                  </span>
                </div>

                {fields.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {fields.map((field) => {
                      const fieldKey = `${product.id}:${field.fieldKey}`;
                      const error = state.fieldErrors?.[fieldKey];
                      const value = responses[product.id]?.[field.fieldKey] ?? "";
                      const common = {
                        id: fieldKey,
                        name: `field:${product.id}:${field.fieldKey}`,
                        required: field.required,
                        placeholder: field.placeholder ?? undefined,
                        "aria-invalid": error ? true : undefined,
                        className: inputCls,
                        value,
                        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                          setResponse(product.id, field.fieldKey, e.target.value),
                      };
                      return (
                        <div key={field.id} className="flex flex-col gap-1.5">
                          <label htmlFor={fieldKey} className="text-xs font-medium text-foreground">
                            {field.label}
                            {field.required ? <span className="text-danger"> *</span> : null}
                          </label>
                          {field.fieldType === "SELECT" ? (
                            <select {...common}>
                              <option value="">انتخاب کنید...</option>
                              {field.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : field.fieldType === "TEXTAREA" ? (
                            <textarea
                              rows={2}
                              className="resize-none rounded-xl border border-border bg-elevated px-4 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold"
                              required={field.required}
                              value={value}
                              onChange={(e) => setResponse(product.id, field.fieldKey, e.target.value)}
                            />
                          ) : (
                            <input
                              {...common}
                              type={
                                field.fieldType === "NUMBER"
                                  ? "number"
                                  : field.fieldType === "EMAIL"
                                    ? "email"
                                    : "text"
                              }
                              inputMode={field.fieldType === "NUMBER" ? "numeric" : undefined}
                            />
                          )}
                          {field.helpText ? (
                            <span className="text-[11px] text-muted">{field.helpText}</span>
                          ) : null}
                          {error ? <span className="text-xs text-danger">{error}</span> : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-muted">
                    هیچ اطلاعات تکمیلی برای این محصول لازم نیست.
                  </p>
                )}
              </section>
            );
          })}
        </div>

        {/* Summary sidebar */}
        <aside className="h-fit rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-24">
          <h2 className="font-bold text-foreground">خلاصه سفارش</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {lines.map((l) => (
              <li key={l.productId} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-muted">
                  {l.product!.name}
                  <span className="ms-1 text-xs tnum">×{l.quantity}</span>
                </span>
                <span className="font-semibold text-foreground tnum">
                  {formatToman(l.price * l.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 flex flex-col gap-2 border-t border-border pt-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">جمع</dt>
              <dd className="font-semibold text-foreground tnum">{formatToman(serverSubtotal)}</dd>
            </div>
            {state.status === "success" && state.trackingCode ? null : (
              <>
                <label htmlFor="discountCode" className="mt-1 text-xs font-medium text-foreground">
                  کد تخفیف (اختیاری)
                </label>
                <div className="flex gap-2">
                  <input
                    id="discountCode"
                    name="discountCode"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    dir="ltr"
                    placeholder="CODE10"
                    className="h-11 flex-1 rounded-xl border border-border bg-elevated px-3 text-start text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold"
                  />
                </div>
                {state.fieldErrors?.discountCode ? (
                  <span className="text-xs text-danger">{state.fieldErrors.discountCode}</span>
                ) : null}
              </>
            )}
            <div className="flex items-center justify-between">
              <dt className="font-bold text-foreground">مبلغ قابل پرداخت</dt>
              <dd className="text-lg font-extrabold text-gold tnum">{formatToman(serverSubtotal)}</dd>
            </div>
          </dl>

          {state.status === "error" && state.message ? (
            <p role="alert" className="mt-4 rounded-lg bg-danger/15 px-3 py-2 text-xs text-danger">
              {state.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || loading}
            className={buttonClasses("primary", "lg", "mt-6 w-full")}
          >
            {pending ? "در حال ثبت سفارش..." : "ثبت سفارش و پرداخت کارت‌به‌کارت"}
          </button>
          <Link
            href="/cart"
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-border text-sm font-semibold text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold"
          >
            بازگشت به سبد خرید
          </Link>
        </aside>
      </form>
    </div>
  );
}