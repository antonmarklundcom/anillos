import type { PaginaSlug } from "@/domain/store-settings-schema";

/**
 * Los textos con los que arrancan las páginas de políticas (`/envios`,
 * `/devoluciones`, `/preguntas-frecuentes`, `/terminos`, `/privacidad`).
 *
 * **Son un punto de partida, no un texto legal.** Cortos, en voseo, sin
 * números de ley ni promesas que la tienda quizás no cumple: el panel los
 * muestra con el aviso "Texto por defecto — revisalo antes de publicar"
 * hasta que el dueño guarda el suyo desde `/admin/ajustes`.
 *
 * Es piel (NEW-STORE.md §5): una tienda puede reescribir este archivo entero.
 * El formato es el markdown chico de `src/lib/markdown.ts` —párrafos,
 * `**negrita**`, `*cursiva*`, listas con `- ` y links `https://`; sin
 * encabezados— y los `{{…}}` se reemplazan al dibujar la página
 * (`src/lib/placeholders.ts`). Uno sin dato nunca sale crudo: sale una frase
 * que se lee bien ("a coordinar por WhatsApp").
 */
export const PAGINAS_DEFAULT: Readonly<Record<PaginaSlug, { titulo: string; cuerpo: string }>> = {
  envios: {
    titulo: "Envíos",
    cuerpo: `Estamos evaluando el interés en los diseños del catálogo. No tenemos cobertura, retiro, costos ni plazos de entrega confirmados.

**Antes de acordar una entrega**
Deberán confirmarse el modelo real, proveedor, ciudad, responsable del despacho, costo y plazo. Una fecha deseada en una consulta no es una fecha de entrega prometida.

**Consultas**
Esta etapa no acepta pedidos, reservas ni pagos. Consultar por una pieza a pedido no confirma que podamos conseguirla.

**¿Dudas con tu envío?**
- WhatsApp: {{whatsapp}}
- Email: {{email}}
- Horario de atención: {{horario}}`,
  },
  devoluciones: {
    titulo: "Cambios y devoluciones",
    cuerpo: `{{tienda}} está en etapa de consultas. Todavía no acepta pedidos ni pagos por los diseños conceptuales.

**Condiciones por confirmar**
Antes de vender una pieza real deberán definirse los plazos, costos, procedimiento de cambios y devoluciones y la atención de defectos. No hay un punto de retiro o devolución confirmado.

**Talles y grabado**
La posibilidad y el costo de ajustar un talle o grabar una pieza dependen del modelo y proveedor. También deberán aclararse las condiciones de las piezas personalizadas antes de aceptar un pedido. No hay servicio de grabado confirmado.

**Contacto**
- WhatsApp: {{whatsapp}}
- Email: {{email}}`,
  },
  "preguntas-frecuentes": {
    titulo: "Preguntas frecuentes",
    cuerpo: `**¿Cómo compro?**
Por ahora podés explorar y consultar por WhatsApp. La consulta no crea un pedido ni una reserva.

**¿Cómo puedo pagar?**
No solicitamos pagos en esta etapa de consultas.

**¿Los precios incluyen IVA?**
Los conceptos no tienen precio de venta. El precio final y su tratamiento fiscal deberán confirmarse para una pieza real.

**¿Hacen envíos?**
Cobertura, costos, retiro y plazos quedan por confirmar. No prometemos envío a todo el país.

**¿Cómo sigo mi pedido?**
En esta etapa no se generan pedidos para seguir.

**¿Dónde están?**
- Dirección: {{direccion}}
- Horario: {{horario}}

**¿Otra consulta?**
- WhatsApp: {{whatsapp}}
- Email: {{email}}`,
  },
  terminos: {
    titulo: "Términos y condiciones",
    cuerpo: `{{tienda}} ({{url}}) está en etapa de consultas para evaluar el interés en diseños de anillos.

**Precios**
Los conceptos no tienen precio de venta. Modelo real, material, talles, unidad, precio final y tratamiento fiscal deberán confirmarse antes de cualquier futura venta.

**Pedidos y stock**
Las imágenes ilustrativas no acreditan mercadería disponible. Una consulta no confirma suministro, no crea un pedido y no reserva stock.

**Pagos**
No solicitamos pagos en esta etapa.

**Envíos, cambios y devoluciones**
Cobertura, plazos, costos, ajustes, grabado, cambios y devoluciones siguen por definir. Se deberán publicar las condiciones verificadas antes de aceptar pedidos.

**Contacto**
- WhatsApp: {{whatsapp}}
- Email: {{email}}`,
  },
  privacidad: {
    titulo: "Política de privacidad",
    cuerpo: `En {{tienda}} cuidamos tus datos.

**Qué datos pedimos**
Tu nombre, teléfono, dirección de entrega y, si querés factura, tu RUC o cédula. Los usamos para preparar, cobrar y entregar tu pedido, y para avisarte cómo va.

**Qué no hacemos**
No vendemos ni compartimos tus datos con terceros para publicidad. Sólo los compartimos con quien hace falta para completar tu compra, como el servicio de envío o el medio de pago que elegiste.

**Mensajes**
Te escribimos por WhatsApp sobre tu pedido. Sólo te mandamos promociones si nos diste permiso.

**Tus datos, tu decisión**
Si querés ver, corregir o borrar tus datos, escribinos.
- WhatsApp: {{whatsapp}}
- Email: {{email}}`,
  },
};
