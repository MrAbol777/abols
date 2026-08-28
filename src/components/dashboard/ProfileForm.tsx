"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, type ProfileState } from "@/app/dashboard/profile-actions";
import { buttonClasses } from "@/components/ui";

const initial: ProfileState = {};

const inputCls =
  "h-12 w-full rounded-xl border border-border bg-elevated px-4 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold";

export function ProfileForm({
  name,
  phone,
}: {
  name: string | null;
  phone: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initial);
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-bold text-foreground">اطلاعات حساب</h2>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted">شماره موبایل</dt>
            <dd dir="ltr" className="font-medium text-foreground tnum">{phone}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted">وضعیت</dt>
            <dd className="font-medium text-success">فعال</dd>
          </div>
        </dl>
      </section>

      <form action={formAction} className="flex flex-col gap-5">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-bold text-foreground">ویرایش نام</h2>
          <div className="mt-3 flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-medium text-foreground">
              نام و نام خانوادگی
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={name ?? ""}
              className={inputCls}
            />
            {state.fieldErrors?.name ? (
              <span className="text-xs text-danger">{state.fieldErrors.name}</span>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-bold text-foreground">تغییر رمز عبور</h2>
          <p className="mt-1 text-xs text-muted">
            برای تغییر رمز، رمز فعلی و رمز جدید را وارد کنید (رمز جدید حداقل ۸ کاراکتر).
          </p>
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="currentPassword" className="text-xs font-medium text-foreground">
                رمز فعلی
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                className={inputCls}
              />
              {state.fieldErrors?.currentPassword ? (
                <span className="text-xs text-danger">{state.fieldErrors.currentPassword}</span>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-xs font-medium text-foreground">
                رمز جدید
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                className={inputCls}
              />
              {state.fieldErrors?.newPassword ? (
                <span className="text-xs text-danger">{state.fieldErrors.newPassword}</span>
              ) : null}
            </div>
            <label className="flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={showPw}
                onChange={(e) => setShowPw(e.target.checked)}
                className="accent-gold"
              />
              نمایش رمزها
            </label>
          </div>
        </section>

        {state.status !== "idle" && state.message ? (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={`rounded-lg px-3 py-2 text-xs ${
              state.status === "success" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <button type="submit" disabled={pending} className={buttonClasses("primary", "lg", "self-start")}>
          {pending ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </form>
    </div>
  );
}