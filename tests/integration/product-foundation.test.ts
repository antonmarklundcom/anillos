import { eq } from "drizzle-orm";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  categories,
  products,
  productSlugRedirects,
  variants,
} from "@/db/schema";
import {
  createProduct,
  updateProduct,
  saveVariant,
  getAdminProduct,
  type ProductWrite,
} from "@/domain/admin-products";
import {
  createCategory as createManagedCategory,
  updateCategory,
} from "@/domain/admin-categories";
import { getProductSlugRedirect } from "@/domain/product-slugs";
import { duplicateProduct } from "@/domain/admin-bulk";
import { dumpDatabase, dumpRows } from "@/domain/backup";
import { restoreBackup } from "@/domain/restore-backup";
import {
  upsertCatalogProducts,
  type CatalogProductUpsert,
} from "../../scripts/seed";
import { closeTestDb, getTestDb, hasTestDb, resetTables } from "../helpers/db";
import { createCategory, createVariant } from "../helpers/factories";

const verifiedAt = "2026-01-01T12:00:00.000Z";
describe.skipIf(!hasTestDb)("supplier-ready catalogue foundation", () => {
  beforeEach(resetTables);
  afterAll(closeTestDb);
  const write = (
    categoryId: number,
    slug = "verified-piece"
  ): ProductWrite => ({
    slug,
    name: "Pieza verificada",
    description: "Ficha del modelo.",
    categoryId,
    brand: null,
    ivaRate: 10,
    isActive: true,
    published: true,
  });

  it("saves optional verified facts and SEO without modifying physical inventory", async () => {
    const categoryId = await createCategory();
    const input = {
      ...write(categoryId),
      specifications: {
        material: "Plata 925",
        unit: "individual" as const,
        verifiedAt,
      },
      supplierDetails: {
        reference: "SUP-1",
        sourceUrl: "https://supplier.example/piece",
        verifiedAt,
        imageProvenance: "supplier-authorized" as const,
      },
      seoTitle: "Modelo de plata",
      seoDescription: "Descripción revisada.",
    };
    const id = await createProduct(input);
    const variantId = await createVariant({
      productId: id,
      onHand: 7,
      pricePyg: 85000,
    });
    const [original] = await getTestDb()
      .select()
      .from(variants)
      .where(eq(variants.id, variantId));
    await saveVariant(id, {
      id: variantId,
      sku: original!.sku,
      label: "17,5 mm",
      pricePyg: 85000,
      compareAtPyg: null,
      isActive: true,
      attributes: { interiorMm: 17.5, verifiedAt },
      identifiers: { gtin: "4006381333931", verifiedAt },
    });
    const saved = await getAdminProduct(id);
    expect(saved?.product).toMatchObject({
      specifications: input.specifications,
      supplierDetails: input.supplierDetails,
      seoTitle: input.seoTitle,
    });
    expect(saved?.variants[0]).toMatchObject({
      onHand: 7,
      pricePyg: 85000,
      attributes: { interiorMm: 17.5 },
      identifiers: { gtin: "4006381333931" },
    });
    await updateProduct(id, write(categoryId));
    expect((await getAdminProduct(id))?.product.seoTitle).toBe(
      "Modelo de plata"
    );
    await updateProduct(id, {
      ...write(categoryId),
      seoTitle: null,
      specifications: null,
    });
    expect((await getAdminProduct(id))?.product).toMatchObject({
      seoTitle: null,
      specifications: null,
    });
  });

  it("renames directly to the current URL and rejects collisions, cycles and concept escapes atomically", async () => {
    const categoryId = await createCategory();
    const id = await createProduct(write(categoryId, "first-model"));
    await updateProduct(id, write(categoryId, "second-model"));
    await updateProduct(id, write(categoryId, "third-model"));
    expect(await getProductSlugRedirect("first-model")).toBe("third-model");
    expect(await getProductSlugRedirect("second-model")).toBe("third-model");
    expect(await getProductSlugRedirect("third-model")).toBeNull();
    await expect(
      updateProduct(id, write(categoryId, "first-model"))
    ).rejects.toMatchObject({ code: "adminError.producto.slugHistorico" });
    await expect(
      createProduct(write(categoryId, "second-model"))
    ).rejects.toMatchObject({ code: "adminError.producto.slugHistorico" });
    await expect(
      updateProduct(id, write(categoryId, "concepto-third-model"))
    ).rejects.toMatchObject({ code: "adminError.producto.slugConcepto" });
    const concept = await createProduct({
      ...write(categoryId, "concepto-reference"),
      saleMode: "enquiry",
      showPrice: false,
    });
    await expect(
      updateProduct(concept, write(categoryId, "real-reference"))
    ).rejects.toMatchObject({ code: "adminError.producto.slugConcepto" });
    expect((await getAdminProduct(id))?.product.slug).toBe("third-model");
    await getTestDb()
      .update(categories)
      .set({ isActive: false })
      .where(eq(categories.id, categoryId));
    expect(await getProductSlugRedirect("first-model")).toBeNull();
  });

  it("imports optional fields while preserving existing stock and fields missing from later imports", async () => {
    const categoryId = await createCategory();
    const item: CatalogProductUpsert = {
      ...write(categoryId),
      specifications: { material: "Acero", unit: "individual", verifiedAt },
      seoTitle: "Pieza de acero",
      variants: [
        {
          sku: "IMPORT-FOUNDATION",
          label: "18 mm",
          pricePyg: 50000,
          compareAtPyg: null,
          onHand: 5,
          attributes: { interiorMm: 18 },
          identifiers: { mpn: "MAKER-18", verifiedAt },
        },
      ],
    };
    await upsertCatalogProducts([item]);
    await upsertCatalogProducts([
      {
        ...item,
        specifications: undefined,
        seoTitle: undefined,
        variants: [
          {
            ...item.variants[0]!,
            onHand: 99,
            attributes: undefined,
            identifiers: undefined,
          },
        ],
      },
    ]);
    const [product] = await getTestDb()
      .select()
      .from(products)
      .where(eq(products.slug, item.slug));
    const saved = await getAdminProduct(product!.id);
    expect(saved?.product).toMatchObject({
      specifications: item.specifications,
      seoTitle: item.seoTitle,
    });
    expect(saved?.variants[0]).toMatchObject({
      onHand: 5,
      attributes: { interiorMm: 18 },
      identifiers: { mpn: "MAKER-18" },
    });
    await updateProduct(product!.id, write(categoryId, "renamed-import"));
    await expect(upsertCatalogProducts([item])).rejects.toMatchObject({
      code: "adminError.producto.slugHistorico",
    });
  });

  it("duplicating a product avoids historical aliases and retains unpublished zero-stock semantics", async () => {
    const categoryId = await createCategory();
    const prior = await createProduct(write(categoryId, "base-copia"));
    await updateProduct(prior, write(categoryId, "another-model"));
    const original = await createProduct(write(categoryId, "base"));
    await createVariant({ productId: original, onHand: 5 });
    const copy = await getAdminProduct(await duplicateProduct(original));
    expect(copy?.product).toMatchObject({
      slug: "base-copia-2",
      isActive: false,
      publishedAt: null,
    });
    expect(copy?.variants[0]?.onHand).toBe(0);
    expect(await getProductSlugRedirect("base-copia")).toBe("another-model");
  });

  it("category SEO clears intentionally while backups retain specs, identifiers and URL history", async () => {
    const category = await createManagedCategory({
      name: "Categoría revisada",
      slug: "reviewed-category",
      seoTitle: "Anillos revisados",
      seoDescription: "Descripción propia.",
    });
    await updateCategory({
      categoryId: category.id,
      name: category.name,
      slug: category.slug,
    });
    expect(
      (
        await getTestDb()
          .select()
          .from(categories)
          .where(eq(categories.id, category.id))
      )[0]?.seoTitle
    ).toBe("Anillos revisados");
    await updateCategory({
      categoryId: category.id,
      name: category.name,
      seoDescription: null,
    });
    const id = await createProduct({
      ...write(category.id),
      specifications: { material: "Plata", verifiedAt },
      supplierDetails: { reference: "Evidence", verifiedAt },
      seoTitle: "SEO propio",
    });
    await saveVariant(id, {
      sku: "BACKUP-FACTS",
      label: "Medida",
      pricePyg: 100000,
      compareAtPyg: null,
      isActive: true,
      attributes: { interiorMm: 17, verifiedAt },
      identifiers: { mpn: "Manufacturer-ID", verifiedAt },
    });
    await updateProduct(id, { ...write(category.id, "current-model") });
    const rows: Array<{ table: string; row: Record<string, unknown> }> = [];
    for await (const row of dumpRows(getTestDb())) rows.push(row);
    const value = (table: string, column: string) =>
      rows.find((row) => row.table === table)?.row[column];
    const json = (value: unknown) =>
      typeof value === "string" ? JSON.parse(value) : value;
    expect(json(value("products", "specifications"))).toEqual({
      material: "Plata",
      verifiedAt,
    });
    expect(json(value("variants", "identifiers"))).toEqual({
      mpn: "Manufacturer-ID",
      verifiedAt,
    });
    expect(
      rows
        .filter((row) => row.table === "product_slug_redirects")
        .map((row) => row.row.slug)
    ).toEqual(["current-model", "verified-piece"]);
    expect(await getTestDb().select().from(productSlugRedirects)).toHaveLength(
      2
    );
    const folder = await mkdtemp(
      path.join(tmpdir(), "product-foundation-backup-")
    );
    try {
      const { stream, stats } = dumpDatabase();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) chunks.push(Buffer.from(chunk));
      await stats;
      const file = path.join(folder, "catalogue.gz");
      await writeFile(file, Buffer.concat(chunks));
      await resetTables();
      await restoreBackup({ archivo: file });
      expect((await getAdminProduct(id))?.product).toMatchObject({
        specifications: { material: "Plata", verifiedAt },
        supplierDetails: { reference: "Evidence", verifiedAt },
        seoTitle: "SEO propio",
      });
      expect((await getAdminProduct(id))?.variants[0]?.identifiers).toEqual({
        mpn: "Manufacturer-ID",
        verifiedAt,
      });
      expect(await getProductSlugRedirect("verified-piece")).toBe(
        "current-model"
      );
      expect(
        (
          await getTestDb()
            .select()
            .from(categories)
            .where(eq(categories.id, category.id))
        )[0]
      ).toMatchObject({ seoTitle: "Anillos revisados", seoDescription: null });
    } finally {
      if (
        !path
          .resolve(folder)
          .startsWith(
            path.resolve(tmpdir()) + path.sep + "product-foundation-backup-"
          )
      )
        throw new Error("Unexpected backup temporary directory");
      await rm(folder, { recursive: true, force: true });
    }
  });
});
