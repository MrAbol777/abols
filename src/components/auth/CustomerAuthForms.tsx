"use client";

import { useActionState, useState } from "react";
import { loginAction, registerAction, type CustomerAuthState } from "@/app/auth-actions";
import { buttonClasses } from "@/components/ui";

const initial: CustomerAuthState = {};

const inputCls =
  "h-12 w-full rounded-xl border border-border bg-elevated px-4 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold";

function PasswordInput({
  id,
  autoComplete,
}: {
  id: string;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name="password"
        type={show ? "text" : "password"}
        required
        autoComplete={autoComplete}
        placeholder="رمز عبور"
        className={`${inputCls} pl-12`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "پنهان کردن رمز" : "نمایش رمز"}
        className="absolute inset-y-0 left-0 flex w-12 items-center justify-center text-muted transition-colors hover:text-gold focus-visible:outline-gold"
      >
        {show ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-phone" className="text-sm font-medium text-foreground">
          شماره موبایل
        </label>
        <input
          id="login-phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          dir="ltr"
          autoComplete="username"
          required
          placeholder="09xxxxxxxxx"
          className={inputCls}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-password" className="text-sm font-medium text-foreground">
          رمز عبور
        </label>
        <PasswordInput id="login-password" autoComplete="current-password" />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-danger/15 px-3 py-2 text-xs text-danger">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={buttonClasses("primary", "lg", "w-full")}>
        {pending ? "در حال ورود..." : "ورود"}
      </button>
    </form>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initial);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-name" className="text-sm font-medium text-foreground">
          نام و نام خانوادگی
        </label>
        <input
          id="reg-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="نام شما"
          className={inputCls}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-phone" className="text-sm font-medium text-foreground">
          شماره موبایل
        </label>
        <input
          id="reg-phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          dir="ltr"
          autoComplete="username"
          required
          placeholder="09xxxxxxxxx"
          className={inputCls}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-sm font-medium text-foreground">
          رمز عبور (حداقل ۸ کاراکتر)
        </label>
        <PasswordInput id="reg-password" autoComplete="new-password" />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-danger/15 px-3 py-2 text-xs text-danger">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={buttonClasses("primary", "lg", "w-full")}>
        {pending ? "در حال ثبت‌نام..." : "ثبت‌نام"}
      </button>
    </form>
  );
}