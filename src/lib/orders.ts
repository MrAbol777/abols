import crypto from "node:crypto";
import { prisma } from "./prisma";

/**
 * Server-side order queries for the public tracking page and checkout flow.
 */

export type OrderTrackingView = {
  id: string;
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  supportContact: string | null;
  status: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  createdAt: Date;
  items: Array<{
    id: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  receipts: Array<{
    id: string;
    imagePath: string;
    status: string;
    rejectionReason: string | null;
    createdAt: Date;
  }>;
  statusHistory: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
    createdAt: Date;
  }>;
};

export async function getOrderByTrackingCode(
  trackingCode: string,
): Promise<OrderTrackingView | null> {
  const code = trackingCode.trim();
  if (!code) return null;
  try {
    const order = await prisma.order.findUnique({
      where: { trackingCode: code },
      include: {
        items: { orderBy: { id: "asc" } },
        receipts: { orderBy: { createdAt: "desc" } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!order) return null;
    return {
      id: order.id,
      trackingCode: order.trackingCode,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      supportContact: order.supportContact,
      status: order.status,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      total: order.total,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        id: i.id,
        productName: i.productName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
      })),
      receipts: order.receipts.map((r) => ({
        id: r.id,
        imagePath: r.imagePath,
        status: r.status,
        rejectionReason: r.rejectionReason,
        createdAt: r.createdAt,
      })),
      statusHistory: order.statusHistory.map((h) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        note: h.note,
        createdAt: h.createdAt,
      })),
    };
  } catch {
    return null;
  }
}

/** Generate a unique-ish public tracking code. Format: AB-XXXXXX. */
export function generateTrackingCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[crypto.randomInt(alphabet.length)];
  }
  return `AB-${code}`;
}

/* Admin ------------------------------------------------------------------- */

export type AdminOrderListItem = {
  id: string;
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  status: string;
  total: number;
  createdAt: Date;
  itemCount: number;
  receiptStatus: string | null; // latest receipt: PENDING / APPROVED / REJECTED / null
};

/** Orders for the admin list, newest first, optionally filtered by status. */
export async function getAdminOrders(opts: {
  status?: string | null;
  query?: string | null;
}): Promise<AdminOrderListItem[]> {
  const where: Record<string, unknown> = {};
  if (opts.status && opts.status !== "ALL") where.status = opts.status;
  if (opts.query?.trim()) {
    const q = opts.query.trim();
    where.OR = [
      { trackingCode: { contains: q } },
      { customerPhone: { contains: q } },
      { customerName: { contains: q } },
    ];
  }
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
      receipts: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  return orders.map((o) => ({
    id: o.id,
    trackingCode: o.trackingCode,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    status: o.status,
    total: o.total,
    createdAt: o.createdAt,
    itemCount: o._count.items,
    receiptStatus: o.receipts[0]?.status ?? null,
  }));
}

export type AdminOrderDetail = {
  id: string;
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  supportContact: string | null;
  customerNote: string | null;
  adminNote: string | null;
  status: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    fieldResponses: string | null;
    cancellationPolicy: string | null;
  }>;
  receipts: Array<{
    id: string;
    imagePath: string;
    status: string;
    rejectionReason: string | null;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    createdAt: Date;
  }>;
  statusHistory: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
    actor: string | null;
    createdAt: Date;
  }>;
};

export async function getAdminOrderById(id: string): Promise<AdminOrderDetail | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { orderBy: { id: "asc" }, include: { product: { select: { cancellationPolicy: true } } } },
        receipts: { orderBy: { createdAt: "desc" } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!order) return null;
    return {
      id: order.id,
      trackingCode: order.trackingCode,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      supportContact: order.supportContact,
      customerNote: order.customerNote,
      adminNote: order.adminNote,
      status: order.status,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((i) => ({
        id: i.id,
        productName: i.productName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
        fieldResponses: i.fieldResponses,
        cancellationPolicy: i.product?.cancellationPolicy ?? null,
      })),
      receipts: order.receipts.map((r) => ({
        id: r.id,
        imagePath: r.imagePath,
        status: r.status,
        rejectionReason: r.rejectionReason,
        reviewedBy: r.reviewedBy,
        reviewedAt: r.reviewedAt,
        createdAt: r.createdAt,
      })),
      statusHistory: order.statusHistory.map((h) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        note: h.note,
        actor: h.actor,
        createdAt: h.createdAt,
      })),
    };
  } catch {
    return null;
  }
}
