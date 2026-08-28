import { describe, expect, it } from "vitest";
import {
  iranianMobileSchema,
  adminLoginSchema,
  checkoutCustomerSchema,
} from "@/lib/schemas";

describe("iranianMobileSchema", () => {
  it("accepts a valid phone", () => {
    const r = iranianMobileSchema.safeParse("09121234567");
    expect(r.success).toBe(true);
    expect(r.success && r.data).toBe("09121234567");
  });

  it("accepts Persian-digit phone and normalizes it", () => {
    const r = iranianMobileSchema.safeParse("۰۹۱۲۱۲۳۴۵۶۷");
    expect(r.success).toBe(true);
    expect(r.success && r.data).toBe("09121234567");
  });

  it("rejects 10-digit phone", () => {
    const r = iranianMobileSchema.safeParse("0912123456");
    expect(r.success).toBe(false);
  });

  it("rejects a phone starting with 08", () => {
    const r = iranianMobileSchema.safeParse("08121234567");
    expect(r.success).toBe(false);
  });
});

describe("adminLoginSchema", () => {
  it("accepts phone + password", () => {
    const r = adminLoginSchema.safeParse({ phone: "09121234567", password: "secret" });
    expect(r.success).toBe(true);
  });

  it("rejects empty password", () => {
    const r = adminLoginSchema.safeParse({ phone: "09121234567", password: "" });
    expect(r.success).toBe(false);
  });
});

describe("checkoutCustomerSchema", () => {
  it("normalizes Persian phone while preserving name", () => {
    const r = checkoutCustomerSchema.safeParse({
      name: "علی",
      phone: "۰۹۱۲۱۲۳۴۵۶۷",
      supportContact: "",
      note: "",
    });
    expect(r.success).toBe(true);
    expect(r.success && r.data.phone).toBe("09121234567");
  });

  it("rejects name shorter than 2 chars", () => {
    const r = checkoutCustomerSchema.safeParse({
      name: "ا",
      phone: "09121234567",
    });
    expect(r.success).toBe(false);
  });
});