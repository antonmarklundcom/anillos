/** Store presentation only. Confirmed goods enter through the existing admin. */
export const COLLECTIONS = [
  {
    slug: "acero",
    name: "Anillos de acero",
    eyebrow: "Un buen comienzo",
    image: "steel",
    unit: "individual",
    guide: "anillos-economicos",
    description:
      "Diseños simples para todos los días. Explorá el acero, compará acabados y aprendé qué preguntar antes de elegir una opción accesible. El catálogo inicial muestra conceptos ilustrativos: materiales, talles y precios requieren confirmación del proveedor.",
  },
  {
    slug: "plata-925",
    name: "Anillos de plata 925",
    eyebrow: "Pequeños detalles",
    image: "silver",
    unit: "individual",
    guide: "materiales",
    description:
      "La plata 925 permite explorar formas delicadas y un brillo discreto. Conocé la diferencia entre plata maciza, baños y recubrimientos, y elegí con información. Las imágenes actuales son ilustrativas y no acreditan la composición de una pieza real.",
  },
  {
    slug: "alianzas-plata",
    name: "Alianzas de plata",
    eyebrow: "De a dos",
    image: "pair",
    unit: "pair",
    guide: "alianzas-boda-civil",
    description:
      "Ideas de alianzas para una boda civil y para compartir cada día. Compará ancho, perfil y dos talles independientes. Esta colección está pensada para pares de dos anillos: cualquier cotización futura deberá indicar expresamente el precio del par y las medidas incluidas.",
  },
  {
    slug: "alianzas-oro",
    name: "Alianzas de oro",
    eyebrow: "Una historia compartida",
    image: "gold-pair",
    unit: "pair",
    guide: "materiales",
    description:
      "Explorá perfiles clásicos y aprendé a comparar quilataje, peso, ancho y acabados antes de pedir una cotización. El color de una imagen no confirma que sea oro. No hay precio ni fabricación confirmados; los futuros pares se cotizarán con los dos talles y la composición verificada.",
  },
  {
    slug: "compromiso",
    name: "Anillos de compromiso",
    eyebrow: "Tu manera de decirlo",
    image: "engagement",
    unit: "individual",
    guide: "compromiso-y-alianzas",
    description:
      "Un solitario, una banda simple o una forma distinta: la elección puede acompañar tu historia y tu presupuesto. Compará altura, comodidad y tipo de piedra. Los conceptos de esta colección no tienen composición, gemas ni certificaciones verificadas y no se pueden comprar.",
  },
  {
    slug: "promesa",
    name: "Anillos de promesa",
    eyebrow: "Un significado compartido",
    image: "silver",
    unit: "individual",
    guide: "compromiso-y-alianzas",
    description:
      "Conocé el significado de un anillo de promesa y compará diseños para una persona o una pareja. Prepará tu elección con material, talle y presupuesto claros.",
  },
  {
    slug: "solitarios",
    name: "Anillos solitarios",
    eyebrow: "Una piedra protagonista",
    image: "engagement",
    unit: "individual",
    guide: "piedras-para-anillos",
    description:
      "Compará el perfil, el engarce y los materiales de un solitario. Una forma no identifica su gema: conocé qué información pedir sobre la piedra y la montura.",
  },
  {
    slug: "alianzas",
    name: "Anillos de boda y alianzas",
    eyebrow: "Para ustedes dos",
    image: "pair",
    unit: "pair",
    guide: "alianzas-boda-civil",
    description:
      "Elegí sus anillos de boda con dos talles independientes. Compará alianzas de plata y oro, y prepará una consulta que aclare piezas, materiales y precio del par.",
  },
  {
    slug: "oro",
    name: "Anillos de oro",
    eyebrow: "Composición y diseño",
    image: "gold-pair",
    unit: "individual",
    guide: "materiales",
    description:
      "Aprendé a comparar anillos de oro por quilataje, peso y construcción. Conocé qué distingue una pieza de una aleación de oro de un baño dorado.",
  },
  {
    slug: "hombre",
    name: "Anillos para hombre",
    eyebrow: "Tu estilo cotidiano",
    image: "steel",
    unit: "individual",
    guide: "talles",
    description:
      "Explorá diseños de anillos para hombre y compará ancho, perfil y material. Elegí con una medida del dedo correcto y una ficha clara de la pieza.",
  },
] as const;

export const CONCEPTS = [
  {
    slug: "concepto-banda-acero",
    name: "Banda satinada · concepto",
    category: "acero",
    image: "steel",
    description:
      "Idea de banda sencilla con acabado satinado, pensada para explorar una opción accesible de uso cotidiano. El diseño es ilustrativo. Acero, ancho, composición y disponibilidad deben verificarse en una pieza real.",
  },
  {
    slug: "concepto-onda-plata",
    name: "Onda de plata · concepto",
    category: "plata-925",
    image: "silver",
    description:
      "Idea de anillo fino con una línea orgánica. La apariencia plateada de la ilustración no acredita plata 925. Antes de cualquier pedido deberá confirmarse la aleación, el acabado y el diámetro interior con un proveedor.",
  },
  {
    slug: "concepto-par-plata",
    name: "Par de alianzas lisas · concepto",
    category: "alianzas-plata",
    image: "pair",
    description:
      "Idea de dos alianzas de perfil redondeado. Unidad: un par de dos anillos. Cada persona elige su diámetro interior por separado. La imagen es ilustrativa; composición, anchos, talles fabricables, precio del par y condiciones aún no están confirmados.",
  },
  {
    slug: "concepto-par-oro",
    name: "Par de alianzas doradas · concepto",
    category: "alianzas-oro",
    image: "gold-pair",
    description:
      "Idea para explorar dos bandas de apariencia dorada. La ilustración muestra un par y no representa una pieza real disponible. Unidad prevista: un par de dos anillos. No se afirma oro real ni quilataje sin ficha del proveedor.",
  },
  {
    slug: "concepto-solitario",
    name: "Solitario delicado · concepto",
    category: "compromiso",
    image: "engagement",
    description:
      "Idea de solitario de apariencia dorada con una piedra clara. La imagen no permite identificar el metal ni la gema. No se afirma diamante, moissanita, circón, oro ni certificación. Es una referencia visual para conversar sobre estilo y presupuesto.",
  },
] as const;

export function conceptFor(slug: string) {
  return CONCEPTS.find((item) => item.slug === slug);
}
export function collectionFor(slug: string) {
  return COLLECTIONS.find((item) => item.slug === slug);
}
export { priceUnit } from "./ring-display";
export const CONCEPT_NOTICE =
  "Concepto ilustrativo generado con IA. No es una pieza disponible para comprar. Precio, material y entrega sin confirmar.";
