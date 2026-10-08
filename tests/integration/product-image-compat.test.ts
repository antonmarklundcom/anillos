import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/admin-guard", () => ({
  requireStaffSession: vi.fn(async () => ({ userId: 1, role: "owner" })),
  adminActionError: vi.fn(() => ({
    ok: false,
    error: "Unexpected image error",
  })),
}));
import { getPool } from "@/db";
import { readProductImages } from "@/db/product-image-compat";
import {
  addProductImage,
  updateProductImageDetails,
} from "@/domain/admin-products";
import {
  readPublicCampaign,
  readSalesWorkspace,
} from "@/domain/sales-workspace-store";
import {
  saveProductImageFocalPoint,
  moveProductImage,
} from "@/app/actions/admin-image-focal";
import { createProduct, createVariant } from "../helpers/factories";
import { getCatalog, getProductBySlug, getFeedProducts } from "@/db/queries";
import { eq } from "drizzle-orm";
import { products } from "@/db/schema";
import { migrationStatus } from "@/db/migration-status";
import { backupTablesForMigration } from "@/domain/backup-format";
import { dumpDatabase } from "@/domain/backup";
import { gunzipSync } from "node:zlib";
import {
  closeTestDb,
  getTestDb,
  hasTestDb,
  resetTables,
  TEST_DATABASE_URL,
} from "../helpers/db";

describe.skipIf(!hasTestDb)("pre-0025 catalogue compatibility", () => {
  beforeEach(resetTables);
  afterAll(closeTestDb);
  it("keeps image reads and ordinary CRUD available while new features require migration", async () => {
    const target = new URL(TEST_DATABASE_URL!);
    if (
      !["127.0.0.1", "localhost", "[::1]"].includes(target.hostname) ||
      !/test/i.test(target.pathname)
    )
      throw new Error(
        "Compatibility DDL requires a disposable loopback test database"
      );
    const productId = await createProduct();
    await createVariant({ productId, onHand: 1, pricePyg: 100000 });
    const [product] = await getTestDb()
      .select({ slug: products.slug })
      .from(products)
      .where(eq(products.id, productId));
    await addProductImage({
      productId,
      cloudinaryId: "compat/original",
      alt: "Original",
    });
    const connection = await getPool().getConnection();
    let legacyColumns = false;
    let legacyTables = false;
    const [applied] = await connection.query(
      "SELECT id,hash,created_at FROM __drizzle_migrations ORDER BY id DESC LIMIT 1"
    );
    const migration = (
      applied as { id: number; hash: string; created_at: number | string }[]
    )[0]!;
    let legacyMigration = false;
    try {
      await connection.query("SET SESSION lock_wait_timeout = 5");
      await connection.query(
        "ALTER TABLE product_images DROP COLUMN focal_point_x, DROP COLUMN focal_point_y"
      );
      legacyColumns = true;
      await connection.query(
        "RENAME TABLE sales_workspace TO sales_workspace_pre0025_test, sales_workspace_audit TO sales_workspace_audit_pre0025_test, sales_search_gaps TO sales_search_gaps_pre0025_test"
      );
      legacyTables = true;
      await connection.query("DELETE FROM __drizzle_migrations WHERE id = ?", [
        migration.id,
      ]);
      legacyMigration = true;
      const status = await migrationStatus();
      expect(status).toMatchObject({ compatible: true, current: false });
      expect(status.pending).toHaveLength(1);
      const [legacyApplied] = await connection.query(
        "SELECT hash FROM __drizzle_migrations ORDER BY id DESC LIMIT 1"
      );
      const { migrationVersions } = await import("@/domain/backup-format");
      const legacyVersion = migrationVersions().find(
        (v) => v.hash === (legacyApplied as { hash: string }[])[0]?.hash
      )!;
      expect(backupTablesForMigration(legacyVersion.tag)).not.toContain(
        "sales_workspace"
      );
      const dump = dumpDatabase();
      const chunks: Buffer[] = [];
      for await (const chunk of dump.stream) chunks.push(Buffer.from(chunk));
      const backupLines = gunzipSync(Buffer.concat(chunks))
        .toString("utf8")
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line));
      expect(backupLines[0]).toMatchObject({
        type: "manifest",
        migration: { tag: legacyVersion.tag },
      });
      expect(backupLines[0].tables).not.toContain("sales_workspace");
      expect(backupLines.at(-1)).toMatchObject({ type: "end" });
      expect((await dump.stats).rows).toBeGreaterThan(0);
      expect((await getCatalog())[0]?.image).toMatchObject({
        focalPointX: null,
        focalPointY: null,
      });
      expect((await getProductBySlug(product!.slug))?.images[0]).toMatchObject({
        focalPointX: null,
        focalPointY: null,
      });
      expect((await getFeedProducts())[0]?.images[0]).toMatchObject({
        focalPointX: null,
        focalPointY: null,
      });
      const original = (await readProductImages(getTestDb(), [productId]))[0];
      if (!original) throw new Error("Original image missing");
      expect(original).toMatchObject({
        alt: "Original",
        focalPointX: null,
        focalPointY: null,
      });
      await addProductImage({
        productId,
        cloudinaryId: "compat/new",
        alt: "Owner's new photo",
        provenance: "owned-photo",
        verified: true,
      });
      await updateProductImageDetails({
        productId,
        imageId: original.id,
        alt: "Edited before migration",
        provenance: "owned-photo",
        verified: true,
      });
      const images = await readProductImages(getTestDb(), [productId]);
      expect(images).toHaveLength(2);
      expect(images[0]).toMatchObject({
        alt: "Edited before migration",
        provenance: "owned-photo",
      });
      expect(images[1]?.verifiedAt).toBeInstanceOf(Date);
      expect(images[1]?.alt).toBe("Owner's new photo");
      expect(
        await moveProductImage({
          productId,
          imageId: original.id,
          direction: "next",
        })
      ).toMatchObject({ ok: true });
      expect(
        await saveProductImageFocalPoint({
          productId,
          imageId: original.id,
          focalPointX: 20,
          focalPointY: 70,
        })
      ).toMatchObject({ ok: false, error: expect.stringContaining("0025") });
      expect((await readSalesWorkspace()).migrationRequired).toBe(true);
      expect(await readPublicCampaign("legacy-campaign")).toBeNull();
    } finally {
      try {
        if (legacyTables)
          await connection.query(
            "RENAME TABLE sales_workspace_pre0025_test TO sales_workspace, sales_workspace_audit_pre0025_test TO sales_workspace_audit, sales_search_gaps_pre0025_test TO sales_search_gaps"
          );
      } finally {
        try {
          if (legacyColumns)
            await connection.query(
              "ALTER TABLE product_images ADD COLUMN focal_point_x int, ADD COLUMN focal_point_y int"
            );
        } finally {
          try {
            if (legacyMigration)
              await connection.query(
                "INSERT INTO __drizzle_migrations(id,hash,created_at) VALUES (?,?,?)",
                [migration.id, migration.hash, migration.created_at]
              );
          } finally {
            try {
              await connection.query("SET SESSION lock_wait_timeout = DEFAULT");
            } finally {
              connection.release();
            }
          }
        }
      }
    }
    const image = (await readProductImages(getTestDb(), [productId]))[0];
    if (!image) throw new Error("Restored image missing");
    expect(
      await saveProductImageFocalPoint({
        productId,
        imageId: image.id,
        focalPointX: 25,
        focalPointY: 75,
      })
    ).toMatchObject({ ok: true });
    expect(
      (await readProductImages(getTestDb(), [productId]))[0]
    ).toMatchObject({ focalPointX: 25, focalPointY: 75 });
    expect((await migrationStatus()).current).toBe(true);
  });
});
