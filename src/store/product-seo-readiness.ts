import type {
  ProductSpecifications,
  SupplierDetails,
  VariantAttributes,
} from "@/lib/product-attributes";
import { isConceptProduct } from "@/lib/concept-products";
import { markdownToText } from "@/lib/markdown";
import {
  verifiedProductImage,
  type ImageEvidence,
} from "@/lib/product-image-provenance";

export type ProductReadinessInput = {
  slug: string;
  name?: string | null;
  description?: string | null;
  categorySlug?: string | null;
  saleMode?: "stock" | "enquiry" | "showcase";
  showPrice?: boolean;
  specifications?: ProductSpecifications | null;
  supplierDetails?: SupplierDetails | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  images?: readonly ({
    alt?: string | null;
    cloudinaryId?: string | null;
  } & ImageEvidence)[];
  variants?: readonly {
    isActive?: boolean;
    pricePyg?: number;
    stock?: number;
    available?: number;
    attributes?: VariantAttributes | null;
  }[];
};
export type ProductReadinessCheck = {
  id: string;
  label: string;
  status: "complete" | "missing" | "optional" | "restricted";
  detail: string;
};
const text = (value?: string | null) => Boolean(value?.trim());
const positive = (value?: number) =>
  value !== undefined && Number.isFinite(value) && value > 0;
const nonnegativeInteger = (value?: number) =>
  value !== undefined && Number.isSafeInteger(value) && value >= 0;
const verified = (value?: string) =>
  Boolean(
    value &&
    Number.isFinite(Date.parse(value)) &&
    Date.parse(value) <= Date.now()
  );

/** An advisory checklist: never authorizes publication, payment or stock changes. */
export function productSeoReadiness(input: ProductReadinessInput) {
  const concept = isConceptProduct(input.slug);
  const stockMode = (input.saleMode ?? "stock") === "stock" && !concept;
  const supplierVerified = verified(input.supplierDetails?.verifiedAt);
  const factsVerified = verified(input.specifications?.verifiedAt) && !concept;
  const specifications = factsVerified ? input.specifications : null;
  const images =
    input.images?.filter((image) => text(image.cloudinaryId)) ?? [];
  const genuinePhotos =
    images.length > 0 && !concept && images.every(verifiedProductImage);
  const variants =
    input.variants?.filter((variant) => variant.isActive !== false) ?? [];
  const sized =
    variants.length > 0 &&
    variants.every(
      ({ attributes }) =>
        verified(attributes?.verifiedAt) &&
        (specifications?.unit === "pair"
          ? positive(attributes?.interiorMm) &&
            positive(attributes?.interiorMmSecond)
          : positive(attributes?.interiorMm) ||
            (text(attributes?.sizeSystem) && text(attributes?.sizeLabel)))
    );
  const checks: ProductReadinessCheck[] = [];
  const check = (
    id: string,
    label: string,
    complete: boolean,
    detail: string,
    required = true
  ) =>
    checks.push({
      id,
      label,
      status: complete ? "complete" : required ? "missing" : "optional",
      detail,
    });
  check(
    "name",
    "Nombre y H1 del modelo",
    text(input.name),
    "Usá el nombre del modelo real; las variantes de talle no requieren productos duplicados."
  );
  check(
    "description",
    "Descripción propia de la pieza",
    text(markdownToText(input.description)),
    "Describí sólo características confirmadas. El texto genérico de una categoría no reemplaza la ficha del modelo."
  );
  check(
    "category",
    "Categoría relacionada",
    text(input.categorySlug),
    "Asigná la intención principal y enlazá guías relevantes, sin crear una página por cada variante del keyword."
  );
  check(
    "supplier",
    "Datos del proveedor revisados",
    supplierVerified &&
      !concept &&
      (text(input.supplierDetails?.reference) ||
        text(input.supplierDetails?.sourceUrl)),
    "Registrá una referencia o fuente y la verificación explícita. El checklist no verifica al proveedor ni muestra su información privada."
  );
  check(
    "material",
    "Material confirmado",
    text(specifications?.material),
    "La apariencia de una foto no acredita metal, ley o recubrimiento."
  );
  check(
    "unit",
    "Unidad o par confirmado",
    Boolean(specifications?.unit),
    "Una pieza y un par de dos anillos necesitan una unidad comercial explícita; no la deduzcas de la categoría."
  );
  check(
    "sizes",
    "Medidas y escala de variantes",
    factsVerified && sized,
    "Confirmá las medidas de cada variante e indicá diámetro interior o sistema y etiqueta de talle. En un par, registrá los dos diámetros por variante."
  );
  check(
    "photos",
    "Fotografías reales con permiso",
    genuinePhotos,
    "Subí fotos propias o autorizadas del modelo. Una imagen ilustrativa compartida no es fotografía verificada del producto."
  );
  check(
    "image-alt",
    "Descripción de las fotos",
    genuinePhotos && images.every((image) => text(image.alt)),
    "El texto alternativo debe describir la vista real; no acredita una composición ni debe repetir una lista de keywords.",
    false
  );
  check(
    "stone",
    "Identidad de la piedra, si corresponde",
    text(specifications?.stone),
    "Si el diseño tiene piedras, confirmá identidad, origen y tratamientos. Un campo vacío no significa que no tenga piedra.",
    false
  );
  check(
    "purity",
    "Ley o pureza, si corresponde",
    text(specifications?.purity),
    "Confirmá la ley de oro o plata y separala de cualquier recubrimiento. No es un requisito para todos los materiales.",
    false
  );
  check(
    "width",
    "Ancho de la banda",
    positive(specifications?.widthMm),
    "Una medida real permite comparar escala y comodidad; no la estimes de la imagen.",
    false
  );
  check(
    "seo-title",
    "Título SEO",
    text(input.seoTitle) || text(input.name),
    "El nombre se usa como título por defecto. Un título específico debe mantener el modelo y su intención, sin inventar atributos."
  );
  check(
    "seo-description",
    "Descripción SEO",
    text(input.seoDescription) || text(markdownToText(input.description)),
    "Se puede usar un fragmento de la descripción confirmada. No anuncies un precio oculto ni información pendiente."
  );
  if (stockMode) {
    check(
      "price",
      "Precio visible y válido en PYG",
      input.showPrice !== false &&
        variants.length > 0 &&
        variants.every(
          (variant) =>
            Number.isSafeInteger(variant.pricePyg) && positive(variant.pricePyg)
        ),
      "Para venta con stock, cada variante necesita un precio positivo entero en guaraníes."
    );
    check(
      "inventory",
      "Inventario registrado",
      variants.length > 0 &&
        variants.every((variant) =>
          nonnegativeInteger(variant.stock ?? variant.available)
        ),
      "Cero unidades es un estado válido de agotado; una cantidad desconocida no debe convertirse en disponibilidad."
    );
  } else {
    checks.push({
      id: "price",
      label: "Precio y stock",
      status: concept ? "restricted" : "optional",
      detail: concept
        ? "Los conceptos conservan precios ocultos, cero disponibilidad, noindex y ausencia de ofertas. Nunca habilitan compras."
        : "Una ficha de consulta o muestra puede tener datos comerciales pendientes. No inventes precio ni disponibilidad; confirmá un canal de consulta real antes de publicar.",
    });
  }
  return {
    concept,
    mode: concept ? ("concept" as const) : (input.saleMode ?? "stock"),
    checks,
    complete: checks.filter((item) => item.status === "complete").length,
    missing: checks.filter((item) => item.status === "missing").length,
    factsVerified,
    genuinePhotos,
    warning:
      "Revisión orientativa. No comprueba proveedor, indexación, entrega, pagos ni habilita la publicación o compra.",
  };
}
