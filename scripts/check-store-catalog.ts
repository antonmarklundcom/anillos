import "../src/lib/load-env";
import { closePool } from "../src/db";
import {
  getCategories,
  getCategoryProducts,
  searchProducts,
} from "../src/db/queries";
import { COLLECTIONS } from "../src/config/ring-store";
import { safeError } from "../src/lib/safe-error";

/** Read-only diagnosis. A SELECT 1 health check cannot validate the catalog schema. */
async function main() {
  const checks = await Promise.allSettled([
    getCategories(),
    getCategoryProducts({ categorySlug: "acero" }),
    searchProducts("anillo"),
  ]);
  const labels = ["categories", "category products", "search / FULLTEXT"];
  for (const [index, result] of checks.entries()) {
    if (result.status === "rejected") {
      console.error(`${labels[index]}: ${safeError(result.reason).message}`);
      process.exitCode = 1;
    } else console.log(`${labels[index]}: OK`);
  }
  const categoryCheck = checks[0];
  if (categoryCheck?.status === "fulfilled") {
    const active = new Set(categoryCheck.value.map((item) => item.slug));
    const missing = COLLECTIONS.filter((item) => !active.has(item.slug)).map(
      (item) => item.slug
    );
    if (missing.length) {
      console.log(`Collections absent or inactive: ${missing.join(", ")}.`);
      console.log(
        "Check disabled categories in admin. For missing records only, run the insert-only scripts/seed-store.ts after migrations."
      );
    } else console.log("All five ring collections are active.");
  }
}

main()
  .catch((error) => {
    console.error(safeError(error).message);
    process.exitCode = 1;
  })
  .finally(closePool);
