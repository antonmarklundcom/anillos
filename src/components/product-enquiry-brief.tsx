import Link from "next/link";
import { EnquiryComposer } from "@/components/enquiry-composer";
import type { EnquiryProduct } from "@/store/enquiry-draft";

export function ProductEnquiryBrief({
  categorySlug,
  href,
  product,
}: {
  categorySlug: string;
  href: string | null;
  product?: EnquiryProduct;
}) {
  const pair = ["alianzas", "alianzas-plata", "alianzas-oro"].includes(
    categorySlug
  );
  return (
    <aside
      className="product-enquiry-brief"
      aria-labelledby="enquiry-brief-heading"
      data-testid="product-enquiry-brief"
    >
      <p className="eyebrow">De la idea a una pieza real</p>
      <h2 id="enquiry-brief-heading">Prepará tu consulta</h2>
      <ol>
        <li>
          <span>01</span>
          <div>
            <strong>Qué te gusta</strong>
            <p>
              Contanos el diseño y qué detalle querés conservar. Pedí fotos
              reales del modelo.
            </p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <strong>
              {pair ? "Cuántas piezas y qué medidas" : "Cantidad y medida"}
            </strong>
            <p>
              {pair
                ? "Indicá si buscás una pieza o dos y la medida de cada persona; la colección no confirma la unidad de venta."
                : "Indicá cantidad y medida interior si la conocés; el talle debe confirmarse con la escala del modelo."}
            </p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <strong>Ciudad y fecha deseada</strong>
            <p>
              Nos ayudan a entender tu consulta. Precio, disponibilidad y
              entrega quedan por confirmar.
            </p>
          </div>
        </li>
      </ol>
      {product ? (
        <EnquiryComposer
          products={[product]}
          whatsappHref={href}
          draftKey={product.slug}
        />
      ) : href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="product-enquiry-link"
          data-testid="product-enquiry-brief-link"
        >
          Completar consulta en WhatsApp <span aria-hidden>↗</span>
        </a>
      ) : (
        <Link href="/como-funciona" className="product-enquiry-link">
          Ver cómo consultar <span aria-hidden>↗</span>
        </Link>
      )}
      <p className="product-enquiry-note">
        La consulta no crea un pedido, reserva ni pago.
      </p>
    </aside>
  );
}
