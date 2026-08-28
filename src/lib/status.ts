/**
 * Human-readable Persian labels for the free-form order status strings.
 * Kept as a lookup (not an enum) so the workflow stays configurable later.
 */
const ORDER_STATUS_LABELS: Record<string, string> = {
  AWAITING_PAYMENT: "در انتظار پرداخت",
  AWAITING_REVIEW: "در انتظار بررسی مدیر",
  PAYMENT_APPROVED: "پرداخت تأیید شد",
  PROCESSING: "در حال انجام",
  NEEDS_INFO: "نیازمند اصلاح اطلاعات",
  COMPLETED: "تکمیل شده",
  CANCELLED: "لغو شده",
  RECEIPT_REJECTED: "رسید رد شد",
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

const RECEIPT_STATUS_LABELS: Record<string, string> = {
  PENDING: "در انتظار بررسی",
  APPROVED: "تأیید شده",
  REJECTED: "رد شده",
};

export function receiptStatusLabel(status: string): string {
  return RECEIPT_STATUS_LABELS[status] ?? status;
}

/** Badge tone per order status for the admin UI. */
export function orderStatusTone(status: string): "gold" | "silver" | "success" | "danger" | "neutral" {
  switch (status) {
    case "COMPLETED":
    case "PAYMENT_APPROVED":
      return "success";
    case "CANCELLED":
    case "RECEIPT_REJECTED":
      return "danger";
    case "AWAITING_REVIEW":
      return "gold";
    case "PROCESSING":
      return "silver";
    default:
      return "neutral";
  }
}

export function receiptStatusTone(status: string): "gold" | "silver" | "success" | "danger" | "neutral" {
  switch (status) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
    case "PENDING":
      return "gold";
    default:
      return "neutral";
  }
}
