"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { TESTIDS } from "@/lib/testids";
import { COLLECTION_NAV_LABELS } from "@/config/ring-display";

const subscribe = (callback: () => void) => {
  const query = window.matchMedia("(max-width: 639px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const mobileSnapshot = () => window.matchMedia("(max-width: 639px)").matches;
const serverSnapshot = () => false;

export function CollectionNavigation({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const mobile = useSyncExternalStore(
    subscribe,
    mobileSnapshot,
    serverSnapshot
  );
  const details = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (details.current) details.current.open = false;
  }, [pathname]);
  const links = (
    <>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/categoria/${category.slug}`}
          prefetch={false}
          data-testid={TESTIDS.headerCategoryLink}
          data-slug={category.slug}
          aria-label={category.name}
        >
          {mobile
            ? category.name
            : (COLLECTION_NAV_LABELS[category.slug] ?? category.name)}
        </Link>
      ))}
      <Link href="/guias" prefetch={false}>
        Guías
      </Link>
      <Link href="/contacto" prefetch={false}>
        Contacto
      </Link>
    </>
  );
  return mobile ? (
    <details ref={details} className="collection-menu">
      <summary>
        Colecciones <span aria-hidden="true">⌄</span>
      </summary>
      <nav aria-label="Colecciones y guías">{links}</nav>
    </details>
  ) : (
    <nav aria-label="Colecciones y guías" className="collection-navigation">
      {links}
    </nav>
  );
}
