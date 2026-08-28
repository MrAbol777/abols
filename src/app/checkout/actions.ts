"use server";

import { prisma } from "@/lib/prisma";
import { checkoutCustomerSchema, checkoutItemSchema } from "@/lib/schemas";
import { generateTrackingCode } from "@/lib/orders";
import { getCurrentCustomer } from "@/lib/auth/customer";
import { resolveDiscount } from "@/lib/pricing";

export type CheckoutProductInfo = {
  id: string;
  name: string;
  slug: string;
  price: number;
  type: string;
  inventoryMode: string;
  inStock: boolean;
  quantity: number | null;
  checkoutFields: Array<{
    id: string;
    label: string;
    fieldKey: string;
    fieldType: string;
    required: boolean;
    placeholder: string | null;
    helpText: string | null;
    options: string[];
  }>;
};

export type CheckoutState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  trackingCode?: string;
};

/**
 * Fetch fresh product info for checkout (prices, names, per-product custom
 * fields). The client uses this ONLY for display and field rendering — prices
 * are never trusted from the browser.
 */
export async function getCheckoutProducts(
  productIds: string[],
): Promise<CheckoutProductInfo[]> {
  const uniqueIds = [...new Set(productIds)];
  if (uniqueIds.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: uniqueIds }, isActive: true },
    include: { checkoutFields: { orderBy: { sortOrder: "asc" } } },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    type: p.type,
    inventoryMode: p.inventoryMode,
    inStock: p.inStock,
    quantity: p.quantity,
    checkoutFields: p.checkoutFields.map((f) => ({
      id: f.id,
      label: f.label,
      fieldKey: f.fieldKey,
      fieldType: f.fieldType,
      required: f.required,
      placeholder: f.placeholder,
      helpText: f.helpText,
      options: parseOptions(f.options),
    })),
  }));
}

function parseOptions(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === "string");
    return [];
  } catch {
    return [];
  }
}

/**
 * Place an order. EVERY price is recomputed server-side from the database —
 * the browser can never influence the total. Creates the order, immutable item
 * snapshots, initial status history, and decrements exact-quantity inventory.
 */
export async function placeOrder(prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const customer = checkoutCustomerSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    supportContact: String(formData.get("supportContact") ?? ""),
    note: String(formData.get("note") ?? ""),
  });

  if (!customer.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of customer.error.issues) {
      const field = String(issue.path[0] ?? "");
      if (field) fieldErrors[field] = fieldErrors[field] ?? issue.message;
    }
    return { status: "error", message: "لطفاً اطلاعات تماس را به‌درستی وارد کنید.", fieldErrors };
  }

  // Parse cart lines from a JSON payload (productId + quantity only).
  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { status: "error", message: "سبد خرید نامعتبر است. دوباره تلاش کنید." };
  }

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { status: "error", message: "سبد خرید شما خالی است." };
  }

  const parsedItems = rawItems.map((raw) => {
    const obj = raw as { productId?: unknown; quantity?: unknown; fieldResponses?: unknown };
    return checkoutItemSchema.safeParse({
      productId: obj?.productId,
      quantity: typeof obj?.quantity === "number" ? obj.quantity : Number(obj?.quantity),
      fieldResponses: obj?.fieldResponses,
    });
  });

  const invalid = parsedItems.find((r) => !r.success);
  if (invalid) {
    return { status: "error", message: "اقلام سبد خرید نامعتبر است. دوباره تلاش کنید." };
  }

  const items = parsedItems.map((r) => r.data!);
  const productIds = [...new Set(items.map((i) => i.productId))];

  try {
    // Fresh product data — the single source of truth for prices & stock.
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { checkoutFields: { orderBy: { sortOrder: "asc" } } },
    });

    if (products.length !== productIds.length) {
      return { status: "error", message: "برخی از محصولات موجود نیستند. سبد را بررسی کنید." };
    }

    const productById = new Map(products.map((p) => [p.id, p]));

    // Validate per-product checkout field responses against their config.
    const fieldErrors: Record<string, string> = {};
    for (const item of items) {
      const product = productById.get(item.productId)!;
      const responses = item.fieldResponses ?? {};

      // Stock checks before anything else.
      if (product.inventoryMode === "EXACT_QUANTITY") {
        if ((product.quantity ?? 0) < item.quantity) {
          fieldErrors[`stock:${product.id}`] = `موجودی «${product.name}» کافی نیست.`;
          continue;
        }
      } else if (product.inventoryMode === "STATUS_ONLY" && !product.inStock) {
        fieldErrors[`stock:${product.id}`] = `محصول «${product.name}» در حال حاضر ناموجود است.`;
        continue;
      }

      for (const field of product.checkoutFields) {
        const value = responses[field.fieldKey]?.trim() ?? "";
        if (field.required && !value) {
          fieldErrors[`${product.id}:${field.fieldKey}`] = `«${field.label}» الزامی است.`;
          continue;
        }
        if (!value) continue;

        switch (field.fieldType) {
          case "SELECT": {
            const options = parseOptions(field.options);
            if (options.length > 0 && !options.includes(value)) {
              fieldErrors[`${product.id}:${field.fieldKey}`] = `گزینه‌ی «${field.label}» معتبر نیست.`;
            }
            break;
          }
          case "NUMBER":
            if (!/^\d+(\.\d+)?$/.test(value)) {
              fieldErrors[`${product.id}:${field.fieldKey}`] = `«${field.label}» باید عدد باشد.`;
            }
            break;
          case "EMAIL":
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              fieldErrors[`${product.id}:${field.fieldKey}`] = `«${field.label}» باید ایمیل معتبر باشد.`;
            }
            break;
        }
      }
    }

    const stockErrors = Object.entries(fieldErrors).filter(([k]) => k.startsWith("stock:"));
    if (stockErrors.length > 0) {
      return { status: "error", message: stockErrors[0][1], fieldErrors };
    }

    const requiredFieldErrors = Object.entries(fieldErrors).filter(([k]) => !k.startsWith("stock:"));
    if (requiredFieldErrors.length > 0) {
      return {
        status: "error",
        message: "لطفاً فیلدهای تکمیلی محصولات را کامل کنید.",
        fieldErrors,
      };
    }

    // Server-side totals. NO client price is used anywhere below.
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = productById.get(item.productId)!;
      const unitPrice = product.price;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      return {
        productId: product.id,
        productName: product.name,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
        fieldResponses: JSON.stringify(item.fieldResponses ?? {}),
      };
    });

    // Optional discount code — validated AND applied server-side using the
    // pure resolver (see src/lib/pricing.ts).
    const rawCode = String(formData.get("discountCode") ?? "").trim().toUpperCase();
    let discount: { ok: true; id: string; discountAmount: number } | null = null;
    if (rawCode) {
      const found = await prisma.discount.findUnique({ where: { code: rawCode } });
      const resolved = resolveDiscount(
        found
          ? {
              id: found.id,
              type: found.type as "PERCENTAGE" | "FIXED",
              value: found.value,
              usageCount: found.usageCount,
              usageLimit: found.usageLimit,
              minOrderAmount: found.minOrderAmount,
              startsAt: found.startsAt,
              endsAt: found.endsAt,
            }
          : null,
        subtotal,
      );
      if (!resolved.ok) {
        return { status: "error", message: resolved.error, fieldErrors: { discountCode: resolved.error } };
      }
      discount = resolved;
    }
    const discountAmount = discount?.discountAmount ?? 0;
    const total = subtotal - discountAmount;

    const trackingCode = await createUniqueTrackingCode();

    // Attach the order to the signed-in customer when there is one (guest
    // otherwise). userId is the ONLY customer identifier used here.
    const signedInCustomer = await getCurrentCustomer();
    const userId = signedInCustomer?.id ?? null;

    // Wrap order creation + inventory decrement in one transaction.
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          trackingCode,
          userId,
          customerName: customer.data.name,
          customerPhone: customer.data.phone,
          supportContact: customer.data.supportContact || null,
          customerNote: customer.data.note || null,
          status: "AWAITING_PAYMENT",
          subtotal,
          discountAmount,
          discountId: discount?.id ?? null,
          total,
          items: { create: orderItems },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: null,
          toStatus: "AWAITING_PAYMENT",
          actor: "system",
          note: "سفارش ثبت شد؛ در انتظار پرداخت.",
        },
      });

      // Decrement exact-quantity inventory.
      for (const item of items) {
        const product = productById.get(item.productId)!;
        if (product.inventoryMode === "EXACT_QUANTITY") {
          await tx.product.update({
            where: { id: product.id },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }

      // Record discount usage. The limit was checked above (resolveDiscount);
      // this increment is best-effort bookkeeping within the same transaction.
      if (discount?.id) {
        await tx.discount.update({
          where: { id: discount.id },
          data: { usageCount: { increment: 1 } },
        });
      }
    });

    return {
      status: "success",
      message: "سفارش شما با موفقیت ثبت شد.",
      trackingCode,
    };
  } catch {
    return {
      status: "error",
      message: "خطایی در ثبت سفارش رخ داد. لطفاً دوباره تلاش کنید.",
    };
  }
}

async function createUniqueTrackingCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateTrackingCode();
    const existing = await prisma.order.findUnique({ where: { trackingCode: code } });
    if (!existing) return code;
  }
  return `AB-${Date.now().toString(36).toUpperCase()}`;
}
