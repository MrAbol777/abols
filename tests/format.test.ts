import { describe, expect, it } from "vitest";
import { formatNumber, formatToman, toWesternDigits } from "@/lib/format";

describe("toWesternDigits", () => {
  it("converts Persian digits", () => {
    expect(toWesternDigits("۰۹۱۲")).toBe("0912");
  });

  it("converts Arabic-Indic digits", () => {
    expect(toWesternDigits("٠٩١٢")).toBe("0912");
  });

  it("leaves western digits and letters untouched", () => {
    expect(toWesternDigits("09a")).toBe("09a");
  });
});

describe("formatNumber", () => {
  it("formats thousands separators in Persian digits", () => {
    expect(formatNumber(1247)).toBe("۱٬۲۴۷");
  });

  it("formats zero", () => {
    expect(formatNumber(0)).toBe("۰");
  });
});

describe("formatToman", () => {
  it("appends تومان", () => {
    expect(formatToman(100000)).toBe("۱۰۰٬۰۰۰ تومان");
  });
});