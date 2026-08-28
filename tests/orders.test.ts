import { describe, expect, it } from "vitest";
import { generateTrackingCode } from "@/lib/orders";
import { resolveDiscount, type ApplicableDiscount } from "@/lib/pricing";

describe("generateTrackingCode", () => {
  it("produces the AB-XXXXXX format", () => {
    expect(generateTrackingCode()).toMatch(/^AB-[A-Z2-9]{6}$/);
  });

  it("produces varied codes", () => {
    const set = new Set(Array.from({ length: 50 }, () => generateTrackingCode()));
    expect(set.size).toBeGreaterThan(40);
  });
});

describe("resolveDiscount", () => {
  const base: ApplicableDiscount = {
    id: "d1",
    type: "PERCENTAGE",
    value: 10,
    usageCount: 0,
    usageLimit: null,
    minOrderAmount: null,
    startsAt: null,
    endsAt: null,
  };

  it("applies a percentage to the subtotal", () => {
    const r = resolveDiscount(base, 100000);
    expect(r).toEqual({ ok: true, id: "d1", discountAmount: 10000 });
  });

  it("applies a fixed amount", () => {
    const r = resolveDiscount({ ...base, type: "FIXED", value: 25000 }, 100000);
    expect(r.ok && r.discountAmount).toBe(25000);
  });

  it("caps the discount at the subtotal", () => {
    const r = resolveDiscount({ ...base, type: "FIXED", value: 999999 }, 100000);
    expect(r.ok && r.discountAmount).toBe(100000);
  });

  it("rejects when usage limit is reached", () => {
    const r = resolveDiscount({ ...base, usageLimit: 5, usageCount: 5 }, 100000);
    expect(r.ok).toBe(false);
  });

  it("rejects below the min order amount", () => {
    const r = resolveDiscount({ ...base, minOrderAmount: 200000 }, 100000);
    expect(r.ok).toBe(false);
  });

  it("rejects expired codes", () => {
    const r = resolveDiscount({ ...base, endsAt: new Date(Date.now() - 1000) }, 100000);
    expect(r.ok).toBe(false);
  });

  it("rejects not-yet-started codes", () => {
    const r = resolveDiscount({ ...base, startsAt: new Date(Date.now() + 100000) }, 100000);
    expect(r.ok).toBe(false);
  });

  it("rejects missing/null code", () => {
    expect(resolveDiscount(null, 100000).ok).toBe(false);
  });
});