import { prisma } from "./prisma";

/**
 * Admin dashboard data access. Real metrics from SQLite — no invented numbers.
 */

export type AdminDashboardData = {
  productCount: number;
  userCount: number;
  orderCount: number;
  awaitingReviewOrders: number;
  newSupportMessages: number;
  pendingReviews: number;
  recentOrders: Array<{
    id: string;
    trackingCode: string;
    customerName: string;
    status: string;
    total: number;
    createdAt: Date;
  }>;
  recentSupportMessages: Array<{
    id: string;
    name: string;
    phone: string;
    status: string;
    createdAt: Date;
  }>;
};

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const [productCount, userCount, orderCount, awaitingReviewOrders, newSupportMessages, pendingReviews, recentOrders, recentSupportMessages] =
    await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "AWAITING_REVIEW" } }),
      prisma.supportMessage.count({ where: { status: "NEW" } }),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          trackingCode: true,
          customerName: true,
          status: true,
          total: true,
          createdAt: true,
        },
      }),
      prisma.supportMessage.findMany({
        take: 4,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, phone: true, status: true, createdAt: true },
      }),
    ]);

  return {
    productCount,
    userCount,
    orderCount,
    awaitingReviewOrders,
    newSupportMessages,
    pendingReviews,
    recentOrders,
    recentSupportMessages,
  };
}

/* Users ------------------------------------------------------------------- */

export type AdminUserItem = {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  isActive: boolean;
  isPhoneVerified: boolean;
  createdAt: Date;
  orderCount: number;
  totalSpent: number;
};

/** Customer (non-admin) users with order aggregates, newest first. */
export async function getAdminUsers(): Promise<AdminUserItem[]> {
  const users = await prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
      orders: { select: { total: true, status: true } },
    },
  });
  return users.map((u) => ({
    id: u.id,
    phone: u.phone,
    name: u.name,
    role: u.role,
    isActive: u.isActive,
    isPhoneVerified: u.isPhoneVerified,
    createdAt: u.createdAt,
    orderCount: u._count.orders,
    totalSpent: u.orders
      .filter((o) => o.status === "COMPLETED" || o.status === "PROCESSING")
      .reduce((sum, o) => sum + o.total, 0),
  }));
}
