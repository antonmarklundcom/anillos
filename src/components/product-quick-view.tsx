"use client";

import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { CatalogImage } from "@/db/queries";

/** Explicit public projection: no supplier data, internal price, inventory or offer. */
export type ProductQuickViewData = {
  slug: string;
  name: string;
  categorySlug: string;
  image: CatalogImage | null;
  concept: boolean;
  unit: string;
};
export function ProductQuickView({
  product,
}: {
  product: ProductQuickViewData;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mt-3 rounded border px-3 py-2 text-sm"
          aria-label={`Vista rápida: ${product.name}`}
        >
          Vista rápida
        </button>
      </DialogTrigger>
      <DialogContent className="top-0 right-0 left-auto h-dvh max-h-dvh w-full translate-x-0 translate-y-0 overflow-y-auto rounded-none sm:max-w-xl">
        <DialogTitle>{product.name}</DialogTitle>
        <DialogDescription>
          {product.unit}.{" "}
          {product.concept
            ? "Diseño ilustrativo. Las características de una pieza real requieren confirmación."
            : "Revisá la ficha completa para conocer los datos confirmados y las condiciones de consulta."}
        </DialogDescription>
        <ProductImage
          image={product.image}
          alt={product.name}
          categorySlug={product.categorySlug}
          concept={product.concept}
          size="detail"
          sizes="(max-width: 640px) 90vw, 540px"
        />
        <Link
          href={`/producto/${product.slug}`}
          className="rounded border px-4 py-3 text-center"
        >
          Ver ficha completa →
        </Link>
      </DialogContent>
    </Dialog>
  );
}
