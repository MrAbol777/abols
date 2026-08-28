"use client";

import { useState } from "react";
import { useActionState } from "react";
import {
  createProductAction,
  updateProductAction,
  type CatalogActionState,
} from "@/app/admin/catalog-actions";
import { buttonClasses } from "@/components/ui";
import type { AdminCategoryItem, AdminProductDetail } from "@/lib/admin-catalog";

const initial: CatalogActionState = {};

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-elevated px-3 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold";
const textareaCls =
  "w-full rounded-xl border border-border bg-elevated px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-gold focus-visible:outline-gold resize-none";
const labelCls = "text-xs font-medium text-foreground";
const fieldWrap = "flex flex-col gap-1.5";

type AttrRow = { key: string; label: string; value: string };
type FieldRow = {
  label: string;
  fieldKey: string;
  fieldType: string;
  required: boolean;
  placeholder: string;
  helpText: string;
  options: string;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-4 font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function ProductForm({
  categories,
  product,
}: {
  categories: AdminCategoryItem[];
  product?: AdminProductDetail;
}) {
  const action = product ? updateProductAction : createProductAction;
  const [state, formAction, pending] = useActionState(action, initial);

  const [attributes, setAttributes] = useState<AttrRow[]>(
    product?.attributes.map((a) => ({ key: a.key, label: a.label, value: a.value })) ?? [],
  );
  const [fields, setFields] = useState<FieldRow[]>(
    product?.checkoutFields.map((f) => ({
      label: f.label,
      fieldKey: f.fieldKey,
      fieldType: f.fieldType,
      required: f.required,
      placeholder: f.placeholder ?? "",
      helpText: f.helpText ?? "",
      options: f.options.join("\n"),
    })) ?? [],
  );

  function setAttr(i: number, patch: Partial<AttrRow>) {
    setAttributes((prev) => prev.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  }
  function setField(i: number, patch: Partial<FieldRow>) {
    setFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  const err = (field: string) =>
    state.fieldErrors?.[field] ? (
      <span className="text-xs text-danger">{state.fieldErrors[field]}</span>
    ) : null;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <Section title="اطلاعات پایه">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={fieldWrap}>
            <label className={labelCls} htmlFor="name">نام محصول</label>
            <input id="name" name="name" defaultValue={product?.name} required className={inputCls} />
            {err("name")}
          </div>
          <div className={fieldWrap}>
            <label className={labelCls} htmlFor="slug">اسلاگ</label>
            <input id="slug" name="slug" dir="ltr" defaultValue={product?.slug} required className={inputCls} />
            {err("slug")}
          </div>
          <div className={fieldWrap}>
            <label className={labelCls} htmlFor="type">نوع</label>
            <select id="type" name="type" defaultValue={product?.type ?? "CP"} className={inputCls}>
              <option value="CP">سی‌پی</option>
              <option value="ACCOUNT">اکانت</option>
              <option value="COMBO">کمبو</option>
            </select>
          </div>
          <div className={fieldWrap}>
            <label className={labelCls} htmlFor="categoryId">دسته</label>
            <select id="categoryId" name="categoryId" defaultValue={product?.categoryId} required className={inputCls}>
              <option value="">انتخاب دسته...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {err("categoryId")}
          </div>
          <div className={`${fieldWrap} sm:col-span-2`}>
            <label className={labelCls} htmlFor="shortDescription">توضیح کوتاه</label>
            <input id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription ?? ""} className={inputCls} />
          </div>
          <div className={`${fieldWrap} sm:col-span-2`}>
            <label className={labelCls} htmlFor="fullDescription">توضیحات کامل</label>
            <textarea id="fullDescription" name="fullDescription" rows={4} defaultValue={product?.fullDescription ?? ""} className={textareaCls} />
          </div>
        </div>
      </Section>

      <Section title="قیمت و فروش">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={fieldWrap}>
            <label className={labelCls} htmlFor="price">قیمت (تومان)</label>
            <input id="price" name="price" type="number" min={0} defaultValue={product?.price ?? 0} required className={inputCls} />
            {err("price")}
          </div>
          <div className={fieldWrap}>
            <label className={labelCls} htmlFor="compareAtPrice">قیمت قبل از تخفیف (اختیاری)</label>
            <input id="compareAtPrice" name="compareAtPrice" type="number" min={0} defaultValue={product?.compareAtPrice ?? ""} className={inputCls} />
          </div>
          <div className={fieldWrap}>
            <label className={labelCls} htmlFor="cancellationPolicy">سیاست لغو (اختیاری)</label>
            <input id="cancellationPolicy" name="cancellationPolicy" defaultValue={product?.cancellationPolicy ?? ""} className={inputCls} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} className="accent-gold" />
            فعال
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} className="accent-gold" />
            ویژه
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="isBestSelling" defaultChecked={product?.isBestSelling ?? false} className="accent-gold" />
            پرفروش
          </label>
        </div>
      </Section>

      <Section title="موجودی">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={fieldWrap}>
            <label className={labelCls} htmlFor="inventoryMode">حالت موجودی</label>
            <select id="inventoryMode" name="inventoryMode" defaultValue={product?.inventoryMode ?? "UNLIMITED"} className={inputCls}>
              <option value="UNLIMITED">نامحدود</option>
              <option value="STATUS_ONLY">فقط وضعیت</option>
              <option value="EXACT_QUANTITY">تعداد دقیق</option>
            </select>
          </div>
          <div className={fieldWrap}>
            <label className={labelCls} htmlFor="quantity">تعداد (برای حالت دقیق)</label>
            <input id="quantity" name="quantity" type="number" min={0} defaultValue={product?.quantity ?? ""} className={inputCls} />
          </div>
          <div className={fieldWrap}>
            <label className={labelCls} htmlFor="inStock">وضعیت موجود (برای حالت فقط وضعیت)</label>
            <select id="inStock" name="inStock" defaultValue={product?.inStock ? "on" : ""} className={inputCls}>
              <option value="on">موجود</option>
              <option value="">ناموجود</option>
            </select>
          </div>
        </div>
      </Section>

      <Section title="تصویر (اختیاری)">
        <div className={fieldWrap}>
          <label className={labelCls} htmlFor="mediaUrl">آدرس تصویر</label>
          <input id="mediaUrl" name="mediaUrl" dir="ltr" defaultValue={product?.media[0]?.url ?? ""} placeholder="https://..." className={inputCls} />
          <p className="text-[11px] text-muted">در صورت نبودن تصویر، یک نشان اختصاصی نوع محصول نمایش داده می‌شود.</p>
        </div>
      </Section>

      <Section title="مشخصات محصول">
        {attributes.map((attr, i) => (
          <div key={i} className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <input name="attr_key" value={attr.key} onChange={(e) => setAttr(i, { key: e.target.value })} placeholder="کلید (region)" dir="ltr" className={inputCls} />
            <input name="attr_label" value={attr.label} onChange={(e) => setAttr(i, { label: e.target.value })} placeholder="برچسب (ریجن)" className={inputCls} />
            <input name="attr_value" value={attr.value} onChange={(e) => setAttr(i, { value: e.target.value })} placeholder="مقدار" className={inputCls} />
            <button type="button" onClick={() => setAttributes((prev) => prev.filter((_, idx) => idx !== i))} className="rounded-xl border border-border px-3 text-muted transition-colors hover:border-danger/50 hover:text-danger focus-visible:outline-gold" aria-label="حذف مشخصه">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => setAttributes((prev) => [...prev, { key: "", label: "", value: "" }])} className="text-sm text-gold hover:underline focus-visible:outline-gold">
          + افزودن مشخصه
        </button>
      </Section>

      <Section title="فیلدهای تکمیلی سفارش">
        {fields.map((f, i) => (
          <div key={i} className="mb-4 rounded-xl border border-border bg-elevated/50 p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input name="field_label" value={f.label} onChange={(e) => setField(i, { label: e.target.value })} placeholder="برچسب (ریجن اکانت)" className={inputCls} />
              <input name="field_key" value={f.fieldKey} onChange={(e) => setField(i, { fieldKey: e.target.value })} placeholder="کلید (region)" dir="ltr" className={inputCls} />
              <select name="field_type" value={f.fieldType} onChange={(e) => setField(i, { fieldType: e.target.value })} className={inputCls}>
                <option value="TEXT">متن</option>
                <option value="TEXTAREA">متن بلند</option>
                <option value="NUMBER">عدد</option>
                <option value="EMAIL">ایمیل</option>
                <option value="SELECT">انتخابی</option>
              </select>
              <input name="field_placeholder" value={f.placeholder} onChange={(e) => setField(i, { placeholder: e.target.value })} placeholder="Placeholder" className={inputCls} />
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input name="field_help" value={f.helpText} onChange={(e) => setField(i, { helpText: e.target.value })} placeholder="راهنما" className={inputCls} />
              <label className="flex shrink-0 items-center gap-2 text-sm text-foreground">
                <input type="checkbox" name="field_required" checked={f.required} onChange={(e) => setField(i, { required: e.target.checked })} className="accent-gold" />
                الزامی
              </label>
            </div>
            {f.fieldType === "SELECT" ? (
              <textarea name="field_options" value={f.options} onChange={(e) => setField(i, { options: e.target.value })} rows={2} placeholder="گزینه‌ها (هر گزینه در یک خط)" className={`${textareaCls} mt-3`} />
            ) : null}
            <button type="button" onClick={() => setFields((prev) => prev.filter((_, idx) => idx !== i))} className="mt-2 text-xs text-muted transition-colors hover:text-danger focus-visible:outline-gold">
              حذف این فیلد
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setFields((prev) => [...prev, { label: "", fieldKey: "", fieldType: "TEXT", required: false, placeholder: "", helpText: "", options: "" }])} className="text-sm text-gold hover:underline focus-visible:outline-gold">
          + افزودن فیلد تکمیلی
        </button>
      </Section>

      {state.status !== "idle" && state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`rounded-lg px-3 py-2 text-sm ${
            state.status === "success" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClasses("primary", "lg")}>
          {pending ? "در حال ذخیره..." : product ? "ذخیره تغییرات" : "ایجاد محصول"}
        </button>
      </div>
    </form>
  );
}