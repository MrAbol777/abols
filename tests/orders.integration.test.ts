import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  getOrderByTrackingCode,
  getAdminOrderById,
  getAdminOrders,
  generateTrackingCode,
} from "@/lib/orders";

/**
 * DB-backed integration tests. These run against the local SQLite file
 * (./dev.db, git-ignored) and are careful to clean up every row they create.
 * They verify the real query layer, not mocks.
 */

describe("order queries (real DB)", () => {
  let product: { id: string; name: string; price: number };
  let trackingCode: string;
  let orderId: string;

  beforeAll(async () => {
    const found = await prisma.product.findUnique({ where: { slug: "cp-420" } });
    if (!found) throw new Error("seed data missing: run npm run db:seed");
    product = { id: found.id, name: found.name, price: found.price };
  });

  afterAll(async () => {
    if (orderId) {
      await prisma.order.deleteMany({ where: { id: orderId } });
    }
  });

  it("creates an order and looks it up by tracking code with items+history", async () => {
    trackingCode = generateTrackingCode();
    const order = await prisma.order.create({
      data: {
        trackingCode,
        customerName: "تست یکپارچه",
        customerPhone: "09120001111",
        status: "AWAITING_PAYMENT",
        subtotal: product.price,
        discountAmount: 0,
        total: product.price,
        items: {
          create: [{ productId: product.id, productName: product.name, unitPrice: product.price, quantity: 1, lineTotal: product.price }],
        },
      },
    });
    orderId = order.id;
    await prisma.orderStatusHistory.create({
      data: { orderId: order.id, fromStatus: null, toStatus: "AWAITING_PAYMENT", actor: "system" },
    });

    const tracked = await getOrderByTrackingCode(trackingCode);
    expect(tracked).not.toBeNull();
    expect(tracked?.items[0].productName).toBe(product.name);
    expect(tracked?.statusHistory.length).toBeGreaterThanOrEqual(1);
    expect(tracked?.total).toBe(product.price);
  });

  it("returns null for an unknown tracking code", async () => {
    const res = await getOrderByTrackingCode("AB-UNKNOW");
    expect(res).toBeNull();
  });

  it("lists orders in the admin list and reads detail by id", async () => {
    const list = await getAdminOrders({});
    const inList = list.find((o) => o.id === orderId);
    expect(inList).toBeTruthy();

    const detail = await getAdminOrderById(orderId);
    expect(detail?.trackingCode).toBe(trackingCode);
    expect(detail?.receipts).toEqual([]);
  });

  it("indexes by status filter", async () => {
    const pending = await getAdminOrders({ status: "AWAITING_PAYMENT" });
    expect(pending.some((o) => o.id === orderId)).toBe(true);
    const completed = await getAdminOrders({ status: "COMPLETED" });
    expect(completed.some((o) => o.id === orderId)).toBe(false);
  });
});