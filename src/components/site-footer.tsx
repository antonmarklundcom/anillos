import Link from "next/link";
import { TIENDA } from "@/config/tienda";
import { COLLECTIONS } from "@/config/ring-store";
import { getStoreSettings } from "@/domain/store-settings";
import { contactoPublico } from "@/lib/comercio";
import { storeIdentity } from "@/store/identity";
import { paginasActivas } from "@/lib/paginas";

export async function SiteFooter() {
  const [settings, contact, pages, brand] = await Promise.all([
    getStoreSettings(),
    contactoPublico(),
    paginasActivas(),
    storeIdentity(),
  ]);
  return (
    <footer className="border-border border-t bg-[#eae8df]">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-6 py-14 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-[Georgia] text-2xl tracking-wide">
            {brand.nombre}
          </p>
          <p className="text-muted-foreground mt-4 leading-7">
            {settings.marca.tagline ?? TIENDA.tagline}
          </p>
          <p className="text-muted-foreground mt-4 text-xs leading-6">
            Catálogo conceptual. Imágenes ilustrativas generadas con IA. Compras
            aún no habilitadas.
          </p>
        </div>
        <div>
          <p className="eyebrow">Colecciones</p>
          <ul className="text-muted-foreground mt-5 space-y-3">
            {COLLECTIONS.map((item) => (
              <li key={item.slug}>
                <Link prefetch={false} href={`/categoria/${item.slug}`}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Elegí con información</p>
          <ul className="text-muted-foreground mt-5 space-y-3">
            <li>
              <Link prefetch={false} href="/guias/talles">
                Guía de talles
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/guias/materiales">
                Materiales
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/guias/cuidados">
                Cuidados
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/guias">
                Todas las guías
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Próximos pasos</p>
          <ul className="text-muted-foreground mt-5 space-y-3">
            <li>
              <Link prefetch={false} href="/contacto">
                Contacto y consultas
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/como-funciona">
                Disponibilidad y entrega
              </Link>
            </li>
            {contact.email ? (
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
            ) : null}
            {contact.direccion ? <li>{contact.direccion}</li> : null}
            {pages.map((page) => (
              <li key={page.slug}>
                <Link prefetch={false} href={`/${page.slug}`}>
                  {page.titulo}
                </Link>
              </li>
            ))}
            {contact.redes.map((network) => (
              <li key={network.red}>
                <a href={network.url} target="_blank" rel="noopener noreferrer">
                  {network.red}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-border text-muted-foreground mx-6 flex flex-wrap justify-between gap-3 border-t py-6 text-[10px]">
        <span>
          © {new Date().getFullYear()} {brand.nombre}
        </span>
        <span>Una pieza o un par. Siempre con claridad.</span>
      </div>
    </footer>
  );
}
