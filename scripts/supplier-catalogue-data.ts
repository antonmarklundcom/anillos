import { COLLECTIONS } from "../src/config/ring-store";
import { toCsv } from "../src/lib/csv";
import { SupplierDetailsSchema } from "../src/lib/product-attributes";

export type SupplierModel = {
  key: string;
  reference: string;
  slug: string;
  name: string;
  category: string;
  sourceUrl: string;
};

/** Preparation only: no DB, integrations, source-photo imports or publication. */
export function supplierDraftCsv(models: readonly SupplierModel[]) {
  const keys = new Set<string>();
  const slugs = new Set<string>();
  const rows = models.map((model) => {
    const collection = COLLECTIONS.find((item) => item.slug === model.category);
    if (!collection || !/^candidato-[a-z0-9-]+$/.test(model.slug))
      throw new Error(`Invalid research destination: ${model.key}`);
    if (keys.has(model.key) || slugs.has(model.slug))
      throw new Error(`Duplicate research identity: ${model.key}`);
    keys.add(model.key);
    slugs.add(model.slug);
    const supplier = SupplierDetailsSchema.parse({
      reference: model.reference,
      sourceUrl: model.sourceUrl,
    });
    return [
      model.key,
      model.name,
      collection.name,
      "",
      0,
      "Medidas y unidad a confirmar",
      model.slug,
      "enquiry",
      "false",
      "Referencia de investigación, pendiente de comprobar con una pieza real. No está a la venta. No hay material, piedra, medidas, precio, disponibilidad ni entrega confirmados. Las imágenes y los permisos de uso siguen pendientes.",
      JSON.stringify(supplier),
    ];
  });
  return toCsv(
    [
      "SKU",
      "Producto",
      "Categoria",
      "Precio",
      "Stock",
      "Variante",
      "Slug",
      "Modo de venta",
      "Mostrar precio",
      "Descripción",
      "Proveedor JSON",
    ],
    rows
  );
}
