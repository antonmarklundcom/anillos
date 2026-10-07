import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import type { CatalogProduct } from "@/db/queries";
import type { ProductSpecifications } from "@/lib/product-attributes";
import { isConceptProduct } from "@/lib/concept-products";
import {
  comparisonAvailability,
  comparisonPrice,
  comparisonUrl,
} from "@/lib/product-comparison";

/** Specifications must be a server-approved public projection, never supplierDetails. */
export type ComparisonProduct = CatalogProduct & {
  verifiedSpecifications?: ProductSpecifications | null;
};
export function ProductComparison({
  products,
}: {
  products: readonly ComparisonProduct[];
}) {
  const specs = (product: ComparisonProduct) =>
    isConceptProduct(product.slug) ? null : product.verifiedSpecifications;
  const rows: {
    label: string;
    value: (product: ComparisonProduct) => string;
  }[] = [
    { label: "Precio", value: comparisonPrice },
    {
      label: "Unidad incluida",
      value: (product) =>
        specs(product)?.unit === "pair"
          ? "Par de dos anillos"
          : specs(product)?.unit === "individual"
            ? "Un anillo"
            : "Por confirmar",
    },
    { label: "Disponibilidad", value: comparisonAvailability },
    {
      label: "Material",
      value: (product) => specs(product)?.material ?? "Por confirmar",
    },
    {
      label: "Pureza",
      value: (product) => specs(product)?.purity ?? "Por confirmar",
    },
    {
      label: "Piedra",
      value: (product) => specs(product)?.stone ?? "Por confirmar",
    },
    {
      label: "Ancho",
      value: (product) =>
        specs(product)?.widthMm
          ? `${specs(product)!.widthMm} mm`
          : "Por confirmar",
    },
    {
      label: "Opciones del catálogo",
      value: (product) =>
        product.variants.map((variant) => variant.label).join(" · ") ||
        "Por confirmar",
    },
  ];
  if (!products.length)
    return (
      <p>Elegí hasta tres productos del catálogo para comparar sus fichas.</p>
    );
  return (
    <div
      className="overflow-x-auto"
      role="region"
      aria-label="Comparación de productos"
      tabIndex={0}
    >
      <table className="comparison-table">
        <caption className="sr-only">
          Comparación de hasta tres productos. Los datos ausentes figuran por
          confirmar.
        </caption>
        <thead>
          <tr>
            <th scope="col">Característica</th>
            {products.map((product) => {
              return (
                <th key={product.slug} scope="col">
                  <ProductImage
                    image={product.image}
                    alt={product.name}
                    categorySlug={product.categorySlug}
                    concept={isConceptProduct(product.slug)}
                    className="mb-3 w-full"
                    sizes="260px"
                  />
                  <Link
                    href={`/producto/${product.slug}`}
                    className="underline underline-offset-4"
                  >
                    {product.name}
                  </Link>
                  <Link
                    href={comparisonUrl(
                      products
                        .filter((item) => item.slug !== product.slug)
                        .map((item) => item.slug)
                    )}
                    className="mt-3 block text-xs font-normal underline"
                  >
                    Quitar de la comparación
                  </Link>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {products.map((product) => (
                <td key={product.slug}>{row.value(product)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
