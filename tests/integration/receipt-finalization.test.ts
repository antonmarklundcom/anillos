import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { orderItems, orders, receipts, stockReservations } from "@/db/schema";
import { finalizeUploadedReceipt, countReceipts } from "@/domain/receipts";
import { reserveStock, getAvailability } from "@/domain/stock";
import { transitionOrder, StockUnavailableError } from "@/domain/orders";
import { closeTestDb, getTestDb, hasTestDb, resetTables } from "../helpers/db";
import { createOrder, createVariant, getStatus, getOnHand } from "../helpers/factories";

describe.skipIf(!hasTestDb)("atomic receipt finalization", () => {
  beforeEach(resetTables); afterAll(closeTestDb);
  async function fixture(expired = false) {
    const variantId = await createVariant({ onHand: 1 });
    const orderId = await createOrder();
    await getTestDb().insert(orderItems).values({ orderId, variantId, qty: 1,
      nameSnapshot: "Test", skuSnapshot: "TEST", unitPricePyg: 100000, lineTotalPyg: 100000, ivaRate: 10 });
    await reserveStock(orderId, [{ variantId, qty: 1 }], { expiresAt: new Date(Date.now() + (expired ? -60_000 : 60_000)) });
    return { orderId, variantId };
  }
  const upload = (orderId: number, label = "test") => finalizeUploadedReceipt({ orderId,
    cloudinaryId: `private/${label}`, mime: "image/jpeg", bytes: 100 });
  it("extends a near-expiry hold without decrementing stock, then payment consumes once", async () => {
    const { orderId, variantId } = await fixture();
    await upload(orderId);
    const [hold] = await getTestDb().select().from(stockReservations).where(eq(stockReservations.orderId, orderId));
    const [order] = await getTestDb().select().from(orders).where(eq(orders.id, orderId));
    expect(hold!.expiresAt.getTime()).toBeGreaterThan(Date.now() + 47 * 3600_000);
    expect(order!.reservedUntil!.getTime()).toBe(hold!.expiresAt.getTime());
    expect(await getAvailability(variantId)).toBe(0);
    expect(await getOnHand(variantId)).toBe(1);
    await transitionOrder(orderId, "pagado", "test");
    expect(await getOnHand(variantId)).toBe(0);
  });
  it("a second receipt cannot extend the first receipt's deadline", async () => {
    const { orderId } = await fixture(); await upload(orderId, "first");
    const [before] = await getTestDb().select().from(orders).where(eq(orders.id, orderId));
    await upload(orderId, "second");
    const [after] = await getTestDb().select().from(orders).where(eq(orders.id, orderId));
    expect(after!.reservedUntil!.getTime()).toBe(before!.reservedUntil!.getTime());
  });
  it("does not resurrect expired holds already claimed by another order", async () => {
    const { orderId, variantId } = await fixture(true);
    const rival = await createOrder();
    await reserveStock(rival, [{ variantId, qty: 1 }], { expiresAt: new Date(Date.now() + 3600_000) });
    await expect(upload(orderId)).rejects.toBeInstanceOf(StockUnavailableError);
    expect(await countReceipts(orderId)).toBe(0); expect(await getStatus(orderId)).toBe("pendiente_pago");
    expect(await getOnHand(variantId)).toBe(1);
  });
  it("serializes two uploads racing for the final quota slot", async () => {
    const { orderId } = await fixture(); await upload(orderId, "one"); await upload(orderId, "two");
    const outcomes = await Promise.allSettled([upload(orderId, "three"), upload(orderId, "four")]);
    expect(outcomes.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(await countReceipts(orderId)).toBe(3);
  });
  it("rejects an upload finalized after cancellation without inserting a pending receipt", async () => {
    const { orderId } = await fixture(); await transitionOrder(orderId, "cancelado", "test");
    await expect(upload(orderId)).rejects.toThrow(); expect(await countReceipts(orderId)).toBe(0);
  });
  it("does not renew a rejected receipt after the bounded review window", async () => {
    const { orderId } = await fixture(); await upload(orderId);
    await transitionOrder(orderId, "rechazado", "test");
    await getTestDb().update(receipts).set({ uploadedAt: new Date(Date.now() - 49 * 3600_000) }).where(eq(receipts.orderId, orderId));
    await expect(upload(orderId, "late")).rejects.toThrow(); expect(await countReceipts(orderId)).toBe(1);
  });
});
