import { prisma } from "./prisma";

/**
 * Customer dashboard data access. All queries are scoped to the signed-in user.
 */

export type CustomerOrderSummary = {
  id: string;
  trackingCode: string;
  status: string;
  total: number;
  createdAt: Date;
  itemCount: number;
  latestReceiptStatus: string | null;
};

export async function getCustomerOrders(
  userId: string,
): Promise<CustomerOrderSummary[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { items: true } },
      receipts: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  return orders.map((o) => ({
    id: o.id,
    trackingCode: o.trackingCode,
    status: o.status,
    total: o.total,
    createdAt: o.createdAt,
    itemCount: o._count.items,
    latestReceiptStatus: o.receipts[0]?.status ?? null,
  }));
}

export type CustomerOrderDetail = {
  id: string;
  trackingCode: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productId: string | null;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    fieldResponses: string | null;
  }>;
  statusHistory: Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
    createdAt: Date;
  }>;
  receipts: Array<{
    id: string;
    imagePath: string;
    status: string;
    rejectionReason: string | null;
    createdAt: Date;
  }>;
  reviews: Array<{
    id: string;
    productId: string | null;
    rating: number;
    comment: string;
    isApproved: boolean;
    createdAt: Date;
  }>;
};

export async function getCustomerOrderById(
  userId: string,
  orderId: string,
): Promise<CustomerOrderDetail | null> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: { orderBy: { id: "asc" } },
        statusHistory: { orderBy: { createdAt: "asc" } },
        receipts: { orderBy: { createdAt: "desc" } },
        reviews: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!order) return null;
    return {
      id: order.id,
      trackingCode: order.trackingCode,
      status: order.status,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.productName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
        fieldResponses: i.fieldResponses,
      })),
      statusHistory: order.statusHistory.map((h) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        note: h.note,
        createdAt: h.createdAt,
      })),
      receipts: order.receipts.map((r) => ({
        id: r.id,
        imagePath: r.imagePath,
        status: r.status,
        rejectionReason: r.rejectionReason,
        createdAt: r.createdAt,
      })),
      reviews: order.reviews.map((r) => ({
        id: r.id,
        productId: r.productId,
        rating: r.rating,
        comment: r.comment,
        isApproved: r.isApproved,
        createdAt: r.createdAt,
      })),
    };
  } catch {
    return null;
  }
}
