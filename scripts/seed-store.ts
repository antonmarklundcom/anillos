import "../src/lib/load-env";
import { eq } from "drizzle-orm";
import { closePool, getDb } from "../src/db";
import { categories, products, variants } from "../src/db/schema";
import {
  COLLECTIONS,
  CONCEPTS,
  CONCEPT_NOTICE,
} from "../src/config/ring-store";
import { safeError } from "../src/lib/safe-error";

async function main() {
  const withConcepts = process.argv.includes("--with-concepts");
  const target = new URL(process.env.DATABASE_URL ?? "");
  if (
    withConcepts &&
    (!/test/i.test(target.pathname) ||
      !["127.0.0.1", "localhost"].includes(target.hostname))
  )
    throw new Error(
      "Concept fixtures require a disposable loopback database containing test in its name."
    );
  const db = getDb();
  await db.transaction(async (tx) => {
    for (const [position, collection] of COLLECTIONS.entries()) {
      const existing = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, collection.slug));
      if (!existing.length)
        await tx.insert(categories).values({
          slug: collection.slug,
          name: collection.name,
          position,
          description: collection.description,
        });
    }
    if (!withConcepts) return;
    for (const concept of CONCEPTS) {
      const existing = await tx
        .select({ id: products.id })
        .from(products)
        .where(eq(products.slug, concept.slug));
      if (existing.length) continue; // Never overwrite any owner work or stock.
      const [category] = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, concept.category));
      if (!category)
        throw new Error("Collection missing while preparing concept fixtures");
      const [result] = await tx.insert(products).values({
        slug: concept.slug,
        name: concept.name,
        categoryId: category.id,
        saleMode: "enquiry",
        showPrice: false,
        description: `${CONCEPT_NOTICE}\n\n${concept.description}`,
        publishedAt: new Date(),
        isFeatured: true,
      });
      const labels = concept.category.startsWith("alianzas-")
        ? [
            "A: 17 mm · B: 18 mm · 2 anillos",
            "A: 17 mm · B: 19 mm · 2 anillos",
            "A: 18 mm · B: 19 mm · 2 anillos",
          ]
        : [
            "Interior: 16 mm · 1 anillo",
            "Interior: 17 mm · 1 anillo",
            "Interior: 18 mm · 1 anillo",
            "Interior: 19 mm · 1 anillo",
          ];
      await tx.insert(variants).values(
        labels.map((label, position) => ({
          productId: result.insertId,
          sku: `CONCEPT-${result.insertId}-${position}`,
          label,
          pricePyg: 0,
          onHand: 0,
          position,
        }))
      );
    }
  });
  console.log(
    withConcepts
      ? "Collections and unpurchasable concept fixtures ready; existing data preserved."
      : "Collections ready. No products, stock, prices, delivery zones or provider settings invented."
  );
  await closePool();
}
main().catch(async (error) => {
  console.error(safeError(error).message);
  await closePool();
  process.exitCode = 1;
});
