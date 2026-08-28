"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveOrderNote,
  markOrderNeedsInfo,
  cancelOrder,
  markOrderProcessing,
  markOrderCompleted,
  reopenOrder,
  reopenCancelledOrder,
  verifyOrderPhone,
} from "@/app/admin/order-actions";
import { buttonClasses } from "@/components/ui";

/**
 * Full admin order-action panel: save a note, verify the customer phone,
 * advance status (processing / complete), request more info, cancel/reopen.
 */
export function OrderActions({
  orderId,
  status,
  isPhoneVerified,
}: {
  orderId: string;
  status: string;
  isPhoneVerified: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [noteSaved, setNoteSaved] = useState(false);

  async function run(action: string, fn: () => Promise<{ error?: string }>, after?: () => void) {
    setBusy(action);
    setError(null);
    const res = await fn();
    if (res.error) setError(res.error);
    else {
      after?.();
      router.refresh();
    }
    setBusy(null);
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="font-bold text-foreground">عملیات مدیریت سفارش</h2>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Note */}
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="admin-note" className="text-xs font-medium text-foreground">
            یادداشت داخلی مدیر
          </label>
          <textarea
            id="admin-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="یادداشت داخلی (برای مشتری نمایش داده نمی‌شود)"
            className="resize-none rounded-xl border border-border bg-elevated px-4 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold"
          />
          <button
            type="button"
            disabled={busy !== null}
            onClick={() =>
              run("note", () => saveOrderNote(orderId, note), () => {
                setNote("");
                setNoteSaved(true);
                window.setTimeout(() => setNoteSaved(false), 2500);
              })
            }
            className={buttonClasses("secondary", "md", "self-start")}
          >
            {noteSaved ? "ذخیره شد ✓" : "ذخیره یادداشت"}
          </button>
        </div>

        {/* Status transitions */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-foreground">وضعیت</p>
          <div className="flex flex-wrap gap-2">
            {status === "AWAITING_REVIEW" ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => {
                  const reason = window.prompt("دلیل نیاز به اطلاعات اصلاحی (برای مشتری نمایش داده می‌شود):");
                  if (reason === null) return;
                  if (!reason.trim()) {
                    setError("دلیل را وارد کنید.");
                    return;
                  }
                  run("info", () => markOrderNeedsInfo(orderId, reason.trim()));
                }}
                className={buttonClasses("outline", "sm")}
              >
                نیازمند اطلاعات
              </button>
            ) : null}

            {status === "PAYMENT_APPROVED" ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run("process", () => markOrderProcessing(orderId))}
                className={buttonClasses("primary", "sm")}
              >
                {busy === "process" ? "..." : "شروع انجام"}
              </button>
            ) : null}

            {status === "PROCESSING" ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run("complete", () => markOrderCompleted(orderId))}
                className={buttonClasses("success", "sm")}
              >
                {busy === "complete" ? "..." : "تکمیل سفارش"}
              </button>
            ) : null}

            {status === "RECEIPT_REJECTED" ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run("reopen", () => reopenOrder(orderId))}
                className={buttonClasses("outline", "sm")}
              >
                بازگشایی برای رسید جدید
              </button>
            ) : null}

            {status === "CANCELLED" ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run("reopen", () => reopenCancelledOrder(orderId))}
                className={buttonClasses("outline", "sm")}
              >
                بازگشایی سفارش
              </button>
            ) : null}

            {status !== "CANCELLED" && status !== "COMPLETED" ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => {
                  const reason = window.prompt("دلیل لغو سفارش:") ?? "";
                  if (!window.confirm("از لغو این سفارش مطمئن هستید؟ سبد برگردانده می‌شود.")) return;
                  run("cancel", () => cancelOrder(orderId, reason.trim() || ""));
                }}
                className={buttonClasses("danger", "sm")}
              >
                {busy === "cancel" ? "..." : "لغو سفارش"}
              </button>
            ) : null}
          </div>

          {/* Phone verification */}
          <button
            type="button"
            disabled={busy !== null || isPhoneVerified}
            onClick={() => run("verify", () => verifyOrderPhone(orderId))}
            className={buttonClasses("secondary", "sm", "self-start")}
          >
            {isPhoneVerified ? "شماره تأیید شده ✓" : "تأیید شماره موبایل"}
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-3 rounded-lg bg-danger/15 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </section>
  );
}