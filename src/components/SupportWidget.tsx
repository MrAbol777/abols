"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { submitSupportMessage, type SupportFormState } from "@/app/actions";
import { buttonClasses } from "./ui";

const initialState: SupportFormState = { status: "idle", message: "" };

export function SupportWidget({
  supportText,
  telegramUrl,
  rubikaUrl,
}: {
  supportText: string | null;
  telegramUrl: string | null;
  rubikaUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(submitSupportMessage, initialState);
  const dialogRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape; focus the close button when opening.
  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Reset the form after a successful submission.
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <>
      {/* Floating button (kept clear of very bottom to avoid covering content) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="پشتیبانی"
        className="fixed bottom-20 left-4 lg:bottom-5 lg:left-5 z-50 flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gold text-black shadow-[0_10px_30px_-8px_rgba(212,175,55,0.7)] transition-transform hover:scale-105 focus-visible:outline-gold"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l.8-4A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-title"
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-surface p-5 shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="support-title" className="text-lg font-bold text-foreground">
                  پشتیبانی ابول استور
                </h2>
                <p className="mt-1 text-xs leading-6 text-muted">
                  {supportText ?? "برای ثبت سفارش یا سوال با ما در ارتباط باشید."}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-foreground focus-visible:outline-gold"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messenger actions */}
            {telegramUrl || rubikaUrl ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {telegramUrl ? (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses("secondary", "md")}
                  >
                    تلگرام
                  </a>
                ) : null}
                {rubikaUrl ? (
                  <a
                    href={rubikaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses("secondary", "md")}
                  >
                    روبیکا
                  </a>
                ) : null}
              </div>
            ) : null}

            {/* Support form */}
            <form ref={formRef} action={formAction} className="mt-4 flex flex-col gap-3">
              {/* Honeypot (hidden from users) */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden
              />

              <div className="flex flex-col gap-1">
                <label htmlFor="support-name" className="text-xs font-medium text-foreground">
                  نام
                </label>
                <input
                  id="support-name"
                  name="name"
                  type="text"
                  required
                  className="h-11 rounded-xl border border-border bg-elevated px-3 text-sm text-foreground outline-none focus:border-gold focus-visible:outline-gold"
                  placeholder="نام شما"
                />
                {state.fieldErrors?.name ? (
                  <span className="text-xs text-danger">{state.fieldErrors.name}</span>
                ) : null}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="support-phone" className="text-xs font-medium text-foreground">
                  شماره موبایل
                </label>
                <input
                  id="support-phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  dir="ltr"
                  className="h-11 rounded-xl border border-border bg-elevated px-3 text-start text-sm text-foreground outline-none focus:border-gold focus-visible:outline-gold"
                  placeholder="09xxxxxxxxx"
                />
                {state.fieldErrors?.phone ? (
                  <span className="text-xs text-danger">{state.fieldErrors.phone}</span>
                ) : null}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="support-message" className="text-xs font-medium text-foreground">
                  پیام
                </label>
                <textarea
                  id="support-message"
                  name="message"
                  required
                  rows={3}
                  className="resize-none rounded-xl border border-border bg-elevated px-3 py-2 text-sm text-foreground outline-none focus:border-gold focus-visible:outline-gold"
                  placeholder="پیام شما..."
                />
                {state.fieldErrors?.message ? (
                  <span className="text-xs text-danger">{state.fieldErrors.message}</span>
                ) : null}
              </div>

              {state.status !== "idle" && state.message ? (
                <p
                  className={`rounded-lg px-3 py-2 text-xs ${
                    state.status === "success"
                      ? "bg-success/15 text-success"
                      : "bg-danger/15 text-danger"
                  }`}
                  role="status"
                >
                  {state.message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className={buttonClasses("primary", "lg", "w-full")}
              >
                {pending ? "در حال ارسال..." : "ارسال پیام"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
