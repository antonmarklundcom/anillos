"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { getWishlistProducts } from "@/app/actions/wishlist";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { EnquiryComposer } from "@/components/enquiry-composer";
import { displayProductName } from "@/config/ring-display";
import { isConceptProduct } from "@/lib/concept-products";
import { MAX_ENQUIRY_PRODUCTS } from "@/store/enquiry-draft";
import type { CatalogProduct } from "@/db/queries";
import { t } from "@/i18n/client";
import { waShareLink } from "@/lib/py";
import { TESTIDS } from "@/lib/testids";
import { normalizeWishlistSlugs, useWishlist } from "@/lib/wishlist-store";

function parseSharedSlugs(raw: string | null): string[] {
  if (!raw) return [];
  return normalizeWishlistSlugs(
    raw
      .split(",")
      .map((slug) => slug.trim())
      .filter(Boolean)
  );
}

/**
 * `/favoritos`, en dos modos:
 *
 * - **La propia lista** (sin `?p=`): los slugs salen de `wishlist-store.ts`
 *   (localStorage) y se resuelven contra la DB para dibujarse — el store
 *   nunca guarda precio ni nombre (ver ese archivo).
 * - **Una lista compartida** (`?p=slug1,slug2`): los slugs salen de la URL,
 *   no del navegador de quien la abre. Nunca se auto-guardan en la lista de
 *   quien mira: el botón "Guardar todos" es una acción explícita.
 *
 * Siempre server-resuelto: lo que se ve —precio, disponibilidad, si sigue
 * publicado— es lo que dice hoy la DB, nunca lo que había cuando se guardó.
 */
export function WishlistView({
  whatsappHref = null,
  origin = null,
}: {
  whatsappHref?: string | null;
  origin?: string | null;
}) {
  const searchParams = useSearchParams();
  const sharedSlugs = useMemo(
    () => parseSharedSlugs(searchParams.get("p")),
    [searchParams]
  );
  const isShared = sharedSlugs.length > 0;

  const mySlugs = useWishlist((state) => state.slugs);
  const addMany = useWishlist((state) => state.addMany);
  const slugs = isShared ? sharedSlugs : normalizeWishlistSlugs(mySlugs);
  const slugsKey = slugs.join(",");

  const [products, setProducts] = useState<CatalogProduct[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    // El `setState` va adentro del `setTimeout`, no suelto en el cuerpo del
    // efecto: mismo motivo que `recently-viewed.tsx` — un `setState` síncrono
    // ahí dispara un render en cascada y la regla `set-state-in-effect` de
    // React lo marca. El timeout de 0 alcanza, no hay nada que esperar.
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setLoadError(false);
      if (slugs.length === 0) {
        setProducts([]);
        return;
      }
      setProducts(null);
      void getWishlistProducts(slugs)
        .then((result) => {
          if (!cancelled) setProducts(result);
        })
        .catch(() => {
          if (cancelled) return;
          setProducts([]);
          setLoadError(true);
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // Se re-corre por el contenido de la lista, no por su identidad: cada
    // render de `useWishlist` arma un array nuevo aunque los slugs sean los
    // mismos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugsKey, retry]);

  const shareUrl = origin
    ? new URL(`/favoritos?p=${slugsKey}`, origin).toString()
    : null;
  const waShareHref = shareUrl
    ? waShareLink(`${t("favoritos.compartirWhatsApp.texto")} ${shareUrl}`)
    : null;
  const enquiryProducts = (products ?? [])
    .filter(
      (product) =>
        product.saleMode === "enquiry" && selected.includes(product.slug)
    )
    .slice(0, MAX_ENQUIRY_PRODUCTS)
    .map((product) => ({
      slug: product.slug,
      name: displayProductName(product.name, product.slug),
      categorySlug: product.categorySlug,
      concept: isConceptProduct(product.slug),
      unit: product.verifiedSpecifications?.unit ?? null,
      url: origin
        ? new URL(
            `/producto/${encodeURIComponent(product.slug)}`,
            origin
          ).toString()
        : null,
    }));

  function handleGuardarTodos() {
    addMany(sharedSlugs);
    setSaved(true);
    toast.success(t("favoritos.agregado"));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isShared ? t("favoritos.tituloCompartido") : t("favoritos.titulo")}
        </h1>

        <div className="flex flex-wrap gap-2">
          {isShared && products && products.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saved}
              data-testid={TESTIDS.wishlistSaveAll}
              onClick={handleGuardarTodos}
            >
              {t("favoritos.guardarTodos")}
            </Button>
          ) : null}

          {!isShared && waShareHref && products && products.length > 0 ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              data-testid={TESTIDS.wishlistShareWhatsapp}
            >
              <a href={waShareHref} target="_blank" rel="noopener noreferrer">
                {t("favoritos.compartirWhatsApp")}
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      {loadError ? (
        <div role="alert" className="mt-6 space-y-3">
          <p>No pudimos cargar tus favoritos. Tu lista sigue guardada.</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setRetry((value) => value + 1)}
          >
            Volver a intentar
          </Button>
        </div>
      ) : products === null ? (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: slugs.length || 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="border-border mt-8 rounded-xl border border-dashed p-10 text-center">
          <p className="font-medium">{t("favoritos.vacio")}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("favoritos.vacio.ayuda")}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/">{t("favoritos.vacio.irAlInicio")}</Link>
          </Button>
        </div>
      ) : (
        <div
          className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
          data-testid={TESTIDS.wishlistGrid}
        >
          {products.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
              {product.saleMode === "enquiry" && (
                <label className="mt-3 flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={selected.includes(product.slug)}
                    disabled={
                      !selected.includes(product.slug) &&
                      enquiryProducts.length >= MAX_ENQUIRY_PRODUCTS
                    }
                    onChange={(event) =>
                      setSelected((current) =>
                        event.target.checked
                          ? [
                              ...current.filter(
                                (slug) => slug !== product.slug
                              ),
                              product.slug,
                            ]
                          : current.filter((slug) => slug !== product.slug)
                      )
                    }
                  />
                  <span>
                    Consultar por{" "}
                    {displayProductName(product.name, product.slug)}
                  </span>
                </label>
              )}
            </div>
          ))}
        </div>
      )}
      {products &&
        products.some((product) => product.saleMode === "enquiry") && (
          <section
            className="border-border mt-10 rounded-xl border p-5 sm:p-7"
            aria-labelledby="wishlist-enquiry-heading"
            data-testid="wishlist-enquiry"
          >
            <p className="eyebrow">Compará antes de decidir</p>
            <h2 id="wishlist-enquiry-heading" className="text-xl font-semibold">
              Consultá por tus diseños favoritos
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Marcá hasta {MAX_ENQUIRY_PRODUCTS} diseños para incluirlos en una
              sola consulta. Precio, disponibilidad y entrega quedan por
              confirmar.
            </p>
            {enquiryProducts.length > 0 ? (
              <EnquiryComposer
                products={enquiryProducts}
                whatsappHref={whatsappHref}
                draftKey={`favoritos:${enquiryProducts
                  .map((product) => product.slug)
                  .sort()
                  .join(",")}`}
              />
            ) : (
              <p className="mt-4 text-sm">
                Elegí al menos un diseño de la lista.
              </p>
            )}
            <p className="product-enquiry-note">
              La consulta no crea un pedido, reserva ni pago.
            </p>
          </section>
        )}
    </div>
  );
}
