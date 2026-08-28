"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitReviewAction } from "@/app/dashboard/review-actions";
import { buttonClasses } from "@/components/ui";

export function ReviewForm({
  orderId,
  productId,
  productName,
}: {
  orderId: string;
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) {
      setError("متن نظر الزامی است.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await submitReviewAction(orderId, productId, rating, comment);
    if (res.error) setError(res.error);
    else {
      setComment("");
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">امتیاز شما به {productName}</p>
        <div className="flex gap-1" role="radiogroup" aria-label="امتیاز">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} از ۵`}
              onClick={() => setRating(n)}
              className={`focus-visible:outline-gold ${n <= rating ? "text-gold" : "text-border"}`}
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.784.57-1.838-.196-1.539-1.118l1.286-3.957a1 1 0 00-.362-1.118L2.98 9.384c-.783-.57-.38-1.81.588-1.81h4.16a1 1 0 00.951-.69l1.286-3.957z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="نظر شما درباره این محصول..."
        className="resize-none rounded-xl border border-border bg-elevated px-4 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold"
      />

      {error ? (
        <p role="alert" className="rounded-lg bg-danger/15 px-3 py-2 text-xs text-danger">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className={buttonClasses("primary", "md", "self-start")}>
        {busy ? "در حال ثبت..." : "ثبت نظر"}
      </button>
      <p className="text-[11px] text-muted">
        نظر شما پس از تأیید مدیر منتشر می‌شود.
      </p>
    </form>
  );
}