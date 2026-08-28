"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { categorySchema, productSchema } from "@/lib/schemas";
import { saveProductImage } from "@/lib/product-images";

export type CatalogActionState = {
  status?: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

function firstError(errors: Record<string, string> | undefined): string | undefined {
  if (!errors) return undefined;
  return Object.values(errors)[0];
}

/* Categories -------------------------------------------------------------- */

export async function createCategoryAction(
  _prev: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const f = String(issue.path[0] ?? "");
      if (f) errors[f] = errors[f] ?? issue.message;
    }
    return { status: "error", message: firstError(errors) ?? "اطلاعات معتبر نیست.", fieldErrors: errors };
  }
  try {
    await prisma.category.create({ data: parsed.data });
  } catch {
    return { status: "error", message: "این اسلاگ قبلاً استفاده شده است.", fieldErrors: { slug: "اسلاگ تکراری است." } };
  }
  revalidatePath("/admin/categories");
  return { status: "success", message: "دسته ایجاد شد." };
}

export async function updateCategoryAction(
  _prev: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = categorySchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success || !id) {
    return { status: "error", message: "اطلاعات معتبر نیست." };
  }
  try {
    await prisma.category.update({ where: { id }, data: parsed.data });
  } catch {
    return { status: "error", message: "این اسلاگ قبلاً استفاده شده است." };
  }
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { status: "success", message: "دسته به‌روزرسانی شد." };
}

export async function toggleCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return;
  await prisma.category.update({ where: { id }, data: { isActive: !category.isActive } });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

/* Products ---------------------------------------------------------------- */

export async function createProductAction(
  _prev: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  await requireAdmin();

  let uploadedMediaUrl: string | undefined;
  const imageFile = formData.get("imageFile");
  if (imageFile && typeof imageFile === "object" && "size" in imageFile && (imageFile as File).size > 0) {
    const uploadRes = await saveProductImage(imageFile as File);
    if (!uploadRes.ok) {
      return { status: "error", message: uploadRes.error, fieldErrors: { mediaUrl: uploadRes.error } };
    }
    uploadedMediaUrl = uploadRes.url;
  }

  const input = buildProductInput(formData);
  if (uploadedMediaUrl) {
    input.mediaUrl = uploadedMediaUrl;
  }

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const f = String(issue.path[0] ?? "");
      if (f) errors[f] = errors[f] ?? issue.message;
    }
    return { status: "error", message: firstError(errors) ?? "اطلاعات معتبر نیست.", fieldErrors: errors };
  }

  const data = parsed.data;

  try {
    await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription || null,
        fullDescription: data.fullDescription || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        type: data.type,
        categoryId: data.categoryId,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isBestSelling: data.isBestSelling,
        inventoryMode: data.inventoryMode,
        inStock: data.inStock,
        quantity: data.inventoryMode === "EXACT_QUANTITY" ? data.quantity || 0 : null,
        cancellationPolicy: data.cancellationPolicy || null,
        media: data.mediaUrl
          ? { create: [{ url: data.mediaUrl, type: "IMAGE", sortOrder: 1 }] }
          : undefined,
        attributes: { create: data.attributes.map((a, i) => ({ ...a, sortOrder: i + 1 })) },
        checkoutFields: {
          create: data.checkoutFields.map((f, i) => ({
            ...f,
            options: f.options ? JSON.stringify(f.options.split("\n").map((o) => o.trim()).filter(Boolean)) : null,
            sortOrder: i + 1,
          })),
        },
      },
    });
  } catch {
    return { status: "error", message: "خطا در ایجاد محصول؛ اسلاگ ممکن است تکراری باشد." };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function updateProductAction(
  _prev: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "شناسه محصول نامعتبر است." };

  let uploadedMediaUrl: string | undefined;
  const imageFile = formData.get("imageFile");
  if (imageFile && typeof imageFile === "object" && "size" in imageFile && (imageFile as File).size > 0) {
    const uploadRes = await saveProductImage(imageFile as File);
    if (!uploadRes.ok) {
      return { status: "error", message: uploadRes.error, fieldErrors: { mediaUrl: uploadRes.error } };
    }
    uploadedMediaUrl = uploadRes.url;
  }

  const input = buildProductInput(formData);
  if (uploadedMediaUrl) {
    input.mediaUrl = uploadedMediaUrl;
  }

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const f = String(issue.path[0] ?? "");
      if (f) errors[f] = errors[f] ?? issue.message;
    }
    return { status: "error", message: firstError(errors) ?? "اطلاعات معتبر نیست.", fieldErrors: errors };
  }
  if (!id) return { status: "error", message: "شناسه محصول نامعتبر است." };

  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          shortDescription: data.shortDescription || null,
          fullDescription: data.fullDescription || null,
          price: data.price,
          compareAtPrice: data.compareAtPrice || null,
          type: data.type,
          categoryId: data.categoryId,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          isBestSelling: data.isBestSelling,
          inventoryMode: data.inventoryMode,
          inStock: data.inStock,
          quantity: data.inventoryMode === "EXACT_QUANTITY" ? data.quantity || 0 : null,
          cancellationPolicy: data.cancellationPolicy || null,
        },
      });

      // Replace attributes.
      await tx.productAttribute.deleteMany({ where: { productId: id } });
      if (data.attributes.length > 0) {
        await tx.productAttribute.createMany({
          data: data.attributes.map((a, i) => ({ ...a, productId: id, sortOrder: i + 1 })),
        });
      }

      // Replace checkout fields.
      await tx.productCheckoutField.deleteMany({ where: { productId: id } });
      if (data.checkoutFields.length > 0) {
        await tx.productCheckoutField.createMany({
          data: data.checkoutFields.map((f, i) => ({
            ...f,
            options: f.options
              ? JSON.stringify(f.options.split("\n").map((o) => o.trim()).filter(Boolean))
              : null,
            productId: id,
            sortOrder: i + 1,
          })),
        });
      }

      // Replace media (simple single-image model from the form).
      await tx.productMedia.deleteMany({ where: { productId: id } });
      if (data.mediaUrl) {
        await tx.productMedia.create({ data: { productId: id, url: data.mediaUrl, type: "IMAGE", sortOrder: 1 } });
      }
    });
  } catch {
    return { status: "error", message: "خطا در به‌روزرسانی محصول؛ اسلاگ ممکن است تکراری باشد." };
  }

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function toggleProductActiveAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function toggleProductFeaturedAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { isFeatured: !product.isFeatured } });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function toggleProductBestSellingAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { isBestSelling: !product.isBestSelling } });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

/* Helpers ----------------------------------------------------------------- */

function buildProductInput(formData: FormData) {
  const attributes: Array<{ key: string; label: string; value: string }> = [];
  const keys = formData.getAll("attr_key");
  const labels = formData.getAll("attr_label");
  const values = formData.getAll("attr_value");
  keys.forEach((_, i) => {
    const key = String(keys[i] ?? "").trim();
    const label = String(labels[i] ?? "").trim();
    const value = String(values[i] ?? "").trim();
    if (key && label && value) attributes.push({ key, label, value });
  });

  const checkoutFields: Array<{
    label: string;
    fieldKey: string;
    fieldType: string;
    required: boolean;
    placeholder: string;
    helpText: string;
    options: string;
  }> = [];
  const fieldLabels = formData.getAll("field_label");
  const fieldKeys = formData.getAll("field_key");
  const fieldTypes = formData.getAll("field_type");
  const fieldRequired = formData.getAll("field_required");
  const fieldPlaceholders = formData.getAll("field_placeholder");
  const fieldHelpTexts = formData.getAll("field_help");
  const fieldOptions = formData.getAll("field_options");
  fieldLabels.forEach((_, i) => {
    const label = String(fieldLabels[i] ?? "").trim();
    const fieldKey = String(fieldKeys[i] ?? "").trim();
    if (!label || !fieldKey) return;
    checkoutFields.push({
      label,
      fieldKey,
      fieldType: String(fieldTypes[i] ?? "TEXT"),
      required: String(fieldRequired[i] ?? "") === "on",
      placeholder: String(fieldPlaceholders[i] ?? ""),
      helpText: String(fieldHelpTexts[i] ?? ""),
      options: String(fieldOptions[i] ?? ""),
    });
  });

  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    fullDescription: String(formData.get("fullDescription") ?? ""),
    price: formData.get("price") ?? 0,
    compareAtPrice: String(formData.get("compareAtPrice") ?? ""),
    type: String(formData.get("type") ?? "CP"),
    categoryId: String(formData.get("categoryId") ?? ""),
    isActive: String(formData.get("isActive") ?? "on") === "on",
    isFeatured: String(formData.get("isFeatured") ?? "") === "on",
    isBestSelling: String(formData.get("isBestSelling") ?? "") === "on",
    inventoryMode: String(formData.get("inventoryMode") ?? "UNLIMITED"),
    inStock: String(formData.get("inStock") ?? "on") === "on",
    quantity: String(formData.get("quantity") ?? ""),
    cancellationPolicy: String(formData.get("cancellationPolicy") ?? ""),
    attributes,
    checkoutFields,
    mediaUrl: String(formData.get("mediaUrl") ?? ""),
  };
}