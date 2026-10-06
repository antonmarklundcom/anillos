import type { Metadata } from "next";
import Link from "next/link";

import { requireCapabilityPage } from "@/lib/admin-guard";
import { nombreTienda } from "@/lib/marca";

export const metadata: Metadata = {
  title: "Bienvenida",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const FIRST_STEPS = [
  {
    title: "1. Revisá los datos de la tienda",
    description:
      "Completá identidad, contacto y políticas con información real. Confirmá cambios, devoluciones y condiciones antes de anunciarlos.",
    href: "/admin/ajustes",
    action: "Abrir ajustes",
  },
  {
    title: "2. Prepará el catálogo real",
    description:
      "Cargá productos con composición, precio en guaraníes, unidad, talles y stock confirmados. Los conceptos ilustrativos no son mercadería disponible.",
    href: "/admin/productos",
    action: "Revisar productos",
  },
  {
    title: "3. Organizá las categorías",
    description:
      "Ubicá cada producto en su categoría y revisá cuáles están activas. Una categoría desactivada también oculta sus productos de la vidriera.",
    href: "/admin/categorias",
    action: "Revisar categorías",
  },
  {
    title: "4. Confirmá cómo cobrar y entregar",
    description:
      "Revisá la cuenta para transferencias y las zonas, costos y métodos de entrega que realmente podés cumplir. Comprobá el recorrido de compra antes de aceptar pedidos.",
    href: "/admin/envios",
    action: "Configurar entregas",
  },
  {
    title: "5. Prepará imágenes y contacto",
    description:
      "Configurá Cloudinary para las imágenes de productos y la carga de comprobantes de transferencia. Confirmá un número real de WhatsApp para atender consultas y pedidos; no hace falta activar mensajes automatizados.",
    href: "/admin/integraciones",
    action: "Revisar imágenes y WhatsApp",
  },
] as const;

export default async function AdminWelcomePage() {
  await requireCapabilityPage("usuarios");
  const brand = await nombreTienda();

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <header>
        <p className="text-muted-foreground text-sm">Panel de {brand}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Ya tenés acceso al panel
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed">
          Tu sesión está activa y tenés acceso como dueño. Desde acá podés
          administrar la tienda. El acceso a tu cuenta y la preparación para
          vender son pasos distintos: revisá catálogo, cobros y entregas antes
          de abrir las ventas.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/guia"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium"
          >
            Empezar con la guía básica
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Ir al resumen
          </Link>
        </div>
      </header>

      <section aria-labelledby="essential-heading">
        <h2 id="essential-heading" className="text-lg font-semibold">
          Lo esencial antes de vender
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {FIRST_STEPS.map((step) => (
            <article key={step.href} className="rounded-xl border p-4">
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {step.description}
              </p>
              <Link
                href={step.href}
                className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
              >
                {step.action}
              </Link>
            </article>
          ))}
        </div>
        <Link
          href="/admin/banco"
          className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
        >
          Revisar los datos bancarios para transferencias
        </Link>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Revisá los avisos del{" "}
          <Link href="/admin" className="underline underline-offset-4">
            resumen
          </Link>{" "}
          y la configuración de{" "}
          <Link
            href="/admin/integraciones"
            className="underline underline-offset-4"
          >
            integraciones
          </Link>
          . Esta bienvenida no comprueba ni activa esos servicios.
        </p>
      </section>

      <section className="bg-muted/40 rounded-xl border p-4">
        <h2 className="font-semibold">Integraciones opcionales</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Pagopar y los mensajes automatizados requieren sus propias cuentas y
          configuración. Activá cada servicio sólo cuando lo necesites y puedas
          verificarlo. Crear tu usuario no configura estos servicios ni confirma
          que el checkout esté listo.
        </p>
        <Link
          href="/admin/integraciones"
          className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
        >
          Revisar integraciones
        </Link>
      </section>

      <aside className="rounded-xl border p-4">
        <h2 className="font-semibold">Cerrá la configuración inicial</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Una vez que verifiques que podés entrar con tu correo y contraseña en
          el login habitual, eliminá <code>SETUP_SECRET</code> de las variables
          de entorno del hosting y hacé un redeploy. Es la llave de
          configuración inicial; no hace falta para tu acceso diario. Si otra
          persona administra el hosting, pedile que complete este paso.
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Conservá tu contraseña en un lugar seguro. Para volver al panel, usá{" "}
          <Link href="/admin/login" className="underline underline-offset-4">
            el login de administración
          </Link>
          .
        </p>
      </aside>

      <aside className="rounded-xl border p-4">
        <h2 className="font-semibold">Si olvidás tu contraseña</h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          La recuperación automática por correo todavía no está implementada. La
          recuperación actual es manual: quien administra el servidor puede
          ejecutar <code>pnpm create-owner</code> en esta aplicación usando tu
          mismo correo de dueño y una contraseña nueva. Esto actualiza el acceso
          y cierra las sesiones anteriores. Compartí esa solicitud sólo con
          quien tenga acceso autorizado al servidor.
        </p>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Se está investigando una opción de correo con Cloudflare para una
          recuperación futura; todavía no está habilitada.
        </p>
      </aside>
    </div>
  );
}
