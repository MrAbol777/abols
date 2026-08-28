import { z } from "zod";
import { toWesternDigits } from "./format";

/**
 * Validation schemas for Abol Store forms.
 */

/**
 * Iranian mobile number validation (starts with 09, 11 digits total).
 * Accepts Persian/Arabic digits and normalizes them.
 */
export const iranianMobileSchema = z
  .string()
  .min(1, "شماره موبایل الزامی است")
  .transform(toWesternDigits)
  .refine((val) => /^09\d{9}$/.test(val), {
    message: "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم داشته باشد",
  });

/**
 * Support message form schema.
 */
export const supportMessageSchema = z.object({
  name: z
    .string()
    .min(1, "نام الزامی است")
    .min(2, "نام باید حداقل ۲ حرف باشد")
    .max(100, "نام نباید بیش از ۱۰۰ حرف باشد"),
  phone: iranianMobileSchema,
  message: z
    .string()
    .min(1, "پیام الزامی است")
    .min(10, "پیام باید حداقل ۱۰ حرف باشد")
    .max(1000, "پیام نباید بیش از ۱۰۰۰ حرف باشد"),
});

export type SupportMessageInput = z.infer<typeof supportMessageSchema>;

/**
 * Admin login form schema. Password is only length-checked here; correctness is
 * verified against the stored hash server-side. Never trims/echoes the password.
 */
export const adminLoginSchema = z.object({
  phone: iranianMobileSchema,
  password: z
    .string()
    .min(1, "رمز عبور الزامی است")
    .max(200, "رمز عبور بیش از حد طولانی است"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

/**
 * Customer account schemas. Register requires name, mobile, and a strong-enough
 * password; login is the same phone + password shape as admin.
 */
export const customerRegisterSchema = z.object({
  name: z
    .string()
    .min(1, "نام الزامی است")
    .min(2, "نام باید حداقل ۲ حرف باشد")
    .max(100, "نام نباید بیش از ۱۰۰ حرف باشد"),
  phone: iranianMobileSchema,
  password: z
    .string()
    .min(1, "رمز عبور الزامی است")
    .min(8, "رمز عبور باید حداقل ۸ حرف باشد")
    .max(200, "رمز عبور بیش از حد طولانی است"),
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;

export const customerLoginSchema = z.object({
  phone: iranianMobileSchema,
  password: z
    .string()
    .min(1, "رمز عبور الزامی است")
    .max(200, "رمز عبور بیش از حد طولانی است"),
});

export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;

/**
 * Checkout customer info. Name and phone are required; support contact (a
 * messenger id for delivery) is optional but validated for length.
 */
export const checkoutCustomerSchema = z.object({
  name: z
    .string()
    .min(1, "نام الزامی است")
    .min(2, "نام باید حداقل ۲ حرف باشد")
    .max(100, "نام نباید بیش از ۱۰۰ حرف باشد"),
  phone: iranianMobileSchema,
  supportContact: z
    .string()
    .max(200, "شناسه تماس نباید بیش از ۲۰۰ حرف باشد")
    .optional()
    .or(z.literal("")),
  note: z
    .string()
    .max(1000, "یادداشت نباید بیش از ۱۰۰۰ حرف باشد")
    .optional()
    .or(z.literal("")),
});

export type CheckoutCustomerInput = z.infer<typeof checkoutCustomerSchema>;

/** One cart line submitted for checkout. Prices are NOT part of this — the
 *  server looks up every price itself. */
export const checkoutItemSchema = z.object({
  productId: z.string().min(1, "محصول نامعتبر است"),
  quantity: z.number().int().min(1, "تعداد باید حداقل ۱ باشد").max(99, "تعداد بیش از حد مجاز است"),
  fieldResponses: z.record(z.string(), z.string()).default({}),
});

export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;

/**
 * Admin catalog schemas.
 */
export const categorySchema = z.object({
  name: z.string().min(1, "نام دسته الزامی است").min(2, "نام باید حداقل ۲ حرف باشد").max(100, "نام خیلی طولانی است"),
  slug: z
    .string()
    .min(1, "اسلاگ الزامی است")
    .regex(/^[a-z0-9-]+$/, "اسلاگ فقط حروف کوچک، عدد و خط تیره می‌تواند داشته باشد")
    .max(100),
  description: z.string().max(500, "توضیحات خیلی طولانی است").optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;

const attributeRowSchema = z.object({
  key: z.string().trim().min(1).regex(/^[a-z0-9_]+$/, "کلید فقط حروف کوچک، عدد و زیرخط"),
  label: z.string().trim().min(1, "برچسب الزامی است"),
  value: z.string().trim().min(1, "مقدار الزامی است"),
});

const checkoutFieldRowSchema = z.object({
  label: z.string().trim().min(1, "برچسب فیلد الزامی است"),
  fieldKey: z.string().trim().min(1).regex(/^[a-z0-9_]+$/, "کلید فیلد فقط حروف کوچک، عدد و زیرخط"),
  fieldType: z.enum(["TEXT", "TEXTAREA", "NUMBER", "EMAIL", "SELECT"]),
  required: z.boolean().default(false),
  placeholder: z.string().trim().max(200).optional().or(z.literal("")),
  helpText: z.string().trim().max(300).optional().or(z.literal("")),
  options: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const productSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است").max(200),
  slug: z
    .string()
    .min(1, "اسلاگ الزامی است")
    .regex(/^[a-z0-9-]+$/, "اسلاگ فقط حروف کوچک، عدد و خط تیره")
    .max(150),
  shortDescription: z.string().max(300, "توضیح کوتاه خیلی طولانی است").optional().or(z.literal("")),
  fullDescription: z.string().max(10000).optional().or(z.literal("")),
  price: z.coerce.number().int().min(0, "قیمت باید عدد نامنفی باشد").max(100_000_000_000),
  compareAtPrice: z.coerce.number().int().min(0).max(100_000_000_000).optional().or(z.literal("")),
  type: z.enum(["CP", "ACCOUNT", "COMBO"]),
  categoryId: z.string().min(1, "انتخاب دسته الزامی است"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestSelling: z.boolean().default(false),
  inventoryMode: z.enum(["UNLIMITED", "STATUS_ONLY", "EXACT_QUANTITY"]),
  inStock: z.boolean().default(true),
  quantity: z.coerce.number().int().min(0).optional().or(z.literal("")),
  cancellationPolicy: z.string().max(1000).optional().or(z.literal("")),
  attributes: z.array(attributeRowSchema).default([]),
  checkoutFields: z.array(checkoutFieldRowSchema).default([]),
  mediaUrl: z.string().max(1000).optional().or(z.literal("")),
});

export type ProductInput = z.infer<typeof productSchema>;

/** Admin site settings form. */
export const settingsSchema = z.object({
  brandName: z.string().min(1, "نام فروشگاه الزامی است").max(100),
  successfulOrders: z.coerce.number().int().min(0).max(10_000_000),
  cardHolderName: z.string().max(100).optional().or(z.literal("")),
  cardNumber: z.string().max(50).optional().or(z.literal("")),
  telegramUrl: z.string().url("آدرس تلگرام معتبر نیست").max(500).optional().or(z.literal("")),
  rubikaUrl: z.string().url("آدرس روبیکا معتبر نیست").max(500).optional().or(z.literal("")),
  supportText: z.string().max(1000).optional().or(z.literal("")),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
