"use client";

import { useRef, useState } from "react";
import { useActionState } from "react";
import { submitReceipt, type ReceiptUploadState } from "@/app/tracking/actions";
import { buttonClasses } from "@/components/ui";

const initialState: ReceiptUploadState = { status: "idle" };

/**
 * Card-to-card receipt upload shown on the public tracking page when the order
 * is awaiting payment (or its receipt was rejected). Server validates file type
 * + size and records the status transition.
 */
export function ReceiptUpload({ trackingCode }: { trackingCode: string }) {
  const [state, formAction, pending] = useActionState(submitReceipt, initialState);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">ارسال رسید کارت‌به‌کارت</p>
          <p className="text-xs leading-5 text-muted">
            پس از واریز، تصویر فیش واریز را برای بررسی مدیر ارسال کنید.
          </p>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="code" value={trackingCode} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="receipt-phone" className="text-xs font-medium text-foreground">
            شماره موبایل ثبت‌شده در سفارش
          </label>
          <input
            id="receipt-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            required
            dir="ltr"
            placeholder="09xxxxxxxxx"
            className="h-12 w-full rounded-xl border border-border bg-elevated px-4 text-start text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold"
          />
          {state.fieldErrors?.phone ? (
            <span className="text-xs text-danger">{state.fieldErrors.phone}</span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <input
            ref={inputRef}
            id="receipt-file"
            name="receipt"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-elevated px-4 text-sm font-medium text-muted transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold"
          >
            {fileName ?? "انتخاب تصویر فیش واریز"}
          </button>
          <p className="text-[11px] text-muted">
            فرمت‌های مجاز: JPG، PNG، WebP — حداکثر ۵ مگابایت
          </p>
        </div>

        {state.status !== "idle" && state.message ? (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={`rounded-lg px-3 py-2 text-xs ${
              state.status === "success"
                ? "bg-success/15 text-success"
                : "bg-danger/15 text-danger"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <button type="submit" disabled={pending} className={buttonClasses("primary", "md")}>
          {pending ? "در حال ارسال..." : "ارسال رسید"}
        </button>
      </form>
    </div>
  );
}
