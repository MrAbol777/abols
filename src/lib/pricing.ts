/**
 * Pure price/discount math used by checkout. Server-side only; never fed by
 * browser-supplied prices.
 */

export type ApplicableDiscount = {
  id: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  usageCount: number;
  usageLimit: number | null;
  minOrderAmount: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
};

export type DiscountResolution =
  | { ok: true; id: string; discountAmount: number }
  | { ok: false; error: string };

/** Validate a discount against the current time/subtotal and compute amount. */
export function resolveDiscount(
  discount: ApplicableDiscount | null,
  subtotal: number,
): DiscountResolution {
  if (!discount) return { ok: false, error: "کد تخفیف معتبر نیست." };

  const now = new Date();
  if (discount.startsAt && discount.startsAt > now) {
    return { ok: false, error: "کد تخفیف هنوز فعال نشده است." };
  }
  if (discount.endsAt && discount.endsAt < now) {
    return { ok: false, error: "کد تخفیف منقضی شده است." };
  }
  if (
    discount.usageLimit != null &&
    discount.usageCount >= discount.usageLimit
  ) {
    return { ok: false, error: "سقف استفاده از این کد تکمیل شده است." };
  }
  if (discount.minOrderAmount && subtotal < discount.minOrderAmount) {
    return {
      ok: false,
      error: `حداقل مبلغ سفارش برای این کد ${formatTomanNum(discount.minOrderAmount)} است.`,
    };
  }

  let amount = 0;
  if (discount.type === "PERCENTAGE") {
    amount = Math.round((subtotal * discount.value) / 100);
  } else {
    amount = discount.value;
  }
  if (amount <= 0) return { ok: false, error: "مقدار تخفیف صفر است." };

  return { ok: true, id: discount.id, discountAmount: Math.min(amount, subtotal) };
}

/** Simple Toman formatter without locale dependencies (test-friendly). */
export function formatTomanNum(amount: number): string {
  return `${new Intl.NumberFormat("fa-IR").format(amount)} تومان`;
}