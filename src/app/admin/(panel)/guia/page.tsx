import type { Metadata } from "next";
import Link from "next/link";

import { requireCapabilityPage } from "@/lib/admin-guard";
import { cuentasClientesHabilitadas } from "@/lib/cuentas";
import { nombreTienda } from "@/lib/marca";

export const metadata: Metadata = {
  title: "Guía básica del panel",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const MODULES = [
  [
    "/admin",
    "Resumen",
    "Revisá pedidos pendientes, stock bajo y avisos operativos. Los avisos ayudan a encontrar tareas; no sustituyen una prueba completa de compra.",
  ],
  [
    "/admin/productos",
    "Productos",
    "Creá y editá fichas, variantes, imágenes, precios y stock. Revisá cada variante y su disponibilidad antes de activar un producto.",
  ],
  [
    "/admin/categorias",
    "Categorías",
    "Organizá el catálogo y controlá qué categorías se muestran en la tienda.",
  ],
  [
    "/admin/pedidos",
    "Pedidos",
    "Abrí cada pedido para revisar sus datos, comprobantes y estado. Confirmá el cobro real antes de darlo por cobrado y seguí las acciones de preparación, despacho y entrega del panel.",
  ],
  [
    "/admin/ajustes",
    "Ajustes",
    "Administrá identidad, contacto, políticas y opciones de la vidriera. Publicá únicamente condiciones comerciales que puedas cumplir.",
  ],
  [
    "/admin/banco",
    "Banco",
    "Verificá los datos de la cuenta receptora de transferencias. Revisá titular, banco y número antes de compartirlos con compradores.",
  ],
  [
    "/admin/envios",
    "Envíos",
    "Configurá zonas, costos y métodos de entrega con sus medios de pago permitidos. Confirmá cobertura y plazos fuera del sistema antes de anunciarlos.",
  ],
  [
    "/admin/integraciones",
    "Integraciones",
    "Revisá Cloudinary para fotos de productos y comprobantes de transferencia, y un contacto real de WhatsApp. Pagopar y mensajes automatizados son opcionales y necesitan configuración y comprobaciones propias.",
  ],
  [
    "/admin/usuarios",
    "Usuarios del panel",
    "Dale a cada persona su propia cuenta y el rol adecuado. No compartas la contraseña del dueño.",
  ],
] as const;

const PRODUCT_CHECKS = [
  "Composición del metal, pureza y recubrimientos respaldados por el proveedor.",
  "Identidad de la piedra, origen y tratamientos cuando correspondan; una fotografía no confirma una gema.",
  "Precio final en guaraníes y unidad explícita: un anillo o un par de dos anillos.",
  "Talles en la escala del proveedor; para pares, dos medidas independientes.",
  "Stock real por variante, fotografía del producto y condiciones de ajuste o grabado.",
  "Disponibilidad, entrega, costos y condiciones de cambio confirmados antes de prometerlos.",
] as const;

export default async function AdminGuidePage() {
  await requireCapabilityPage("usuarios");
  const [brand, customerAccounts] = await Promise.all([
    nombreTienda(),
    cuentasClientesHabilitadas(),
  ]);

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-7">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Guía básica para administrar {brand}
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Empezá por los datos reales de la tienda y el catálogo. Después revisá
          cómo cobrar y entregar. Podés volver a esta guía desde el panel cuando
          necesites recordar dónde se hace cada tarea.
        </p>
        <nav
          aria-label="Contenido de la guía"
          className="mt-4 flex flex-wrap gap-3 text-sm"
        >
          <a href="#navegacion" className="underline underline-offset-4">
            Dónde hacer cada tarea
          </a>
          <a href="#catalogo" className="underline underline-offset-4">
            Preparar productos con IA
          </a>
          <a href="#revision" className="underline underline-offset-4">
            Revisar antes de vender
          </a>
          <a href="#accesos" className="underline underline-offset-4">
            Accesos y cuentas
          </a>
        </nav>
      </header>

      <section id="navegacion" className="scroll-mt-24">
        <h2 className="text-lg font-semibold">Dónde hacer cada tarea</h2>
        <dl className="mt-3 grid gap-3">
          {MODULES.map(([href, title, description]) => (
            <div key={href} className="rounded-xl border p-4">
              <dt>
                <Link
                  href={href}
                  className="font-medium underline underline-offset-4"
                >
                  {title}
                </Link>
              </dt>
              <dd className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {description}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="catalogo" className="scroll-mt-24 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">
          Preparar productos y textos con IA
        </h2>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Usá tus datos de Google Keyword Planner para Paraguay y español junto
          con las fichas confirmadas de los proveedores. La IA puede ayudarte a
          organizar categorías y redactar borradores de títulos, descripciones y
          preguntas frecuentes. Las palabras clave orientan el texto: no prueban
          composición, calidad, disponibilidad ni precio de una pieza.
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Agrupá las variantes que significan lo mismo en una página o sección,
          sin crear una página por cada forma de escribir. Los números idénticos
          de variantes cercanas se cuentan una vez según el archivo de datos. No
          crees páginas dirigidas a marcas competidoras ni repitas palabras de
          forma artificial. Guardá como pendiente cualquier dato que falte.
        </p>
        <h3 className="mt-4 font-medium">Antes de publicar una ficha real</h3>
        <ul className="text-muted-foreground mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed">
          {PRODUCT_CHECKS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="bg-muted/40 mt-4 rounded-lg p-3 text-sm leading-relaxed">
          Los cinco ejemplos ilustrativos con slugs <code>concepto-*</code> son
          referencias de diseño. No se pueden comprar, están marcados noindex y
          no se incluyen en el sitemap. Conservá esa separación: creá los
          productos reales con slugs nuevos. No conviertas esos ejemplos en
          ofertas ni agregues especificaciones imaginadas para completar una
          ficha.
        </p>
        <Link
          href="/admin/productos/nuevo"
          className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
        >
          Crear un producto con datos confirmados
        </Link>
      </section>

      <section id="revision" className="scroll-mt-24">
        <h2 className="text-lg font-semibold">Revisar antes de vender</h2>
        <ol className="text-muted-foreground mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>
            Revisá la ficha pública de cada producto: imágenes, unidad, talles,
            precio y disponibilidad deben corresponder a lo que vas a entregar.
          </li>
          <li>
            Verificá contacto, políticas, cuenta bancaria y métodos de entrega.
            No anuncies cobertura ni plazos sin confirmación.
          </li>
          <li>
            Configurá Cloudinary para las imágenes de productos y para que el
            comprador pueda subir su comprobante de transferencia. Comprobá la
            carga de imágenes y comprobantes en una prueba controlada. Confirmá
            también el número real de WhatsApp que vas a usar para atender
            consultas y pedidos; el contacto es distinto de los mensajes
            automatizados.
          </li>
          <li>
            Comprobá el recorrido del carrito y checkout con un producto real y
            revisá las opciones disponibles. Acordá una prueba controlada antes
            de enviar un pedido o realizar un cobro.
          </li>
          <li>
            Confirmá cómo vas a verificar pagos y atender pedidos. Si activás
            Pagopar o mensajes automatizados, comprobá esos servicios por
            separado.
          </li>
        </ol>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Entrar al panel sólo confirma tu acceso. Esta guía no certifica que el
          catálogo, los pagos, las entregas o las integraciones estén listos.
          Revisá los avisos del{" "}
          <Link href="/admin" className="underline underline-offset-4">
            resumen
          </Link>{" "}
          y el estado configurado en{" "}
          <Link
            href="/admin/integraciones"
            className="underline underline-offset-4"
          >
            integraciones
          </Link>
          .
        </p>
        <Link
          href="/"
          className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
        >
          Revisar la tienda pública
        </Link>
      </section>

      <section id="accesos" className="scroll-mt-24 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Accesos y cuentas</h2>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Tu cuenta del panel administra la tienda. Las cuentas de clientes son
          una función separada y actualmente están{" "}
          {customerAccounts ? "habilitadas" : "deshabilitadas"}. Crear un dueño
          no activa cuentas de compradores; esa opción se revisa en ajustes. Los
          compradores pueden hacer pedidos como invitados.
        </p>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Después de comprobar que podés volver a entrar en el login habitual,
          eliminá <code>SETUP_SECRET</code> del entorno del hosting y hacé un
          redeploy para cerrar la configuración inicial. Conservá tu contraseña
          y no la compartas: cada colaborador debe usar su propia cuenta del
          panel.
        </p>
        <h3 className="mt-4 font-medium">Recuperar el acceso del dueño</h3>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          La recuperación automática por correo todavía no está implementada.
          Actualmente, una persona con acceso autorizado al servidor puede
          ejecutar <code>pnpm create-owner</code> en esta aplicación con el
          mismo correo del dueño y una contraseña nueva. El comando actualiza la
          contraseña y cierra las sesiones anteriores; después podés volver al
          login habitual. Pedile ayuda a quien administra el servidor si no
          tenés ese acceso.
        </p>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Se está investigando correo con Cloudflare para una recuperación
          futura. Esa opción aún no está habilitada y no reemplaza el método
          manual actual.
        </p>
        <Link
          href="/admin/bienvenida"
          className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
        >
          Volver a los primeros pasos
        </Link>
      </section>
    </div>
  );
}
