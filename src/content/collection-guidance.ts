/** Questions to ask about a real piece; these are not promises about our concepts. */
export const COLLECTION_GUIDANCE: Record<
  string,
  { heading: string; checks: string[] }
> = {
  acero: {
    heading: "Qué comparar en un anillo de acero",
    checks: [
      "Pedí la composición de la pieza y preguntá si el color es un recubrimiento.",
      "Compará ancho, perfil interior y diámetro en milímetros; confirmá las posibilidades de ajuste.",
      "Solicitá el precio final por una pieza, incluyendo grabado y entrega si se ofrecen.",
    ],
  },
  "plata-925": {
    heading: "Qué preguntar sobre la plata 925",
    checks: [
      "Confirmá si la pieza es plata 925 o un metal con baño de plata. La fotografía no acredita la composición.",
      "Pedí diámetro interior, ancho y detalles de piedras o recubrimientos si los tiene.",
      "Consultá cuidados y condiciones de ajuste o cambio antes de decidir.",
    ],
  },
  "alianzas-plata": {
    heading: "Una elección para dos",
    checks: [
      "Confirmá que la propuesta incluye un par de dos anillos y qué material tiene cada uno.",
      "Anotá dos medidas independientes y compará el ancho y perfil que le resulta cómodo a cada persona.",
      "Pedí el total del par y confirmación de grabado, ajustes y fecha de entrega antes de pagar.",
    ],
  },
  "alianzas-oro": {
    heading: "Cómo comparar una cotización de oro",
    checks: [
      "Pedí quilataje, peso, ancho y construcción de cada pieza. El color por sí solo no identifica el metal.",
      "Verificá que la cotización incluye dos anillos con dos talles independientes.",
      "Compará el mismo contenido del pedido y confirmá los extras, ajustes y plazo por escrito.",
    ],
  },
  compromiso: {
    heading: "Un anillo de compromiso a tu medida",
    checks: [
      "Definí tu presupuesto y compará metal, altura del diseño y comodidad para el uso cotidiano.",
      "Pedí la identidad de la piedra y documentación cuando corresponda. Una imagen no permite certificar una gema.",
      "Si es una sorpresa, confirmá cómo se medirá el talle y las condiciones de cambio o ajuste antes de grabar o fabricar.",
    ],
  },
};
