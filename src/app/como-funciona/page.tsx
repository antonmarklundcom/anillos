import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Catálogo, disponibilidad y entrega",
  description:
    "Estado del catálogo conceptual, próximos pasos de confirmación y qué necesitás saber antes de cualquier compra o pedido.",
  alternates: { canonical: "/como-funciona" },
};
export default function FulfilmentPage() {
  return (
    <main className="store-section">
      <p className="eyebrow">Información antes de elegir</p>
      <h1 className="article-heading mt-5">Cómo funciona hoy.</h1>
      <article className="store-prose mt-8">
        <h2>Estamos en etapa de catálogo conceptual</h2>
        <p>
          No tenemos inventario propio. Las imágenes generadas con IA ilustran
          estilos y no representan mercadería verificada. No publicamos precios,
          stock, certificaciones ni fechas de entrega para esos conceptos. Las
          compras y reservas de conceptos están deshabilitadas.
        </p>
        <h2>Qué deberá confirmarse para cada producto</h2>
        <p>
          Un catálogo real necesita proveedor, ficha de material, fotos, medidas
          posibles, unidad vendida y precio final. Para alianzas, la propuesta
          debe aclarar si incluye un par de dos anillos, con dos talles
          independientes. Una imagen con varias piezas no define el contenido de
          un pedido.
        </p>
        <h2>Fabricación y despacho</h2>
        <p>
          En el futuro, un proveedor paraguayo podría fabricar o despachar una
          pieza. Todavía no hay acuerdos confirmados. Publicaremos quién
          gestiona la entrega, el costo y el plazo aplicable cuando exista
          información verificable. No hay retiro en local, cobertura nacional ni
          envío gratis confirmados.
        </p>
        <h2>Pagos, ajustes y cambios</h2>
        <p>
          No recibimos pagos por productos sin verificar. Los medios de pago se
          habilitarán sólo con configuración real y condiciones de cumplimiento
          acordadas. Las reglas de ajuste, grabado, cambios y devoluciones
          también deberán confirmarse antes de aceptar un pedido. Una guía de
          materiales no sustituye esas condiciones.
        </p>
        <h2>Explorá sin compromiso</h2>
        <p>
          Podés consultar nuestras <Link href="/colecciones">colecciones</Link>{" "}
          y <Link href="/guias">guías</Link>. En{" "}
          <Link href="/contacto">contacto</Link> verás los canales verificados
          cuando estén habilitados.
        </p>
      </article>
    </main>
  );
}
// This public route uses the template's per-request CSP nonce.
export const dynamic = "force-dynamic";
