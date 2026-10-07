import type { Metadata } from "next";
import { Suspense } from "react";

import { WishlistView } from "@/components/wishlist-view";
import { t } from "@/i18n";
import { waLinkPublico } from "@/lib/comercio";
import { siteOrigin } from "@/lib/site-url";

/**
 * Favoritos sin cuenta: la lista vive en `localStorage` (o llega por `?p=`,
 * una lista compartida), así que esta página no tiene nada que indexar — es
 * distinta para cada navegador y `noindex` evita que Google intente.
 */
export const metadata: Metadata = {
  title: t("favoritos.meta"),
  robots: { index: false, follow: false },
};

export default async function FavoritosPage() {
  const whatsappHref = await waLinkPublico(
    "Hola, quiero consultar por mis favoritos."
  );
  const origin = siteOrigin()?.origin ?? null;
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* `useSearchParams` (por `?p=`) pide un límite de Suspense en el árbol. */}
      <Suspense fallback={null}>
        <WishlistView whatsappHref={whatsappHref} origin={origin} />
      </Suspense>
    </main>
  );
}
// This public route uses the template's per-request CSP nonce.
export const dynamic = "force-dynamic";
