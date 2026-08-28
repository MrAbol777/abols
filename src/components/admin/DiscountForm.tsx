"use client";

import { useActionState } from "react";
import { createDiscountAction } from "@/app/admin/content-actions";
import { buttonClasses } from "@/components/ui";

const initial: { status?: "idle" | "success" | "error"; message?: string } = {};

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-elevated px-3 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold";
const ix = "w-full rounded-xl border border-border bg-elevated px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold";

export function DiscountForm() {
  const [state, formAction, pending] = useActionState(createDiscountAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="d-code" className="text-xs font-medium text-foreground">کد</label>
          <input id="d-code" name="code" dir="ltr" required placeholder="SAVE10" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="d-type" className="text-xs font-medium text-foreground">نوع</label>
          <select id="d-type" name="type" defaultValue="PERCENTAGE" className={inputCls}>
            <option value="PERCENTAGE">درصدی</option>
            <option value="FIXED">مبلغ ثابت</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="d-value" className="text-xs font-medium text-foreground">مقدار</label>
          <input id="d-value" name="value" type="number" min={1} required placeholder="10" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="d-min" className="text-xs font-medium text-foreground">حداقل مبلغ (اختیاری)</label>
          <input id="d-min" name="minOrderAmount" type="number" min={0} placeholder="100000" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="d-start" className="text-xs font-medium text-foreground">شروع (اختیاری)</label>
          <input id="d-start" name="startsAt" type="datetime-local" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="d-end" className="text-xs font-medium text-foreground">پایان (اختیاری)</label>
          <input id="d-end" name="endsAt" type="datetime-local" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5 col-span-2">
          <label htmlFor="d-limit" className="text-xs font-medium text-foreground">سقف استفاده (اختیاری)</label>
          <input id="d-limit" name="usageLimit" type="number" min={1} placeholder="100" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5 col-span-2">
          <label htmlFor="d-desc" className="text-xs font-medium text-foreground">توضیحات (اختیاری)</label>
          <input id="d-desc" name="description" className={ix} placeholder="متن ریز برای مشتری" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="isActive" defaultChecked className="accent-gold" />
        فعال از همین حالا
      </label>

      {state.message ? (
        <p role={state.status === "error" ? "alert" : "status"} className={`rounded-lg px-3 py-2 text-xs ${state.status === "success" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={buttonClasses("primary", "md", "self-start")}>
        {pending ? "در حال ساخت..." : "ایجاد کد"}
      </button>
    </form>
  );
}