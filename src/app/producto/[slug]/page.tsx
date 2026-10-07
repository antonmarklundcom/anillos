import { productInquiryLinks } from "@/domain/product-inquiries";
import { priceUnit, CONCEPT_NOTICE } from "@/config/ring-store";
import { isConceptProduct } from "@/lib/concept-products";
import { ProductGallery } from "@/components/product-gallery";
import { PRODUCT_PLACEHOLDERS } from "@/config/product-placeholders";
import { ringMetadata } from "@/store/seo";
import { productMetaDescription } from "@/store/product-metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getProductSlugRedirect } from "@/domain/product-slugs";
import { productGuidance } from "@/store/product-guidance";
import { comparisonUrl } from "@/lib/product-comparison";
import {
  merchantImages,
  verifiedProductImage,
} from "@/lib/product-image-provenance";
import { variantUrl } from "@/lib/variant-url";
import { cache } from "react";

import { AddToCart } from "@/components/add-to-cart";
import { FunnelEvent } from "@/components/funnel-event";
import { ProductDescription } from "@/components/product-description";
import { ProductCard } from "@/components/product-card";
import { RatingStars, formatRating } from "@/components/rating-stars";
import { RecentlyViewed } from "@/components/recently-viewed";
import { StickyBuyBar } from "@/components/sticky-buy-bar";
import { WishlistButton } from "@/components/wishlist-button";
import { getProductBySlug, getRelatedProducts } from "@/db/queries";
import { getProductRatingSummary, listApprovedReviews } from "@/domain/reviews";
import { stockAlertsEnabled } from "@/domain/stock-alerts";
import { getStoreSettings } from "@/domain/store-settings";
import { t, tPlural } from "@/i18n";
import { analyticsActivo } from "@/lib/analytics";
import { waLinkPublico, whatsappPublico } from "@/lib/comercio";
import { OG_IMAGE_SIZE, productImageUrl } from "@/lib/images";
import { markdownToText } from "@/lib/markdown";
import { formatGs } from "@/lib/money";
import { formatDatePY } from "@/lib/py";
import { breadcrumbJsonLd, jsonLdScript, productJsonLd } from "@/lib/seo";
import { siteOrigin } from "@/lib/site-url";
import { TESTIDS } from "@/lib/testids";

/**
 * Ficha de producto.
 *
 * `dynamic`: la disponibilidad es lo que decide la compra, y una reserva
 * ajena de hace treinta segundos ya la cambió. El resto del catálogo sí usa
 * ISR — acá preferimos el dato fresco.
 */
export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

/** El bloque de agregar al carrito: a donde vuelve la barra de compra móvil. */
const BLOQUE_COMPRA_ID = "comprar";

/** `cache()` memoiza por request: metadata y página comparten una consulta. */
const loadProduct = cache(async (slug: string) => getProductBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug).catch(() => null);
  if (!product) return { title: t("producto.noEncontrado") };

  const cheapest = product.variants
    .filter(
      (variant) =>
        Number.isSafeInteger(variant.pricePyg) && variant.pricePyg > 0
    )
    .reduce<number | undefined>(
      (min, variant) =>
        min === undefined || variant.pricePyg < min ? variant.pricePyg : min,
      undefined
    );

  // `markdownToText` y no la descripción cruda (O7): desde que el campo acepta
  // markdown, una que empiece con `**Importado**` publicaría literalmente los
  // asteriscos en el resultado de Google. Es el único lugar de la vidriera que
  // O7 toca — el render de la descripción en la página es de S11.
  const description =
    product.seoDescription ??
    productMetaDescription({
      name: product.name,
      categoryName: product.categoryName,
      description: product.description,
      cheapestPrice: cheapest,
      saleMode: product.saleMode,
      showPrice: product.showPrice,
    });

  // La foto principal, recortada a la caja que espera WhatsApp. Si el
  // producto todavía no tiene fotos (o falta el cloud de Cloudinary), se
  // omite `images` y Next hereda la del sitio (`app/opengraph-image.tsx`):
  // el link se comparte con la marca en vez de con un rectángulo gris.
  const merchantPhotos = isConceptProduct(product.slug)
    ? []
    : merchantImages(product.images);
  const ogImage = productImageUrl(merchantPhotos[0]?.cloudinaryId, "og");

  // == S17 == Mismo criterio que `categoria/[slug]`: canonical a la URL
  // limpia del producto, y sólo si hay origen configurado (`siteOrigin()`,
  // nunca un dominio inventado). Esta ficha no arrastra filtros en la URL
  // hoy, pero declarar el canonical explícito no le hace falta a un futuro
  // parámetro de tracking para dejar de indexarse como página aparte.
  const origin = siteOrigin();
  const canonical = origin
    ? new URL(`/producto/${product.slug}`, origin).toString()
    : undefined;

  const metadata = await ringMetadata(
    { title: product.seoTitle ?? product.name, description },
    canonical ?? `/producto/${product.slug}`
  );
  return {
    ...metadata,
    title: product.seoTitle ?? product.name,
    ...(isConceptProduct(product.slug) || slug !== product.slug
      ? { robots: { index: false, follow: true } }
      : {}),
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      ...metadata.openGraph,
      title: product.name,
      description,
      type: "website",
      ...(canonical ? { url: canonical } : {}),
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                width: OG_IMAGE_SIZE.width,
                height: OG_IMAGE_SIZE.height,
                alt: merchantPhotos[0]?.alt ?? product.name,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ variante?: string | string[] }>;
}) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  // El notFound() va acá y no en generateMetadata: lanzado desde el metadata,
  // Next dibuja el 404 pero responde 200. Por lo mismo esta ruta no tiene
  // loading.tsx — ese Suspense manda el shell, y con él el status, antes de
  // que sepamos si el producto existe.
  if (!product) {
    const redirect = await getProductSlugRedirect(slug);
    if (redirect) {
      const originalQuery = await searchParams;
      permanentRedirect(
        typeof originalQuery.variante === "string"
          ? variantUrl(`/producto/${redirect}`, originalQuery.variante)
          : `/producto/${redirect}`
      );
    }
    notFound();
  }
  const query = await searchParams;
  if (slug !== product.slug) {
    permanentRedirect(
      typeof query.variante === "string"
        ? variantUrl(`/producto/${product.slug}`, query.variante)
        : `/producto/${product.slug}`
    );
  }
  const specifications = product.verifiedSpecifications;
  const unitText =
    specifications?.unit === "pair"
      ? "Par de dos anillos"
      : specifications?.unit === "individual"
        ? "Un anillo"
        : isConceptProduct(product.slug)
          ? priceUnit(product.categorySlug)
          : "Unidad por confirmar";
  const guidance = productGuidance({
    categorySlug: product.categorySlug,
    specifications,
    factsVerified: Boolean(specifications),
    concept: isConceptProduct(product.slug),
  });

  const cheapest = product.variants
    .filter(
      (variant) =>
        Number.isSafeInteger(variant.pricePyg) && variant.pricePyg > 0
    )
    .reduce<number | undefined>(
      (min, variant) =>
        min === undefined || variant.pricePyg < min ? variant.pricePyg : min,
      undefined
    );
  const totalAvailable = product.variants.reduce(
    (total, variant) => total + variant.available,
    0
  );

  // Misma categoría, con stock, precio parecido. Sin nada que mostrar la
  // sección no se dibuja: una fila vacía o con un solo producto de relleno es
  // peor que no tenerla.
  const related = await getRelatedProducts({
    productId: product.id,
    categorySlug: product.categorySlug,
    brand: product.brand,
    pricePyg: cheapest,
  });

  // Reseñas verificadas: sólo las aprobadas (`src/domain/reviews.ts`). Sin
  // ninguna, no se dibuja nada — ni estrellas vacías ni "sé la primera".
  const [rating, reviews, ajustes] = await Promise.all([
    getProductRatingSummary(product.id),
    listApprovedReviews(product.id),
    getStoreSettings(),
  ]);

  // Al WhatsApp **público** (`/admin/ajustes`, o `WHATSAPP_NUMBER`).
  const waHref =
    product.saleMode === "showcase"
      ? null
      : await waLinkPublico(
          t("producto.consultaWhatsApp", { nombre: product.name })
        );

  // Para el link de consulta por variante (`variant-inquiry-link.tsx`, cliente):
  // el teléfono sale de los ajustes o de una variable sin `NEXT_PUBLIC_`, así
  // que se resuelve acá, en el servidor, y se pasa ya normalizado — el
  // componente cliente nunca lee `process.env` ni la base.
  const whatsappPhone =
    product.saleMode === "showcase" ? null : await whatsappPublico();
  const inquiryLinks = await productInquiryLinks(product);
  const origin = siteOrigin();
  const productUrl = origin
    ? `${origin.origin}/producto/${product.slug}`
    : null;

  // JSON-LD: PYG y priceValidUntil no se inventan — se dejan afuera si no
  // hay dato, que es mejor que un dato falso en el rich result. Lo arma
  // `productJsonLd` (src/lib/seo.ts), que es maquinaria.
  const jsonLd = productJsonLd({
    origin,
    slug: product.slug,
    name: product.name,
    // Mismo motivo que arriba: el JSON-LD que lee Google es texto, no markdown.
    description: markdownToText(product.description),
    brand: product.brand,
    images: (isConceptProduct(product.slug)
      ? []
      : merchantImages(product.images)
    )
      .slice(0, 5)
      .map((image) => productImageUrl(image.cloudinaryId, "detail"))
      .filter((src): src is string => src !== null),
    variants: product.variants,
    saleMode: product.saleMode,
    showPrice: product.showPrice,
    specifications,
    rating,
    // Envío y devoluciones para Google, sólo con lo que el dueño cargó.
    merchant: ajustes.envioDevolucion,
    reviews: reviews.map((review) => ({
      author: review.authorName,
      rating: review.rating,
      title: review.title,
      body: review.body,
      date: review.createdAt,
    })),
  });
  const gallery = product.images.slice(0, 5).flatMap((image) => {
    const src = productImageUrl(image.cloudinaryId, "detail");
    return src
      ? [
          {
            src,
            thumbnailSrc: productImageUrl(image.cloudinaryId, "thumb") ?? src,
            alt: image.alt ?? product.name,
            illustrative: !verifiedProductImage(image),
            evidencePending:
              !verifiedProductImage(image) &&
              image.provenance !== "illustrative",
          },
        ]
      : [];
  });
  const breadcrumbs = breadcrumbJsonLd(origin, [
    { name: t("nav.inicio"), path: "/" },
    { name: product.categoryName, path: `/categoria/${product.categorySlug}` },
    { name: product.name, path: `/producto/${product.slug}` },
  ]);

  return (
    <main className="product-editorial">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([breadcrumbs, jsonLd]),
        }}
      />

      <nav aria-label="Ruta de navegación" className="product-breadcrumbs">
        <Link href="/" className="hover:text-foreground">
          {t("nav.inicio")}
        </Link>
        <span aria-hidden> / </span>
        <Link
          href={`/categoria/${product.categorySlug}`}
          className="hover:text-foreground"
        >
          {product.categoryName}
        </Link>
        <span aria-hidden> / </span>
        <span>{product.name}</span>
      </nav>

      <div className="product-hero">
        <div className="product-visual">
          {gallery.length || isConceptProduct(product.slug) ? (
            <ProductGallery
              images={gallery.length ? gallery : PRODUCT_PLACEHOLDERS}
            />
          ) : (
            <div
              className="product-photo-pending"
              role="img"
              aria-label="Fotografía del producto en preparación"
            >
              <span>Foto en preparación</span>
              <p>La fotografía de esta pieza todavía no está disponible.</p>
            </div>
          )}
        </div>

        <div className="product-summary">
          <p className="product-eyebrow">
            {product.brand ?? product.categoryName}
          </p>
          <h1 className="product-title">{product.name}</h1>
          <p className="product-unit" data-testid="ring-price-unit">
            {unitText}
          </p>
          {isConceptProduct(product.slug) ? (
            <p
              className="product-concept-note"
              data-testid="ring-concept-notice"
            >
              {CONCEPT_NOTICE}
            </p>
          ) : null}
          <div className="product-help-links">
            <Link href="/guias/talles" className="underline underline-offset-4">
              Cómo medir tu talle
            </Link>
            <Link
              href="/guias/cuidados"
              className="underline underline-offset-4"
            >
              Cuidados
            </Link>
            <Link href="/contacto" className="underline underline-offset-4">
              Cómo consultar
            </Link>
            <Link
              href={comparisonUrl([product.slug])}
              className="underline underline-offset-4"
            >
              Comparar piezas
            </Link>
          </div>
          {rating.count >= 1 ? (
            <a
              href="#resenas"
              data-testid={TESTIDS.productRatingSummary}
              className="text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-2 text-sm"
            >
              <RatingStars value={rating.average} />
              <span>
                {tPlural("producto.resenas.resumen", rating.count, {
                  promedio: formatRating(rating.average),
                })}
              </span>
            </a>
          ) : null}

          {/* `id` para la barra de compra móvil (`StickyBuyBar`), que trae
              de vuelta hasta acá. */}
          <div id={BLOQUE_COMPRA_ID} className="product-purchase scroll-mt-24">
            <AddToCart
              product={{
                slug: product.slug,
                name: product.name,
                saleMode: product.saleMode,
                showPrice: product.showPrice,
                variants: product.variants.map(
                  ({ id, sku, label, pricePyg, compareAtPyg, available }) => ({
                    id,
                    sku,
                    label,
                    pricePyg,
                    compareAtPyg,
                    available,
                  })
                ),
              }}
              inquiryLinks={inquiryLinks}
              stockAlertsEnabled={stockAlertsEnabled()}
              whatsappPhone={whatsappPhone}
              productUrl={productUrl}
              initialVariantSku={
                typeof query.variante === "string" ? query.variante : undefined
              }
            />
            <WishlistButton
              slug={product.slug}
              name={product.name}
              sku={
                (
                  product.variants.find(
                    (variant) => variant.pricePyg === cheapest
                  ) ?? product.variants[0]
                )?.sku
              }
              pricePyg={
                product.showPrice === false
                  ? undefined
                  : (cheapest ?? product.variants[0]?.pricePyg)
              }
              size="inline"
            />
          </div>

          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground mt-4 inline-block text-sm underline"
            >
              {t("producto.dudaWhatsApp")}
            </a>
          ) : null}

          {(product.saleMode ?? "stock") === "stock" &&
          product.showPrice !== false ? (
            <dl className="product-stock-details">
              <dt>{t("producto.iva")}</dt>
              <dd className="text-foreground">
                {t("producto.ivaValor", { tasa: product.ivaRate })}
              </dd>
              <dt>{t("producto.disponibilidad")}</dt>
              <dd className="text-foreground">
                {totalAvailable > 0
                  ? t("producto.unidades", { n: totalAvailable })
                  : t("stock.sin")}
              </dd>
              {cheapest !== undefined ? (
                <>
                  <dt>{t("producto.desde")}</dt>
                  <dd className="text-foreground tabular-nums">
                    {formatGs(cheapest)}
                  </dd>
                </>
              ) : null}
            </dl>
          ) : null}
        </div>
      </div>

      <section
        className="product-details"
        aria-labelledby="product-details-heading"
      >
        <div className="product-section-intro">
          <p className="product-eyebrow">La pieza, de cerca</p>
          <h2 id="product-details-heading">Detalles para elegir con calma</h2>
          <p>
            El diseño es el comienzo. La unidad, las medidas y la información de
            la ficha ayudan a elegir una pieza que tenga sentido para vos.
          </p>
          <Link
            href={`/categoria/${product.categorySlug}`}
            className="product-text-link"
          >
            Explorar {product.categoryName} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="product-detail-content">
          {product.description ? (
            <div className="product-description">
              <h3>{t("producto.descripcion")}</h3>
              <ProductDescription markdown={product.description} />
            </div>
          ) : null}
          <dl className="product-reference-details">
            <div>
              <dt>Colección</dt>
              <dd>
                <Link href={`/categoria/${product.categorySlug}`}>
                  {product.categoryName}
                </Link>
              </dd>
            </div>
            <div>
              <dt>Unidad de venta</dt>
              <dd>{unitText}</dd>
            </div>
            {specifications?.material ? (
              <div>
                <dt>Material confirmado</dt>
                <dd>
                  {specifications.material}
                  {specifications.purity ? ` · ${specifications.purity}` : ""}
                </dd>
              </div>
            ) : null}
            {specifications?.stone ? (
              <div>
                <dt>Piedra</dt>
                <dd>{specifications.stone}</dd>
              </div>
            ) : null}
            {specifications?.widthMm ? (
              <div>
                <dt>Ancho de banda</dt>
                <dd>{specifications.widthMm.toLocaleString("es-PY")} mm</dd>
              </div>
            ) : null}
            {product.variants
              .filter(
                (variant) =>
                  variant.attributes?.sizeLabel ||
                  variant.attributes?.interiorMm
              )
              .map((variant) => (
                <div key={variant.sku}>
                  <dt>{variant.label}</dt>
                  <dd>
                    {[
                      variant.attributes?.sizeSystem,
                      variant.attributes?.sizeLabel,
                      variant.attributes?.interiorMm
                        ? `${variant.attributes.interiorMm} mm de diámetro interior`
                        : null,
                      variant.attributes?.interiorMmSecond
                        ? `segunda pieza: ${variant.attributes.interiorMmSecond} mm`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </dd>
                </div>
              ))}
            <div>
              <dt>Medidas</dt>
              <dd>
                Revisá las opciones de esta ficha y la escala del proveedor.{" "}
                <Link href="/guias/talles">Ver guía de talles</Link>.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section
        className="product-faq store-prose ring-faq"
        aria-label="Información para elegir esta pieza"
      >
        <h2>Antes de elegir este anillo</h2>
        {guidance.faq.map((faq) => (
          <details key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
        <details>
          <summary>¿Qué debe incluir una propuesta de compra?</summary>
          <p>
            Modelo real, talle, cantidad de piezas, precio final en guaraníes y
            condiciones de entrega, ajustes y cambios. Confirmá esos datos antes
            de pagar.
            {isConceptProduct(product.slug)
              ? " Los conceptos no se venden ni se reservan."
              : ""}
          </p>
        </details>
        <p className="mt-5">
          {guidance.related.map((link, index) => (
            <span key={link.href}>
              {index ? " · " : ""}
              <Link href={link.href}>{link.label}</Link>
            </span>
          ))}
          {" · "}
          <Link href="/como-funciona">Disponibilidad y entrega</Link>
        </p>
      </section>

      {reviews.length > 0 ? (
        <section
          id="resenas"
          data-testid={TESTIDS.productReviewsSection}
          className="product-reviews scroll-mt-24"
        >
          <h2 className="text-lg font-semibold tracking-tight">
            {t("producto.resenas.titulo")}
          </h2>
          <ul className="mt-4 grid gap-6">
            {reviews.map((review) => (
              <li key={review.id} className="text-sm">
                <RatingStars value={review.rating} />
                {review.title ? (
                  <p className="mt-1 font-medium">{review.title}</p>
                ) : null}
                <p className="mt-1 whitespace-pre-line">{review.body}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {review.authorName} · {formatDatePY(review.createdAt)} ·{" "}
                  {t("producto.resenas.compraVerificada")}
                </p>
                {review.ownerReply ? (
                  <div className="border-border bg-muted/40 mt-2 rounded-lg border p-3">
                    <p className="text-xs font-medium">
                      {t("producto.resenas.respuesta")}
                    </p>
                    <p className="mt-1 whitespace-pre-line">
                      {review.ownerReply}
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="product-related">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("producto.relacionados")}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      {ajustes.vidriera.barraCompraMovil &&
      (product.saleMode ?? "stock") === "stock" &&
      product.showPrice !== false &&
      product.variants.length > 0 ? (
        <StickyBuyBar
          targetId={BLOQUE_COMPRA_ID}
          name={product.name}
          price={cheapest !== undefined ? formatGs(cheapest) : null}
        />
      ) : null}

      {product.showPrice !== false && cheapest !== undefined ? (
        <RecentlyViewed
          current={{
            slug: product.slug,
            name: product.name,
            pricePyg: cheapest ?? product.variants[0]?.pricePyg ?? 0,
            imageCloudinaryId: product.images[0]?.cloudinaryId ?? null,
            imageAlt: product.images[0]?.alt ?? null,
            imageSrc: productImageUrl(product.images[0]?.cloudinaryId, "card"),
            imageProvenance: product.images[0]?.provenance ?? null,
            imageVerifiedAt:
              product.images[0]?.verifiedAt?.toISOString() ?? null,
          }}
        />
      ) : null}

      {/* "Vio el producto" para GA4/Meta (src/lib/funnel.ts), con el SKU de
          la variante más barata — el mismo id que el feed. */}
      {analyticsActivo() &&
      product.showPrice !== false &&
      product.variants[0] ? (
        <FunnelEvent
          event="view_item"
          items={[
            {
              id: (
                product.variants.find(
                  (variant) => variant.pricePyg === cheapest
                ) ?? product.variants[0]
              ).sku,
              name: product.name,
              pricePyg: cheapest ?? product.variants[0].pricePyg,
              qty: 1,
            },
          ]}
        />
      ) : null}
    </main>
  );
}
