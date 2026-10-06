import type { Metadata } from "next";
import Link from "next/link";
import { contactoPublico, waLinkPublico } from "@/lib/comercio";
import { ringMetadata } from "@/store/seo";
const pageSeo = {
  title: "Consultas sobre anillos en Paraguay",
  description:
    "Conocé el estado del catálogo y qué información preparar para consultar sobre materiales, medidas, precio por unidad o por par.",
};
export async function generateMetadata(): Promise<Metadata> {
  return ringMetadata(pageSeo, "/contacto");
}
export default async function ContactPage() {
  const [contact, whatsapp] = await Promise.all([
    contactoPublico(),
    waLinkPublico(
      "Quiero consultar sobre un anillo, su material, talle y precio final."
    ),
  ]);
  return (
    <main className="store-section">
      <p className="eyebrow">Hablemos de tu elección</p>
      <h1 className="article-heading mt-5">
        Consultas sobre anillos en Paraguay
      </h1>
      <div className="store-prose mt-8">
        <p>
          Estamos preparando el catálogo y evaluando opciones de suministro.
          Todavía no tenemos inventario ni acuerdos de fabricación o despacho
          confirmados. Los conceptos no se pueden comprar ni reservar.
        </p>
        <h2>Qué preparar para una consulta</h2>
        <ul>
          <li>El diseño que te interesa y el material que querés comparar.</li>
          <li>
            Diámetro interior aproximado en milímetros. Para un par, las dos
            medidas.
          </li>
          <li>Tu presupuesto en guaraníes, indicando una pieza o el par.</li>
          <li>
            Ciudad de entrega y fecha deseada, para evaluar factibilidad sin
            prometer un plazo.
          </li>
        </ul>
        <h2>Canales de contacto</h2>
        {whatsapp || contact.email ? (
          <div className="flex flex-wrap gap-5">
            {whatsapp ? (
              <a
                className="store-button"
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                Consultá por WhatsApp ↗
              </a>
            ) : null}
            {contact.email ? (
              <a className="text-link" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            ) : null}
          </div>
        ) : (
          <p>
            El canal de atención comercial todavía no está habilitado.
            Publicaremos acá un contacto verificado cuando esté disponible. No
            recibimos consultas mediante un formulario ni guardamos tus datos en
            esta página.
          </p>
        )}
        {contact.direccion ? <p>{contact.direccion}</p> : null}
        {contact.horario ? <p>{contact.horario}</p> : null}
        <h2>Mientras tanto</h2>
        <p>
          <Link href="/guias/talles">Medí tu talle</Link>,{" "}
          <Link href="/guias/materiales">compará los materiales</Link> y revisá{" "}
          <Link href="/como-funciona">
            cómo funcionará la confirmación de productos y entrega
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
// This public route uses the template's per-request CSP nonce.
export const dynamic = "force-dynamic";
