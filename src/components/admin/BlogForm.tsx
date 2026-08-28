"use client";

import { useActionState } from "react";
import { createBlogPostAction, updateBlogPostAction, type ContentActionState } from "@/app/admin/content-actions";
import { buttonClasses } from "@/components/ui";
import type { AdminBlogItem } from "@/lib/admin-content";

const initial: ContentActionState = {};

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-elevated px-3 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold";
const ix =
  "w-full rounded-xl border border-border bg-elevated px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold resize-none";

export function BlogForm({ post, content }: { post?: AdminBlogItem; content?: string }) {
  const action = post ? updateBlogPostAction : createBlogPostAction;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-5">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-xs font-medium text-foreground">عنوان</label>
          <input id="title" name="title" defaultValue={post?.title} required className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="slug" className="text-xs font-medium text-foreground">اسلاگ</label>
          <input id="slug" name="slug" dir="ltr" defaultValue={post?.slug} required className={inputCls} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="excerpt" className="text-xs font-medium text-foreground">خلاصه</label>
        <input id="excerpt" name="excerpt" defaultValue={post?.excerpt ?? ""} className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="featuredImage" className="text-xs font-medium text-foreground">تصویر (آدرس URL، اختیاری)</label>
        <input id="featuredImage" name="featuredImage" dir="ltr" className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="content" className="text-xs font-medium text-foreground">محتوا</label>
        <textarea id="content" name="content" rows={12} defaultValue={content ?? ""} className={ix} placeholder="متن مقاله..." />
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="isPublished" defaultChecked className="accent-gold" />
        منتشرشده
      </label>

      {state.message ? (
        <p role={state.status === "error" ? "alert" : "status"} className={`rounded-lg px-3 py-2 text-xs ${state.status === "success" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={buttonClasses("primary", "lg", "self-start")}>
        {pending ? "در حال ذخیره..." : post ? "ذخیره تغییرات" : "ایجاد مقاله"}
      </button>
    </form>
  );
}