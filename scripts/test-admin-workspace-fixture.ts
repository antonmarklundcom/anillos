import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Deliberately do not load .env.local: this fixture requires an explicit target.
async function main() {
  const raw = process.env.TEST_DATABASE_URL;
  if (process.env.STORE_ADMIN_E2E !== "1" || !raw)
    throw new Error("Set STORE_ADMIN_E2E=1 and an explicit TEST_DATABASE_URL.");
  const target = new URL(raw);
  if (
    target.protocol !== "mysql:" ||
    !["127.0.0.1", "localhost"].includes(target.hostname) ||
    target.pathname !== "/anillos_admin_workspace_test" ||
    process.env.DATABASE_URL !== raw
  )
    throw new Error(
      "Fixture requires matching loopback DATABASE_URL/TEST_DATABASE_URL for anillos_admin_workspace_test."
    );

  // No provider requests or inherited credentials are needed for this fixture.
  const { CAMPOS } = await import("../src/lib/integraciones");
  for (const fields of Object.values(CAMPOS))
    for (const field of fields) process.env[field.env] = "";
  const { getDb, closePool } = await import("../src/db");
  const schema = await import("../src/db/schema");
  const { createUser } = await import("../src/lib/auth");
  const { createOrder } = await import("../src/domain/create-order");
  const { sql } = await import("drizzle-orm");
  const db = getDb();
  try {
    for (const table of [
      schema.users,
      schema.products,
      schema.orders,
      schema.integrationSettings,
    ]) {
      const [row] = await db
        .select({ count: sql<number>`count(*)` })
        .from(table);
      if (Number(row?.count) !== 0)
        throw new Error(
          "Fixture needs a freshly migrated empty isolated database; no existing data is reset."
        );
    }
    const accounts: Record<string, number> = {};
    for (const role of ["owner", "staff", "vendedor"] as const) {
      const actor = await createUser(
        {
          email: `${role}@admin.example.test`,
          password: "Admin-workspace-synthetic-2026!",
          name: `Synthetic ${role}`,
          role,
        },
        db
      );
      accounts[role] = actor.id;
    }
    const [category] = await db.insert(schema.categories).values({
      slug: "admin-workspace-fixtures",
      name: "Synthetic admin fixtures",
    });
    const [product] = await db.insert(schema.products).values({
      slug: "admin-workspace-fixture",
      name: "Synthetic admin product",
      description: "Isolated browser fixture. No real supplier specifications.",
      categoryId: Number(category.insertId),
      ivaRate: 10,
      publishedAt: new Date(),
    });
    const [variant] = await db.insert(schema.variants).values({
      productId: Number(product.insertId),
      sku: "ADMIN-WORKSPACE-TEST",
      label: "Synthetic 17 mm",
      pricePyg: 100000,
      onHand: 10,
    });
    await db.insert(schema.shippingZones).values({
      slug: "admin-workspace-zone",
      name: "Synthetic Asunción zone",
      cities: ["Asunción"],
      pricePyg: 10000,
    });
    await db.insert(schema.bankDetails).values({
      id: 1,
      banco: "Synthetic test bank",
      titular: "Synthetic test owner",
      ruc: "80000000-0",
      cuenta: "TEST-ONLY-000",
      tipoCuenta: "corriente",
    });
    await db
      .insert(schema.counters)
      .values({ name: "order_number", value: 0 })
      .onDuplicateKeyUpdate({ set: { value: 0 } });
    const order = await createOrder({
      items: [{ variantId: Number(variant.insertId), qty: 2 }],
      customerName: "Synthetic browser buyer",
      customerPhone: "0981000000",
      customerEmail: "buyer@admin.example.test",
      docType: "NINGUNO",
      isConsumidorFinal: true,
      shipCity: "Asunción",
      shipAddress: "Synthetic test address",
      paymentMethod: "transferencia",
    });
    const manifest = {
      accounts,
      productId: Number(product.insertId),
      orderId: order.orderId,
      orderNumber: order.orderNumber,
    };
    await mkdir(path.resolve("playwright/.cache"), { recursive: true });
    await writeFile(
      path.resolve("playwright/.cache/admin-workspace-fixture.json"),
      JSON.stringify(manifest, null, 2)
    );
    console.log(
      "Isolated admin workspace fixture prepared; IDs saved in playwright/.cache/admin-workspace-fixture.json."
    );
  } finally {
    await closePool();
  }
}
main().catch(() => {
  console.error(
    "Admin workspace fixture preparation failed. Check the explicit isolated target and empty migrated schema."
  );
  process.exitCode = 1;
});
