import { describe, expect, it } from "vitest";
import { orderStatusLabel, receiptStatusLabel, orderStatusTone } from "@/lib/status";

describe("status labels", () => {
  it("maps known order statuses", () => {
    expect(orderStatusLabel("AWAITING_REVIEW")).toBe("در انتظار بررسی مدیر");
    expect(orderStatusLabel("COMPLETED")).toBe("تکمیل شده");
  });

  it("falls back to the raw status for unknown values", () => {
    expect(orderStatusLabel("MYSTERY_STATUS")).toBe("MYSTERY_STATUS");
  });

  it("maps receipt statuses", () => {
    expect(receiptStatusLabel("PENDING")).toBe("در انتظار بررسی");
    expect(receiptStatusLabel("APPROVED")).toBe("تأیید شده");
  });
});

describe("orderStatusTone", () => {
  it("returns expected tones", () => {
    expect(orderStatusTone("COMPLETED")).toBe("success");
    expect(orderStatusTone("RECEIPT_REJECTED")).toBe("danger");
    expect(orderStatusTone("AWAITING_REVIEW")).toBe("gold");
    expect(orderStatusTone("UNKNOWN")).toBe("neutral");
  });
});