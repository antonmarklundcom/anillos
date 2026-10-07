import type { RingContent, ContentSection } from "./ring-content";
import { GUIDE_ENRICHMENT, NEW_GUIDES } from "./guide-pages";
import {
  appendRingContent,
  EXPANDED_GUIDES,
  GUIDE_EXPANSION,
} from "./ring-expansion";

type BaseGuide = {
  publishedAt?: string;
  reviewedAt?: string;
  slug: string;
  title: string;
  description: string;
  collection: string;
  sections: ContentSection[];
  sources?: { title: string; url: string }[];
};
export type Guide = BaseGuide &
  Pick<RingContent, "heading" | "faq" | "related">;
const BASE_GUIDES: BaseGuide[] = [
  {
    slug: "talles",
    title: "Cómo saber tu talle de anillo",
    description:
      "Medí el diámetro interior, evitá confusiones entre sistemas y confirmá el ajuste antes de elegir.",
    collection: "acero",
    sections: [
      {
        title: "Empezá por el dedo correcto",
        paragraphs: [
          "El talle corresponde a un dedo y a una mano concretos. Un anillo cómodo en una mano puede sentirse distinto en la otra. Definí dónde lo vas a usar y observá cómo cambia el ajuste durante el día. Si tenés otro anillo que te queda bien en ese mismo dedo, usalo como referencia.",
          "No elijas sólo por un número que recordás. Distintos fabricantes usan escalas diferentes y una etiqueta como ‘talle 7’ necesita su sistema para tener sentido. En una consulta, indicar el diámetro interior en milímetros reduce esa ambigüedad. La confirmación final debe hacerse con la tabla y el medidor del proveedor.",
        ],
      },
      {
        title: "Cómo medir un anillo que ya te queda",
        paragraphs: [
          "Apoyalo sobre una superficie plana y medí la distancia de borde interior a borde interior pasando por el centro. No incluyas el espesor del metal. Repetí la medición girando el anillo para detectar si está deformado. Una regla ayuda a orientarte; un calibre o un medidor de joyería permite confirmar con más precisión.",
          "Anotá el resultado con la unidad: por ejemplo, ‘diámetro interior aproximado de 17 mm’. Una foto sobre una regla puede ayudar, pero la perspectiva y la cámara introducen errores. No midas sobre una imagen ampliada en la pantalla ni sobre una impresión sin verificar la escala.",
        ],
      },
      {
        title: "Si todavía no tenés un anillo de referencia",
        paragraphs: [
          "Una tira de papel puede darte una aproximación del contorno. Rodeá el dedo sin apretar, marcá el punto de encuentro y medí la longitud. Comprobá también el paso por el nudillo. El hilo puede estirarse o clavarse en la piel, por eso no conviene tratar ese resultado como una medida definitiva.",
          "La relación geométrica entre diámetro y circunferencia es circunferencia = diámetro × π. Los ejemplos de abajo muestran esa relación, no una equivalencia universal de talles comerciales. Un anillero físico sigue siendo el paso más útil antes de encargar una pieza.",
        ],
      },
      {
        title: "Ancho, comodidad y dos talles",
        paragraphs: [
          "Probá un ancho parecido al del diseño elegido: una banda ancha puede sentirse distinta de una fina. El anillo debería pasar por el nudillo con una resistencia razonable y permitirte mover el dedo cómodamente. Si el ajuste genera dudas, confirmalo presencialmente antes de autorizar fabricación o grabado.",
          "Para un par de alianzas, anotá las dos medidas por separado. Aclarar ‘persona A: 17 mm; persona B: 19 mm’ es mejor que pedir ‘un par mediano’. Consultá si se puede ajustar el material, cuánto costaría y qué condiciones aplicarían si el talle no queda bien. Pedí que esas condiciones queden identificadas en la propuesta del modelo elegido.",
        ],
      },
    ],
    sources: [
      {
        title: "GIA: determinación de medidas de dedos y anillos",
        url: "https://www.gia.edu/quality-assurance-benchmark/accurate-determination-finger-ring-size?iframe=true",
      },
    ],
  },
  {
    slug: "materiales",
    title: "Acero, plata 925 y oro: qué comparar",
    description:
      "Entendé la composición, los recubrimientos y las preguntas que una foto no puede responder.",
    collection: "plata-925",
    sections: [
      {
        title: "El color no identifica el metal",
        paragraphs: [
          "Dos anillos de apariencia plateada pueden tener composiciones distintas. Una foto ayuda a comparar formas, pero no demuestra plata, acero, oro blanco ni un recubrimiento. Pedí una descripción escrita del material base y de cualquier baño o acabado. Separar esas dos cosas evita comparar productos que sólo se parecen en la imagen.",
          "Una imagen ilustrativa sirve para explorar formas, pero no acredita el material de una pieza. Tampoco el nombre de una colección certifica quilatajes, sellos o gemas. Revisá la ficha del modelo real y pedí documentación que respalde sus especificaciones antes de decidir.",
        ],
      },
      {
        title: "Qué significa plata 925",
        paragraphs: [
          "La plata esterlina 925 es una aleación con 92,5 % de plata. El porcentaje restante corresponde a otros metales de la aleación. ‘Baño de plata’ describe una capa superficial y no equivale a una pieza de plata 925. La marca 925 es una pista de identificación; por sí sola no reemplaza la documentación y la comprobación de una pieza.",
          "Al comparar, preguntá si el producto es plata maciza, si tiene rodio u otro recubrimiento, y qué mantenimiento recomienda el fabricante. El brillo puede cambiar con el uso. Una superficie pulida y una satinada también se ven distintas aunque compartan material base.",
        ],
      },
      {
        title: "Acero y opciones accesibles",
        paragraphs: [
          "El acero puede ser un punto de partida para diseños cotidianos de presupuesto contenido. No todos los productos descritos como ‘acero’ tienen la misma aleación ni el mismo acabado. Pedí la composición declarada y las instrucciones de cuidado. No asumás que un material es hipoalergénico para todas las personas sólo por su nombre comercial.",
          "Si un anillo es dorado, confirmá si el color corresponde a un recubrimiento y qué cuidados requiere. Para comparar dos opciones, mirá ancho, perfil interior, peso declarado y posibilidad de ajuste. Una pieza difícil de ajustar exige prestar más atención al talle desde el comienzo.",
        ],
      },
      {
        title: "Oro, quilataje y cotización",
        paragraphs: [
          "En oro, el quilataje expresa la proporción de oro en la aleación. Eso es diferente del quilate usado como unidad de peso de una gema. Una cotización debería indicar el quilataje del metal, el peso previsto y si incluye piedra o grabado. El tono amarillo de una imagen no confirma ninguno de esos datos.",
          "No compares una banda hueca con una maciza sólo por el ancho visible. Pedí el detalle de lo que incluye el monto final y de la unidad vendida: una pieza o un par. Si todavía no hay peso o especificación cerrados, tratá el importe como una cotización pendiente, no como un precio definitivo.",
        ],
      },
    ],
    sources: [
      {
        title: "GIA: opciones de metales blancos",
        url: "https://4cs.gia.edu/en-us/blog/pick-right-white-metal-engagement-wedding-ring/",
      },
      {
        title: "GIA: oro blanco y plata",
        url: "https://4cs.gia.edu/en-us/blog/white-gold-vs-silver/",
      },
    ],
  },
  {
    slug: "anillos-economicos",
    title: "Cómo elegir un anillo con presupuesto limitado",
    description:
      "Priorizá comodidad y material, compará el costo completo y evitá pagar por detalles que no necesitás.",
    collection: "acero",
    sections: [
      {
        title: "Definí el uso antes que el precio",
        paragraphs: [
          "Pensá si buscás una pieza para todos los días, un regalo o un símbolo de pareja. Para el uso cotidiano, la comodidad y el talle pueden importar más que una forma llamativa. Para un regalo, confirmar la medida y las posibilidades de cambio reduce el riesgo de gastar en una pieza que no se va a usar.",
          "Elegí un presupuesto máximo en guaraníes e incluí los posibles extras. El total puede depender de dos talles, grabado, ajustes y entrega. No hace falta elegir el material más caro para que un anillo tenga valor personal. Un diseño sencillo puede ser la decisión correcta si encaja con tu rutina y con lo que podés gastar.",
        ],
      },
      {
        title: "Empezá por comparar acero y plata",
        paragraphs: [
          "Explorá bandas lisas, perfiles finos y diseños sin piedras si querés una comparación fácil. Mirá el metal base, el acabado y el ancho. Una descripción precisa es más útil que palabras como ‘premium’ o ‘lujo’. La opción más económica no siempre tiene la misma composición que otra visualmente parecida.",
          "En plata, distinguí plata 925 de un baño. En acero de color dorado, preguntá por el recubrimiento. Si no hay información suficiente, dejá la elección pendiente. Una compra accesible sigue necesitando claridad sobre lo que recibís. Compará precios sólo después de identificar la composición y las características de cada modelo.",
        ],
      },
      {
        title: "Compará el total de la misma unidad",
        paragraphs: [
          "Para un anillo individual, compará montos por una unidad. Para alianzas, verificá si el precio incluye los dos anillos y los dos talles elegidos. No dupliques automáticamente una cifra por unidad para deducir el precio de un par: la cotización puede depender de medidas, ancho o fabricación.",
          "Pedí que se separen el valor de las piezas y los extras. Una promoción no ayuda a evaluar una compra si no se sabe qué incluye. Tampoco conviene sumar una piedra, un baño o un grabado sólo porque parece una mejora pequeña: cada detalle puede afectar el costo y las condiciones de cambio.",
        ],
      },
      {
        title: "Una decisión simple y bien informada",
        paragraphs: [
          "Prepará una lista corta con material deseado, acabado, medida aproximada, presupuesto y fecha orientativa. Así una consulta futura se vuelve concreta. Si tenés dos opciones, comparalas con los mismos datos en vez de decidir sólo por la fotografía.",
          "No aceptes una fecha de entrega implícita porque el diseño aparece en una web. Confirmá por escrito disponibilidad, fabricación o despacho, precio final y condiciones antes de pagar. Una referencia de estilo ayuda a planificar la elección; para reservar una pieza necesitás una propuesta real que identifique el producto y sus condiciones.",
        ],
      },
    ],
  },
  {
    slug: "alianzas-boda-civil",
    title: "Alianzas para una boda civil: una guía para dos",
    description:
      "Organizá dos talles, elegí un perfil cómodo y entendé qué tiene que incluir una cotización por par.",
    collection: "alianzas-plata",
    sections: [
      {
        title: "Empiecen por lo que quieren compartir",
        paragraphs: [
          "Las alianzas pueden ser iguales o tener diferencias de ancho y acabado. Conversen sobre qué van a usar cada día: una banda discreta, un perfil redondeado o una superficie satinada. Elijan pensando en la comodidad de cada persona, no sólo en cómo se ven juntas en una foto.",
          "Una boda civil no obliga a elegir oro. Pueden explorar acero, plata u otros materiales según sus preferencias y presupuesto. Cuando tengan una opción concreta, pidan composición y condiciones de fabricación, grabado y entrega para ese par antes de tomar una decisión.",
        ],
      },
      {
        title: "Dos dedos, dos medidas",
        paragraphs: [
          "Registren el dedo y la mano de cada persona y midan ambos por separado. La variante de un par debe representar las dos medidas, no una supuesta talla compartida. Antes de encargar una banda ancha, conviene probar un ancho parecido para evaluar cómo se siente.",
          "Si el anillo se va a fabricar, consulten cómo se confirma el talle y qué margen de ajuste existe para ese material. Un grabado o una fabricación específica puede cambiar las condiciones de modificación. No deduzcan esas condiciones de una guía general: deben estar en la propuesta real del proveedor.",
        ],
      },
      {
        title: "Qué incluye el precio del par",
        paragraphs: [
          "Pidan una cotización que diga ‘par de dos anillos’ e identifique las medidas de ambos. Tiene que aclarar metal, ancho, perfil, acabado y cualquier grabado. Si se ofrece una cifra por anillo, pidan también el total de las dos piezas antes de comparar con otra propuesta.",
          "El costo de entrega o de un ajuste no debe quedar confundido con el precio de las alianzas. Tampoco den por incluido un estuche o una inscripción porque aparezca en una imagen. Revisen la unidad indicada en cada ficha y soliciten un total verificable que separe las piezas de los servicios adicionales.",
        ],
      },
      {
        title: "La fecha merece una confirmación propia",
        paragraphs: [
          "Anoten la fecha del civil y cuándo les gustaría tener las piezas para poder probarlas con tiempo. Una fecha deseada es información para la consulta; no es una promesa de fabricación. Si intervienen taller y despacho, pregunten quién confirma cada etapa y cómo se comunica cualquier cambio.",
          "Antes de autorizar un pago, revisen la propuesta completa: dos talles, unidad, precio final, condiciones de ajuste y entrega confirmada. Guarden la ficha y la cotización aceptada. Las condiciones de una joyería o de otro modelo no se trasladan automáticamente al par que ustedes eligen.",
        ],
      },
    ],
  },
  {
    slug: "compromiso-y-alianzas",
    title: "Anillo de compromiso y alianza: cuál es la diferencia",
    description:
      "Compará su significado, el uso diario y las decisiones prácticas sin reglas de presupuesto impuestas.",
    collection: "compromiso",
    sections: [
      {
        title: "Dos momentos, muchas maneras de elegir",
        paragraphs: [
          "El anillo de compromiso suele acompañar una propuesta; las alianzas suelen representar la unión de una pareja. Son usos habituales, no requisitos. Podés elegir una banda simple para el compromiso, usar una sola pieza para ambos momentos o decidir no usar anillos. La elección puede responder a lo que ustedes quieren simbolizar.",
          "Un solitario es un estilo con una piedra protagonista. No significa automáticamente diamante ni oro. En una ficha real, material y gema deben identificarse por separado. Una referencia visual muestra apariencia y forma; el origen de la piedra, el quilataje y la documentación se confirman con los datos de la pieza concreta.",
        ],
      },
      {
        title: "El presupuesto lo definís vos",
        paragraphs: [
          "No hace falta seguir una regla de meses de sueldo. Pensá en un monto que puedas destinar sin presión, en cómo se va a usar la pieza y en qué detalle tiene significado para vos. Un diseño accesible puede ser tan personal como otro de un metal más costoso.",
          "Separá forma, metal y piedra para comparar. Quizás te interesa una banda cómoda y discreta, o una piedra pequeña con una montura baja. Consultá el precio completo de la unidad elegida y qué extras se incluyen. Para alianzas, confirmá si se cotiza una pieza o el par.",
        ],
      },
      {
        title: "Pensá en la mano y en la rutina",
        paragraphs: [
          "No hay una única mano obligatoria para el anillo de compromiso: las costumbres varían y ustedes pueden elegir cómo usarlo. Definí la mano y el dedo antes de medir, especialmente si querés llevarlo junto a la alianza. No des por hecho que el mismo talle queda igual en la otra mano.",
          "Una montura alta puede sentirse diferente de una banda lisa al trabajar o vestir. Mirá la altura del diseño, las puntas y cómo apoyaría junto a una alianza si se van a usar juntas. Probá el ajuste y evaluá si cada pieza resulta cómoda por separado.",
          "Si el anillo es una sorpresa, una medida aproximada ayuda a empezar, pero no sustituye confirmar el talle. Antes de grabar o fabricar, preguntá qué opciones habrá si no queda bien. Consultá las condiciones de ajuste y cambio del modelo elegido antes de autorizar la personalización.",
        ],
      },
      {
        title: "Cuando una piedra requiere más información",
        paragraphs: [
          "Una imagen no permite distinguir con certeza un diamante de otras gemas o imitaciones. Para una pieza real, pedí identificación de la piedra y cualquier tratamiento declarado. Si corresponde un informe gemológico, verificá qué describe y a qué piedra pertenece. No tomes la palabra ‘certificado’ como una explicación suficiente.",
          "Prepará tu consulta con estilo, presupuesto, medida y uso previsto. Esa información permite conversar sin imponer una elección. Antes de pagar, necesitás una ficha y una cotización reales. Identificá el modelo, la unidad vendida y las condiciones aplicables; una ilustración de estilo no reemplaza una oferta concreta.",
        ],
      },
    ],
    sources: [
      {
        title: "GIA: preguntas al elegir un anillo de compromiso",
        url: "https://4cs.gia.edu/en-us/blog/buying-diamond-engagement-ring-questions-jeweler-will-ask/",
      },
    ],
  },
  {
    slug: "cuidados",
    title: "Cómo cuidar tus anillos de acero, plata y oro",
    description:
      "Hábitos simples para guardar y limpiar una pieza según su material, acabado y piedras.",
    collection: "plata-925",
    sections: [
      {
        title: "Conocé la pieza antes de limpiarla",
        paragraphs: [
          "El cuidado depende del material base, de los recubrimientos y de las piedras o adhesivos. No apliques una receta para oro macizo a una pieza bañada sin revisar sus indicaciones. Una foto tampoco permite elegir un limpiador: necesitás saber qué materiales estás tratando.",
          "Guardá las instrucciones y la ficha que acompañen la pieza real. Si el anillo tiene una piedra floja, una parte dañada o un acabado que no identificás, consultá a una joyería antes de limpiarlo. Las recomendaciones de esta guía son un punto de partida y no reemplazan las indicaciones específicas del fabricante.",
        ],
      },
      {
        title: "Hábitos cotidianos que evitan problemas",
        paragraphs: [
          "Retirá los anillos antes de manipular productos de limpieza, hacer trabajos que puedan golpearlos o realizar actividades donde puedan engancharse. Apoyarlos siempre en un lugar seguro ayuda a evitar pérdidas. Un pequeño recipiente fijo en casa puede ser más práctico que dejarlos sueltos al lado de una pileta.",
          "Guardá las piezas separadas para reducir el roce. Un paño suave y seco sirve para retirar huellas superficiales sin aplicar químicos. No uses dentífrico ni abrasivos como solución universal. El brillo que ves después de frotar no garantiza que el acabado haya quedado intacto.",
        ],
      },
      {
        title: "Plata y recubrimientos",
        paragraphs: [
          "La plata puede oscurecerse con el tiempo. Guardarla seca y protegida, con materiales adecuados para plata, ayuda a conservar su aspecto. Un paño destinado a plata puede ser útil en una pieza compatible, pero no conviene pulir agresivamente un recubrimiento o un acabado satinado sin instrucciones.",
          "Si hay baño de oro, rodio u otra capa, consultá qué limpieza está permitida. Un producto que funciona sobre el metal base puede afectar la superficie. Para evaluar una restauración o un cambio de color, hace falta conocer la fabricación y el estado de la pieza.",
        ],
      },
      {
        title: "Piedras y limpieza profesional",
        paragraphs: [
          "Los equipos ultrasónicos y el vapor no son adecuados para todas las gemas o tratamientos. Si no conocés la piedra, evitá usarlos por cuenta propia. También conviene revisar periódicamente la sujeción de una piedra con alguien que pueda evaluar la pieza físicamente.",
          "Para conservar un anillo durante mucho tiempo, combiná un uso cuidadoso con revisiones apropiadas a su construcción. Antes de comprar, preguntá qué mantenimiento será necesario y si existe un servicio real disponible. Pedí las condiciones de reparación y garantía de esa pieza y conservá la documentación de la compra.",
        ],
      },
    ],
    sources: [
      {
        title: "GIA: consejos de cuidado de joyería",
        url: "https://www.gia.edu/articles/gia-news-research-tips-caring-jewelry",
      },
      {
        title: "GIA: limpieza de joyería",
        url: "https://4cs.gia.edu/en-us/blog/holiday-buying-guide-clean-jewelry/",
      },
    ],
  },
];

const ORIGINAL_GUIDES: Guide[] = [
  ...BASE_GUIDES.map((guide) => {
    const {
      sectionTitles,
      sectionIds,
      sectionLinks,
      extraSections = [],
      ...changes
    } = GUIDE_ENRICHMENT[guide.slug] ?? {};
    return {
      ...guide,
      heading: guide.title,
      faq: [],
      related: [],
      ...changes,
      sections: [
        ...guide.sections.map((section, index) => ({
          ...section,
          title: sectionTitles?.[index] ?? section.title,
          id: sectionIds?.[index] ?? section.id,
          links: sectionLinks?.[index] ?? section.links,
        })),
        ...extraSections,
      ],
    };
  }),
  ...NEW_GUIDES,
];

export const GUIDES: Guide[] = [
  ...ORIGINAL_GUIDES.map((guide) =>
    appendRingContent(guide, GUIDE_EXPANSION[guide.slug])
  ),
  ...EXPANDED_GUIDES,
];
