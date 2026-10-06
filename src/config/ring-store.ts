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
  {
    slug: "concepto-banda-lisa",
    name: "Banda lisa · concepto",
    category: "acero",
    image: "steel",
    description:
      "Una banda de líneas limpias como punto de partida para un anillo cotidiano. Compará el ancho, el perfil interior y el acabado de una pieza real antes de elegir. Esta referencia de diseño no acredita acero ni tiene precio o stock confirmado.",
  },
  {
    slug: "concepto-banda-oscura",
    name: "Banda de acabado oscuro · concepto",
    category: "acero",
    image: "steel",
    description:
      "Una idea de banda con contraste oscuro para explorar un estilo discreto. Un color negro puede provenir de un recubrimiento y no identifica el metal. El proveedor deberá confirmar construcción, acabado, cuidados y talles. Las imágenes compartidas sirven para revisar la página, no muestran este modelo.",
  },
  {
    slug: "concepto-linea-minimal",
    name: "Línea minimal · concepto",
    category: "plata-925",
    image: "silver",
    description:
      "Referencia de una banda fina para quienes prefieren una silueta sencilla. Podés comparar cómo se siente una pieza estrecha frente a una banda más ancha. Plata 925, peso, construcción y resistencia del diseño deben comprobarse con una ficha real; la ilustración no los confirma.",
  },
  {
    slug: "concepto-anillo-entrelazado",
    name: "Líneas entrelazadas · concepto",
    category: "plata-925",
    image: "silver",
    description:
      "Una propuesta de líneas cruzadas que permite conversar sobre un anillo de apariencia plateada. Antes de pedir una pieza, revisá altura, terminaciones y puntos que puedan engancharse en la ropa. No hay composición, medidas de fabricación ni disponibilidad confirmadas.",
  },
  {
    slug: "concepto-alianzas-planas",
    name: "Par de alianzas de perfil plano · concepto",
    category: "alianzas-plata",
    image: "pair",
    description:
      "Referencia para comparar dos bandas de perfil plano con alianzas redondeadas. La unidad prevista es un par de dos anillos, con medidas independientes. Una cotización deberá especificar plata, ancho y espesor de cada pieza, precio del par y posibilidad de ajustes. Esta idea no es una oferta de fabricación.",
  },
  {
    slug: "concepto-alianzas-redondeadas",
    name: "Par de alianzas redondeadas · concepto",
    category: "alianzas-oro",
    image: "gold-pair",
    description:
      "Idea de dos bandas de apariencia dorada con perfil redondeado para una boda. Compará el ancho y la comodidad de cada persona antes de definir los dos talles. Oro, quilataje, peso, grabado y precio necesitan confirmación; no se deducen de la ilustración.",
  },
  {
    slug: "concepto-solitario-perfil-bajo",
    name: "Solitario de perfil bajo · concepto",
    category: "compromiso",
    image: "engagement",
    description:
      "Una referencia de solitario para comparar la altura del engarce al elegir un anillo de compromiso. Pedí una vista lateral del modelo real y consultá cómo combina con otra banda. No se afirma un metal, una piedra ni una altura determinada; las fotografías actuales son referencias compartidas de la página.",
  },
  {
    slug: "concepto-engaste-circular",
    name: "Piedra central con contorno · concepto",
    category: "compromiso",
    image: "engagement",
    description:
      "Idea de diseño con una piedra central y un contorno visual para comparar distintos estilos de compromiso. La apariencia de un halo no identifica las piedras. Confirmá gema, dimensiones, montaje y cuidados de una pieza real; este concepto no tiene precio ni certificación.",
  },
  {
    slug: "concepto-promesa-lisa",
    name: "Banda de promesa · concepto",
    category: "promesa",
    image: "silver",
    description:
      "Una banda sencilla como referencia para un anillo de promesa. Su significado lo define quien lo elige y no exige un material o un presupuesto particular. La unidad prevista es un anillo individual; para una pareja habrá que confirmar dos piezas y dos medidas. No hay fabricación ni precio confirmados.",
  },
  {
    slug: "concepto-promesa-infinito",
    name: "Motivo infinito · concepto",
    category: "promesa",
    image: "silver",
    description:
      "Referencia de un motivo infinito para expresar un vínculo personal. Antes de elegir un anillo real, compará el tamaño del motivo, su altura y la comodidad en el dedo. Esta idea no demuestra metal, dimensiones ni disponibilidad. Las imágenes son ilustraciones compartidas, no fotos de un modelo de infinito.",
  },
  {
    slug: "concepto-promesa-corazon",
    name: "Motivo corazón · concepto",
    category: "promesa",
    image: "silver",
    description:
      "Una idea de corazón para conversar sobre un anillo de promesa o un regalo. El diseño puede ser discreto o protagonista; revisá el relieve y las terminaciones del modelo real. No se afirma material, piedra, talle fabricable o stock. Las imágenes actuales no representan este diseño específico.",
  },
  {
    slug: "concepto-solitario-clasico",
    name: "Solitario clásico · concepto",
    category: "solitarios",
    image: "engagement",
    description:
      "Referencia de una sola piedra protagonista sobre una banda simple. Para comparar un solitario real, pedí información sobre la identidad de la piedra, su forma, el montaje y el metal. Un solitario es un estilo, no una afirmación de diamante. Este concepto no está disponible para compra.",
  },
  {
    slug: "concepto-solitario-oval",
    name: "Solitario oval · concepto",
    category: "solitarios",
    image: "engagement",
    description:
      "Idea de una piedra de forma oval para explorar una silueta alargada. La forma y el tamaño visual no confirman gema, origen ni calidad. Pedí imágenes y dimensiones del modelo real antes de comparar. El contenido es un breve de diseño y las ilustraciones compartidas no muestran un solitario oval concreto.",
  },
  {
    slug: "concepto-alianzas-clasicas",
    name: "Par de alianzas clásicas · concepto",
    category: "alianzas",
    image: "pair",
    description:
      "Referencia para elegir dos anillos de boda con un estilo sencillo. Unidad prevista: un par de dos anillos. Cada persona necesita una medida independiente; el material, los anchos, el precio del par y las condiciones de entrega deben confirmarse por escrito. No hay inventario de este concepto.",
  },
  {
    slug: "concepto-alianzas-contraste",
    name: "Par de alianzas con contraste · concepto",
    category: "alianzas",
    image: "gold-pair",
    description:
      "Una idea de contraste para dos alianzas, que puede explorarse por acabado o por combinación de colores. La apariencia no identifica los metales ni acredita oro. Confirmá la construcción de cada pieza y el contenido del par con un proveedor; no se ofrece fabricación ni grabado sin acuerdo real.",
  },
  {
    slug: "concepto-banda-dorada",
    name: "Banda de apariencia dorada · concepto",
    category: "oro",
    image: "gold-pair",
    description:
      "Referencia de una banda individual para comparar una apariencia dorada. Oro de una aleación y un baño dorado son construcciones diferentes: una ficha real debe indicar cuál corresponde. No se confirma oro, quilataje, peso, precio ni disponibilidad. La unidad prevista es un solo anillo.",
  },
  {
    slug: "concepto-anillo-trenzado",
    name: "Líneas trenzadas · concepto",
    category: "oro",
    image: "gold-pair",
    description:
      "Idea de líneas trenzadas como alternativa a una banda lisa. Revisá relieve, ancho y limpieza de una pieza real antes de elegir. La inclusión en esta colección sirve para comparar estilos de anillos de oro; no acredita oro en el concepto ni confirma un proveedor o un precio.",
  },
  {
    slug: "concepto-carreton-liso",
    name: "Carretón de líneas simples · concepto",
    category: "hombre",
    image: "steel",
    description:
      "Referencia de carretón para comparar una silueta más ancha al elegir un anillo para hombre. El ancho influye en la sensación de ajuste, por eso conviene medir y probar el modelo real. Material, construcción, medidas y disponibilidad permanecen sin confirmar; no hay una pieza real detrás de esta ilustración.",
  },
  {
    slug: "concepto-anillo-sello",
    name: "Anillo de sello · concepto",
    category: "hombre",
    image: "steel",
    description:
      "Idea de un anillo de sello con una superficie protagonista. Podés usar esta referencia para comparar formas y preguntar si un modelo real admite iniciales o un grabado. Un sello como estilo no es lo mismo que una marca de pureza. No hay metal, personalización ni fabricación confirmados.",
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
