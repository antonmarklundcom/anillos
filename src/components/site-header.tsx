import { Suspense } from "react";
import Link from "next/link";
import { CartButton } from "@/components/cart-button";
import { CuentaHeaderEntry } from "@/components/cuenta/header-entry";
import { SearchBox } from "@/components/search-box";
import { WishlistHeaderLink } from "@/components/wishlist-header-link";
import { getStoreCategories } from "@/store/catalog";
import { getStoreSettings } from "@/domain/store-settings";
import { TIENDA, logoPredeterminado } from "@/config/tienda";
import { storeIdentity } from "@/store/identity";
import { CollectionNavigation } from "@/components/collection-navigation";

export async function SiteHeader() {
  const [categories, marca, settings] = await Promise.all([
    getStoreCategories(),
    storeIdentity(),
    getStoreSettings(),
  ]);
  return (
    <header className="store-header bg-background/95 border-border sticky top-0 z-30 border-b backdrop-blur">
      <div className="border-border text-muted-foreground border-b py-2 text-center text-[9px] tracking-[.15em] uppercase">
        {settings.marca.tagline ?? TIENDA.tagline} · PARAGUAY
      </div>
      <div className="header-main mx-auto flex max-w-[1240px] items-center gap-5 px-5 py-4">
        <Link
          href="/"
          prefetch={false}
          className="brand-link shrink-0 font-[Georgia] text-[clamp(18px,5.3vw,23px)] font-normal tracking-[.08em] sm:text-[28px]"
        >
          {marca.logoUrl || logoPredeterminado(marca.nombre) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={marca.logoUrl ?? logoPredeterminado(marca.nombre)!}
              alt={marca.nombre}
              className="store-logo"
            />
          ) : (
            marca.nombre
          )}
        </Link>
        <Suspense fallback={null}>
          <SearchBox className="ml-auto hidden max-w-xs sm:block" />
        </Suspense>
        <div className="header-actions ml-auto flex items-center gap-3 sm:ml-0">
          <Suspense fallback={null}>
            <CuentaHeaderEntry />
          </Suspense>
          <WishlistHeaderLink />
          <CartButton />
        </div>
      </div>
      <div className="header-toolbar border-border border-t">
        <CollectionNavigation categories={categories} />
        <Suspense fallback={null}>
          <SearchBox className="mobile-search sm:hidden" />
        </Suspense>
      </div>
    </header>
  );
}
