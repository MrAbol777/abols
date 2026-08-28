"use client";

import { useActionState } from "react";
import { createCategoryAction, updateCategoryAction, type CatalogActionState } from "@/app/admin/catalog-actions";
import { buttonClasses } from "@/components/ui";
import type { AdminCategoryItem } from "@/lib/admin-catalog";

const initial: CatalogActionState = {};

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-elevated px-3 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold";
const fieldWrap = "flex flex-col gap-1.5";

export function CategoryForm({ category }: { category?: AdminCategoryItem }) {
  const action = category ? updateCategoryAction : createCategoryAction;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}

      <div className={fieldWrap}>
        <label htmlFor="cat-name" className="text-xs font-medium text-foreground">نام دسته</label>
        <input id="cat-name" name="name" defaultValue={category?.name} required className={inputCls} />
        {state.fieldErrors?.name ? <span className="text-xs text-danger">{state.fieldErrors.name}</span> : null}
      </div>

      <div className={fieldWrap}>
        <label htmlFor="cat-slug" className="text-xs font-medium text-foreground">اسلاگ</label>
        <input id="cat-slug" name="slug" dir="ltr" defaultValue={category?.slug} required className={inputCls} placeholder="cp" />
        {state.fieldErrors?.slug ? <span className="text-xs text-danger">{state.fieldErrors.slug}</span> : null}
      </div>

      <div className={fieldWrap}>
        <label htmlFor="cat-desc" className="text-xs font-medium text-foreground">توضیحات (اختیاری)</label>
        <textarea id="cat-desc" name="description" rows={2} defaultValue={category?.description ?? ""} className="resize-none rounded-xl border border-border bg-elevated px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold" />
      </div>

      <div className={fieldWrap}>
        <label htmlFor="cat-sort" className="text-xs font-medium text-foreground">ترتیب نمایش</label>
        <input id="cat-sort" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} className={inputCls} />
      </div>

      {state.status !== "idle" && state.message ? (
        <p role={state.status === "error" ? "alert" : "status"} className={`rounded-lg px-3 py-2 text-xs ${state.status === "success" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={buttonClasses("primary", "md", "self-start")}>
        {pending ? "در حال ذخیره..." : category ? "ذخیره" : "ایجاد دسته"}
      </button>
    </form>
  );
}