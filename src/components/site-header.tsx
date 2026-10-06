import { Suspense } from "react";
import Link from "next/link";
import { CartButton } from "@/components/cart-button";
import { CuentaHeaderEntry } from "@/components/cuenta/header-entry";
import { SearchBox } from "@/components/search-box";
import { WishlistHeaderLink } from "@/components/wishlist-header-link";
import { getCategories } from "@/db/queries";
import { getStoreSettings } from "@/domain/store-settings";
import { COLLECTIONS } from "@/config/ring-store";
import { TIENDA } from "@/config/tienda";
import { marcaEfectiva } from "@/lib/marca";
import { TESTIDS } from "@/lib/testids";

export async function SiteHeader() {
  const [dbCategories, marca, settings] = await Promise.all([
    getCategories().catch(() => []),
    marcaEfectiva(),
    getStoreSettings(),
  ]);
  const categories = dbCategories.length
    ? dbCategories
    : COLLECTIONS.map((item, id) => ({ id, slug: item.slug, name: item.name }));
  return (
    <header className="store-header bg-background/95 border-border sticky top-0 z-30 border-b backdrop-blur">
      <div className="border-border text-muted-foreground border-b py-2 text-center text-[9px] tracking-[.15em] uppercase">
        {settings.marca.tagline ?? TIENDA.tagline} · PARAGUAY
      </div>
      <div className="mx-auto flex max-w-[1240px] items-center gap-5 px-5 py-5">
        <Link
          href="/"
          prefetch={false}
          className="font-[Georgia] text-[clamp(18px,5.3vw,23px)] font-normal tracking-[.08em] sm:text-[28px]"
        >
          {marca.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={marca.logoUrl}
              alt={marca.nombre}
              className="h-9 w-auto"
            />
          ) : (
            marca.nombre
          )}
        </Link>
        <Suspense fallback={null}>
          <SearchBox className="ml-auto hidden max-w-xs sm:block" />
        </Suspense>
        <div className="ml-auto flex items-center gap-3 sm:ml-0">
          <Suspense fallback={null}>
            <CuentaHeaderEntry />
          </Suspense>
          <WishlistHeaderLink />
          <CartButton />
        </div>
      </div>
      <nav aria-label="Colecciones y guías" className="border-border border-t">
        <div className="mx-auto flex max-w-[1240px] gap-6 overflow-x-auto px-5 py-3 text-[11px]">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categoria/${category.slug}`}
              prefetch={false}
              data-testid={TESTIDS.headerCategoryLink}
              data-slug={category.slug}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              {category.name}
            </Link>
          ))}
          <Link href="/guias" prefetch={false} className="shrink-0">
            Guías
          </Link>
          <Link href="/contacto" prefetch={false} className="shrink-0">
            Contacto
          </Link>
        </div>
      </nav>
      <div className="border-border border-t px-5 py-2 sm:hidden">
        <Suspense fallback={null}>
          <SearchBox />
        </Suspense>
      </div>
    </header>
  );
}
