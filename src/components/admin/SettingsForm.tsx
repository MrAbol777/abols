"use client";

import { useActionState } from "react";
import { saveSettingsAction, type ContentActionState } from "@/app/admin/content-actions";
import { buttonClasses } from "@/components/ui";
import type { SettingsInput } from "@/lib/admin-content";

const initial: ContentActionState = {};

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-elevated px-3 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold";
const labelCls = "text-xs font-medium text-foreground";
const fieldWrap = "flex flex-col gap-1.5";

export function SettingsForm({ initial: s }: { initial: SettingsInput }) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, initial);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">تنظیمات فروشگاه</h1>
        <p className="mt-1 text-sm text-muted">اطلاعات نمایشی فروشگاه در صفحات عمومی.</p>
      </div>

      <form action={formAction} className="flex max-w-3xl flex-col gap-6">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-bold text-foreground">برند و آمار</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className={fieldWrap}>
              <label className={labelCls} htmlFor="brandName">نام فروشگاه</label>
              <input id="brandName" name="brandName" defaultValue={s.brandName} className={inputCls} />
            </div>
            <div className={fieldWrap}>
              <label className={labelCls} htmlFor="successfulOrders">تعداد سفارش موفق (نمایشی)</label>
              <input id="successfulOrders" name="successfulOrders" type="number" defaultValue={s.successfulOrders} className={inputCls} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-bold text-foreground">اطلاعات کارت به کارت</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className={fieldWrap}>
              <label className={labelCls} htmlFor="cardHolderName">نام صاحب کارت</label>
              <input id="cardHolderName" name="cardHolderName" defaultValue={s.cardHolderName} className={inputCls} />
            </div>
            <div className={fieldWrap}>
              <label className={labelCls} htmlFor="cardNumber">شماره کارت</label>
              <input id="cardNumber" name="cardNumber" dir="ltr" defaultValue={s.cardNumber} className={inputCls} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-bold text-foreground">شبکه‌های اجتماعی و پشتیبانی</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className={fieldWrap}>
              <label className={labelCls} htmlFor="telegramUrl">آدرس تلگرام</label>
              <input id="telegramUrl" name="telegramUrl" dir="ltr" defaultValue={s.telegramUrl} className={inputCls} />
            </div>
            <div className={fieldWrap}>
              <label className={labelCls} htmlFor="rubikaUrl">آدرس روبیکا</label>
              <input id="rubikaUrl" name="rubikaUrl" dir="ltr" defaultValue={s.rubikaUrl} className={inputCls} />
            </div>
            <div className={`${fieldWrap} sm:col-span-2`}>
              <label className={labelCls} htmlFor="supportText">متن پشتیبانی</label>
              <textarea id="supportText" name="supportText" rows={2} defaultValue={s.supportText} className="resize-none rounded-xl border border-border bg-elevated px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold" />
            </div>
          </div>
        </section>

        {state.status !== "idle" && state.message ? (
          <p role={state.status === "error" ? "alert" : "status"} className={`rounded-lg px-3 py-2 text-sm ${state.status === "success" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
            {state.message}
          </p>
        ) : null}

        <button type="submit" disabled={pending} className={buttonClasses("primary", "lg", "self-start")}>
          {pending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </button>
      </form>
    </div>
  );
}