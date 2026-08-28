"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveReceipt, rejectReceipt } from "@/app/admin/order-actions";
import { buttonClasses } from "@/components/ui";

type Receipt = {
  id: string;
  imagePath: string;
  status: string;
  rejectionReason: string | null;
  createdAt: Date;
};

function formatDateTimeShort(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Review UI for a single PENDING receipt. Admin can approve it (moves order to
 * PAYMENT_APPROVED) or reject it with a required reason (moves to
 * RECEIPT_REJECTED). Uses server actions + router.refresh() to re-render.
 */
export function ReceiptReview({
  orderId,
  receipt,
}: {
  orderId: string;
  receipt: Receipt;
}) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  async function handleApprove() {
    setBusy("approve");
    setError(null);
    const res = await approveReceipt(orderId, receipt.id);
    if (res.error) setError(res.error);
    else router.refresh();
    setBusy(null);
  }

  async function handleReject() {
    if (!reason.trim()) {
      setError("دلیل رد کردن رسید را بنویسید.");
      return;
    }
    setBusy("reject");
    setError(null);
    const fd = new FormData();
    fd.set("reason", reason);
    const res = await rejectReceipt(orderId, receipt.id, fd);
    if (res.error) setError(res.error);
    else router.refresh();
    setBusy(null);
  }

  return (
    <section className="rounded-2xl border border-gold/30 bg-gold/5 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Receipt image */}
        <div className="w-full max-w-sm shrink-0 overflow-hidden rounded-xl border border-border bg-elevated">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={receipt.imagePath}
            alt="رسید پرداخت"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-foreground">بررسی رسید پرداخت</h2>
            <span className="text-xs text-muted tnum">{formatDateTimeShort(receipt.createdAt)}</span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleApprove}
              disabled={busy !== null}
              className={buttonClasses("success", "md", "w-full sm:w-auto")}
            >
              {busy === "approve" ? "در حال تأیید..." : "تأیید رسید و پرداخت"}
            </button>

            {rejecting ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="دلیل رد (مثلاً مبلغ نادرست است)"
                  className="resize-none rounded-xl border border-border bg-elevated px-4 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={busy !== null}
                    className={buttonClasses("danger", "md")}
                  >
                    {busy === "reject" ? "در حال رد..." : "رد رسید"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejecting(false);
                      setReason("");
                    }}
                    disabled={busy !== null}
                    className={buttonClasses("ghost", "md")}
                  >
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={busy !== null}
                className={buttonClasses("outline", "md", "w-full sm:w-auto")}
              >
                رد رسید
              </button>
            )}
          </div>

          {error ? (
            <p role="alert" className="rounded-lg bg-danger/15 px-3 py-2 text-xs text-danger">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}