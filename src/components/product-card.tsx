import Link from "next/link";
import { CONCEPT_LABEL, priceUnit } from "@/config/ring-display";
import { isConceptProduct } from "@/lib/concept-products";

import { PriceTag } from "@/components/price-tag";
import { ProductImage } from "@/components/product-image";
import { RatingStars, formatRating } from "@/components/rating-stars";
import { StockBadge } from "@/components/stock-badge";
import { WishlistButton } from "@/components/wishlist-button";
import type { CatalogProduct } from "@/db/queries";
import { t, tPlural } from "@/i18n/client";
import { TESTIDS } from "@/lib/testids";

export function ProductCard({
  product,
  priority = false,
  showRating = false,
}: {
  product: CatalogProduct;
  priority?: boolean;
  /**
   * Estrellas en la tarjeta (`/admin/ajustes` → vidriera). Lo decide la
   * página, que es server: esta tarjeta también se dibuja en el cliente
   * (favoritos) y no puede leer los ajustes. Sin reseñas aprobadas no se
   * dibuja nada aunque esté prendido.
   */
  showRating?: boolean;
}) {
  const concept = isConceptProduct(product.slug);
  const showPrice = !concept && product.showPrice !== false;
  // El precio "desde" es el de la variante más barata disponible; si no hay
  // ninguna con stock, igual mostramos el más barato para no dejar el card mudo.
  const priced = product.variants.filter(
    (variant) => Number.isSafeInteger(variant.pricePyg) && variant.pricePyg > 0
  );
  const inStock = priced.filter((variant) => variant.available > 0);
  const shown = (inStock.length > 0 ? inStock : priced).reduce<
    CatalogProduct["variants"][number] | undefined
  >(
    (cheapest, variant) =>
      !cheapest || variant.pricePyg < cheapest.pricePyg ? variant : cheapest,
    undefined
  );

  const totalAvailable = (
    product.showPrice === false ||
    isConceptProduct(product.slug) ||
    (product.saleMode ?? "stock") !== "stock"
      ? []
      : priced
  ).reduce((total, variant) => total + variant.available, 0);
  const hasVariantRange = product.variants.length > 1;

  return (
    <div className="relative">
      <Link
        href={`/producto/${product.slug}`}
        data-testid={TESTIDS.productCard}
        data-slug={product.slug}
        className="product-editorial-card group focus-visible:ring-ring flex flex-col focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="product-card-photo relative">
          <ProductImage
            image={product.image}
            alt={product.name}
            categorySlug={product.categorySlug}
            concept={isConceptProduct(product.slug)}
            priority={priority}
          />
        </div>

        <div className="product-card-copy mt-4 flex flex-1 flex-col gap-2">
          <p className="product-card-category text-muted-foreground text-xs">
            {product.brand ?? product.categoryName}
          </p>
          <h3 className="product-card-title group-hover:text-foreground line-clamp-2 font-medium">
            {product.name}
          </h3>
          <p
            className="text-muted-foreground text-xs"
            data-testid="ring-price-unit"
          >
            {product.verifiedSpecifications?.unit === "pair"
              ? "Par de dos anillos"
              : product.verifiedSpecifications?.unit === "individual"
                ? "Un anillo"
                : isConceptProduct(product.slug)
                  ? priceUnit(product.categorySlug)
                  : "Unidad por confirmar"}
          </p>
          {concept ? (
            <p className="product-card-note text-muted-foreground text-xs">
              {CONCEPT_LABEL} · sin compra ni reserva
            </p>
          ) : null}
          {showRating && product.rating && product.rating.count >= 1 ? (
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <RatingStars value={product.rating.average} size={12} />
              <span aria-hidden>{formatRating(product.rating.average)}</span>
              <span>({tPlural("catalogo.resenas", product.rating.count)})</span>
            </p>
          ) : null}

          <div className="mt-auto pt-2">
            {shown && showPrice ? (
              <PriceTag
                pricePyg={shown.pricePyg}
                compareAtPyg={shown.compareAtPyg}
                size="sm"
              />
            ) : null}
            <div className="product-card-foot mt-2 flex flex-wrap items-center gap-2">
              {isConceptProduct(product.slug) ? (
                <span className="text-xs">Explorá la idea y sus detalles</span>
              ) : (product.saleMode ?? "stock") === "stock" ? (
                <StockBadge available={totalAvailable} />
              ) : (
                <span className="text-xs">
                  {t(
                    product.saleMode === "enquiry"
                      ? "producto.soloConsulta"
                      : "producto.muestra"
                  )}
                </span>
              )}
              {hasVariantRange ? (
                <span className="text-muted-foreground text-xs">
                  {t("catalogo.opciones", { n: product.variants.length })}
                </span>
              ) : null}
              <span className="product-card-arrow ml-auto" aria-hidden>
                ↗
              </span>
            </div>
          </div>
        </div>
      </Link>
      <WishlistButton
        slug={product.slug}
        name={product.name}
        sku={shown?.sku}
        pricePyg={showPrice ? shown?.pricePyg : undefined}
      />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border-border rounded-xl border p-3">
      <div className="bg-muted aspect-square animate-pulse rounded-lg" />
      <div className="mt-3 space-y-2">
        <div className="bg-muted h-3 w-1/3 animate-pulse rounded" />
        <div className="bg-muted h-4 w-4/5 animate-pulse rounded" />
        <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
      </div>
    </div>
  );
}
