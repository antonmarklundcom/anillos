import Link from "next/link";

/** Paused checkout collects no buyer data and creates no order or reservation. */
export function CheckoutEnquiry({
  contactHref,
}: {
  contactHref: string | null;
}) {
  return (
    <main className="store-section">
      <h1 className="article-heading">Consultá por WhatsApp</h1>
      <div className="store-prose mt-6">
        <p>
          Estamos explorando qué diseños te interesan. Esta consulta no crea un
          pedido ni una reserva y no solicita ningún pago.
        </p>
        <p>
          Contanos el diseño, las medidas aproximadas, tu presupuesto y la
          ciudad de entrega. Modelo real, material, precio y plazo quedan por
          confirmar; consultar por una pieza a pedido no confirma que podamos
          conseguirla.
        </p>
        {contactHref ? (
          <a
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            className="store-button"
            data-testid="checkout-enquiry-link"
          >
            Continuar consulta por WhatsApp ↗
          </a>
        ) : (
          <p>El canal de WhatsApp todavía no está habilitado.</p>
        )}
        <p>
          <Link href="/colecciones">Explorar diseños</Link> ·{" "}
          <Link href="/contacto">Contacto y consultas</Link>
        </p>
      </div>
    </main>
  );
}
