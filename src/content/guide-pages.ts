import type { Guide } from "./guides";
import type { ContentLink, ContentSection } from "./ring-content";

const talles = { label: "Medidas y tallas de anillos", href: "/guias/talles" };
const materiales = {
  label: "Comparar materiales de anillos",
  href: "/guias/materiales",
};
const cuidados = {
  label: "Cómo limpiar y cuidar tus anillos",
  href: "/guias/cuidados",
};
const boda = {
  label: "Anillos de boda y alianzas",
  href: "/categoria/alianzas",
};
const oro = { label: "Anillos de oro en Paraguay", href: "/categoria/oro" };
const plata = { label: "Anillos de plata 925", href: "/categoria/plata-925" };

type Enrichment = Omit<Partial<Guide>, "sections"> & {
  sectionTitles?: string[];
  sectionIds?: string[];
  sectionLinks?: ContentLink[][];
  extraSections?: ContentSection[];
};

export const GUIDE_ENRICHMENT: Record<string, Enrichment> = {
  talles: {
    title: "Medidas y tallas de anillos: cómo medir tu dedo",
    heading: "Medidas de anillos: cómo saber tu talla",
    description:
      "Aprendé a medir tu dedo o un anillo que ya te queda. Consultá diámetro, circunferencia y recomendaciones para elegir tu talle con la escala del proveedor.",
    sectionTitles: [
      "Talla, talle y número de anillo",
      "Cómo saber la medida de un anillo que ya te queda",
      "Cómo medir el dedo para un anillo en casa",
      "Ancho, comodidad y dos talles",
    ],
    sectionIds: ["talla-y-talle", "medir-anillo", "medir-dedo", "dos-talles"],
    sectionLinks: [[], [], [], [boda]],
    extraSections: [
      {
        id: "milimetros",
        title: "Medidas de anillos en centímetros y milímetros",
        paragraphs: [
          "Un centímetro equivale a diez milímetros: 2 cm de diámetro interior son 20 mm. Eso no es lo mismo que 2 cm de contorno. Al comunicar una medida, escribí qué mediste y la unidad; por ejemplo, ‘18 mm de diámetro interior’.",
          "Si tu anillo mide 16, 17 o 18 mm, la tabla de abajo permite calcular su circunferencia aproximada. No asigna un número comercial universal: para saber qué talla pedir, compará ese dato con la escala del fabricante y confirmá el ajuste con un medidor físico.",
        ],
      },
    ],
    faq: [
      {
        question: "¿16 mm qué talla de anillo es?",
        answer:
          "Un diámetro interior de 16 mm corresponde a una circunferencia aproximada de 50,3 mm. El número de talla depende del sistema del fabricante; confirmalo con su tabla antes de pedir.",
      },
      {
        question: "¿17 mm y 18 mm a qué medida corresponden?",
        answer:
          "Sus circunferencias aproximadas son 53,4 mm y 56,5 mm, respectivamente. Son relaciones geométricas, no tallas comerciales universales.",
      },
      {
        question: "¿Cómo saber mi talla de anillo en casa?",
        answer:
          "Podés medir el diámetro interior de un anillo que te quede o aproximar el contorno del dedo con una tira de papel. Repetí la medición y confirmá con un anillero y la escala del proveedor.",
      },
      {
        question: "¿2 cm de anillo es la misma medida que 2 cm de dedo?",
        answer:
          "No. Hay que distinguir diámetro y contorno. Un anillo de 2 cm de diámetro interior tiene aproximadamente 6,28 cm de circunferencia.",
      },
      {
        question: "¿Puedo usar el mismo talle en cualquier anillo?",
        answer:
          "No lo des por hecho. Pueden cambiar el sistema de medidas, el ancho y el perfil. Confirmá el ajuste para el modelo y dedo concretos.",
      },
    ],
    related: [
      boda,
      plata,
      { label: "Anillos para hombre", href: "/categoria/hombre" },
    ],
  },
  materiales: {
    title: "Plata 925, oro 18k y acero: materiales de anillos",
    heading: "Materiales de anillos: plata 925, oro 18k y acero",
    description:
      "Compará materiales de anillos: qué significa 925, qué es el oro de 18 quilates y cómo distinguir oro blanco, acero y recubrimientos.",
    sectionTitles: [
      "El color no identifica el material",
      "Qué significa 925 en la plata",
      "Acero inoxidable y acero quirúrgico",
      "Oro de 18 quilates: composición y cotización",
    ],
    sectionIds: ["identificar", "plata-925", "acero", "oro-18-quilates"],
    sectionLinks: [
      [],
      [plata],
      [{ label: "Anillos de acero", href: "/categoria/acero" }],
      [oro],
    ],
    extraSections: [
      {
        id: "oro-18k",
        title: "Oro 18k, 18 quilates y sello 750",
        paragraphs: [
          "18k y 18 quilates son maneras de expresar la misma proporción de oro: 18 partes de un total de 24, es decir, 75 %. La marca 750 expresa 750 partes de oro por mil. Estas indicaciones se refieren al metal; los quilates de una piedra expresan su peso.",
          "Una denominación como ‘oro italiano 18k’ combina una afirmación de procedencia con otra de pureza. Pedí respaldo para cada dato. Una inscripción o el color no sustituyen comprobar la composición de la pieza real.",
        ],
        links: [oro],
      },
      {
        id: "oro-blanco",
        title: "Qué es el oro blanco y cómo se diferencia de la plata",
        paragraphs: [
          "El oro blanco es una aleación de oro con otros metales que modifican su color. Puede llevar un recubrimiento de rodio. La plata 925 es otra aleación: no se vuelve oro blanco por tener un aspecto parecido.",
          "Para comparar un anillo de oro blanco, confirmá quilataje, recubrimiento y mantenimiento. Si buscás su precio en Paraguay, pedí una cotización de la pieza terminada con peso, diseño y piedra identificada. No hay un precio único deducible por el color.",
        ],
        links: [
          oro,
          { label: "Anillos de compromiso", href: "/categoria/compromiso" },
        ],
      },
      {
        id: "joyas-de-plata",
        title: "Joyas de plata: qué revisar en un anillo",
        paragraphs: [
          "En una joya de plata, distinguí aleación, acabado y procedencia. ‘Plata de ley 925’ expresa la proporción; ‘plata italiana’ agrega una afirmación de origen. Ninguna de esas palabras describe por sí sola peso, construcción o calidad del engarce.",
          "Revisá la ficha de un anillo concreto y guardá sus instrucciones. Si tiene piedras o recubrimientos, los cuidados pueden cambiar. Una guía de material ayuda a interpretar información, pero no certifica una ilustración ni una pieza no examinada.",
        ],
        links: [plata, cuidados],
      },
    ],
    faq: [
      {
        question: "¿925 es plata?",
        answer:
          "En una especificación de plata, 925 significa 92,5 % de plata en la aleación. Es un dato de composición que debe respaldarse para la pieza concreta.",
      },
      {
        question: "¿Plata 925 y plata de ley 925 son equivalentes?",
        answer:
          "Describen la misma proporción. Un baño de plata sobre otro metal es diferente y debe indicarse por separado.",
      },
      {
        question: "¿18k y 750 significan lo mismo?",
        answer:
          "Como marcas de pureza del oro, equivalen al 75 %. La marca por sí sola no reemplaza documentación y comprobación de una pieza.",
      },
      {
        question: "¿Oro blanco y plata son lo mismo?",
        answer:
          "No. Son materiales diferentes aunque ambos puedan tener apariencia plateada. Pedí composición y detalle de recubrimientos.",
      },
      {
        question: "¿Un baño de oro convierte el anillo en oro macizo?",
        answer:
          "No. El baño es una capa superficial sobre un material base. La ficha debe identificar ambos.",
      },
    ],
    related: [plata, oro, cuidados],
  },
  "anillos-economicos": {
    title: "Anillos de boda económicos: precios y presupuesto",
    heading: "Anillos de boda económicos en Paraguay",
    description:
      "Compará anillos de boda económicos en Paraguay según material, presupuesto y talle. Conocé qué incluye el precio de una pieza o de un par.",
    sectionTitles: [
      "Anillos de boda económicos: definí el presupuesto",
      "Comparar alianzas de acero y plata",
      "Precio de anillos de boda: una pieza o un par",
      "Qué confirmar antes de elegir",
    ],
    sectionIds: ["presupuesto", "materiales", "precios", "confirmar"],
    sectionLinks: [
      [],
      [
        { label: "Anillos de acero", href: "/categoria/acero" },
        { label: "Alianzas de plata", href: "/categoria/alianzas-plata" },
      ],
      [boda],
      [talles],
    ],
    faq: [
      {
        question: "¿Cómo elegir un anillo de boda barato?",
        answer:
          "Definí el presupuesto y compará piezas de especificaciones claras. Priorizá medida y comodidad; confirmá material, cantidad y precio final antes de decidir.",
      },
      {
        question: "¿El precio de alianzas incluye los dos anillos?",
        answer:
          "Necesitás confirmarlo en cada propuesta. Una cifra por unidad no siempre permite deducir el costo del par con dos talles distintos.",
      },
      {
        question: "¿Una alianza económica tiene que ser bañada?",
        answer:
          "No. Material y recubrimiento son datos que hay que consultar; no se pueden inferir sólo del precio o de la apariencia.",
      },
      {
        question: "¿Qué extras debo incluir en el presupuesto?",
        answer:
          "Consultá grabado, estuche, ajuste y entrega si se ofrecen. Pedí un total en guaraníes que indique qué incluye y qué queda aparte.",
      },
    ],
    related: [
      boda,
      { label: "Alianzas de plata", href: "/categoria/alianzas-plata" },
      talles,
    ],
  },
  "alianzas-boda-civil": {
    description:
      "Organizá sus alianzas para una boda civil: dos talles, material, presupuesto y una cotización que aclare qué incluye el par de anillos.",
    sectionIds: ["elegir", "dos-talles", "precio-del-par", "fecha"],
    sectionLinks: [
      [boda],
      [talles],
      [
        { label: "Alianzas de plata", href: "/categoria/alianzas-plata" },
        { label: "Alianzas de oro", href: "/categoria/alianzas-oro" },
      ],
      [],
    ],
    faq: [
      {
        question: "¿Podemos elegir alianzas distintas para el civil?",
        answer:
          "Sí. Pueden compartir algún detalle con anchos o acabados diferentes. Lo útil es que cada pieza se adapte a la comodidad de quien la usará.",
      },
      {
        question: "¿Con cuánta anticipación hay que elegir?",
        answer:
          "Depende de la disponibilidad y de si habrá fabricación o grabado. Pedí un plazo confirmado y dejá tiempo para probar las dos piezas.",
      },
      {
        question: "¿Una medida sirve para el par?",
        answer:
          "No. Cada persona necesita la medida de su dedo. La propuesta debe describir ambas, con el sistema de talles del proveedor.",
      },
      {
        question: "¿Esta guía informa los requisitos legales de la ceremonia?",
        answer:
          "Se ocupa de elegir anillos. Los requisitos y la organización del acto se confirman con el organismo correspondiente.",
      },
    ],
    related: [
      boda,
      {
        label: "Anillos de boda económicos",
        href: "/guias/anillos-economicos",
      },
      talles,
    ],
  },
  "compromiso-y-alianzas": {
    title: "Anillo de compromiso y alianza: diferencias y uso",
    heading: "Anillo de compromiso y alianza: cuál es la diferencia",
    description:
      "Entendé la diferencia entre compromiso, promesa y alianza, en qué mano se usan y qué tener en cuenta al elegir cada anillo.",
    sectionTitles: [
      "Anillo de compromiso y anillo de matrimonio",
      "El presupuesto lo definís vos",
      "En qué mano va el anillo de compromiso",
      "Identificar la piedra antes de elegir",
    ],
    sectionIds: ["diferencias", "presupuesto", "mano", "piedra"],
    sectionLinks: [
      [{ label: "Anillos de compromiso", href: "/categoria/compromiso" }, boda],
      [],
      [talles],
      [{ label: "Piedras para anillos", href: "/guias/piedras-para-anillos" }],
    ],
    extraSections: [
      {
        id: "promesa",
        title: "Anillo de promesa y compromiso: significados diferentes",
        paragraphs: [
          "Un anillo de promesa puede expresar un acuerdo personal sin una propuesta de matrimonio. Un anillo de compromiso suele acompañar esa propuesta; la alianza suele representar la unión. Son usos habituales, no reglas que impongan un mismo diseño a todas las parejas.",
          "Conversemos sobre significado y uso antes de decidir la forma. Una banda lisa puede acompañar cualquiera de esos momentos; un solitario también puede ser un regalo personal. Lo que diferencia las piezas no es únicamente su apariencia.",
        ],
        links: [{ label: "Anillos de promesa", href: "/categoria/promesa" }],
      },
    ],
    faq: [
      {
        question: "¿En qué mano va el anillo de compromiso?",
        answer:
          "Las costumbres varían y la pareja puede elegir cómo usarlo. Definí mano y dedo antes de medir, porque el ajuste puede ser diferente entre ambas manos.",
      },
      {
        question: "¿El anillo de compromiso y la alianza se usan juntos?",
        answer:
          "Pueden usarse juntos o por separado. Si irán en el mismo dedo, probá cómo apoyan los dos perfiles y si resultan cómodos.",
      },
      {
        question:
          "¿Promesa significa que ya estamos comprometidos para casarnos?",
        answer:
          "No necesariamente. Conviene explicar el significado que ustedes acuerdan para el regalo en lugar de asumirlo por el nombre del anillo.",
      },
      {
        question: "¿Una alianza puede servir como anillo de compromiso?",
        answer:
          "Sí. Una banda puede acompañar una propuesta si eso representa lo que ustedes quieren. No hay una forma obligatoria.",
      },
    ],
    related: [
      { label: "Anillos de compromiso", href: "/categoria/compromiso" },
      { label: "Anillos de promesa", href: "/categoria/promesa" },
      boda,
    ],
  },
  cuidados: {
    title: "Cómo limpiar anillos de plata, acero y oro",
    heading: "Cómo limpiar anillos de plata, acero y oro",
    description:
      "Aprendé cómo limpiar anillos de plata y cuidar acero, oro y piedras. Identificá el material y el acabado antes de aplicar un método de limpieza.",
    sectionIds: ["identificar", "habitos", "plata", "piedras"],
    sectionLinks: [
      [materiales],
      [],
      [plata],
      [{ label: "Piedras para anillos", href: "/guias/piedras-para-anillos" }],
    ],
    extraSections: [
      {
        id: "limpiar-plata",
        title: "Cómo limpiar un anillo de plata: empezá por su ficha",
        paragraphs: [
          "En plata lisa sin recubrimientos ni piedras, seguí las instrucciones del fabricante sobre el paño o producto compatible. Usá un paño suave para huellas superficiales. Si el anillo tiene rodio, baño de oro, acabado satinado o gemas, confirmá el método antes de pulirlo.",
          "No uses una receta de blanqueado como solución para todas las piezas. Evitá dentífrico, abrasivos y productos domésticos agresivos. Si no identificás el material o hay una piedra floja, pedí una revisión antes de limpiar. Secá y guardá la pieza según sus instrucciones, separada de otras para reducir el roce.",
        ],
        bullets: [
          "Identificá metal, recubrimiento, piedras y estado del engarce.",
          "Elegí sólo un método compatible con esa construcción.",
          "Limpiá sobre una superficie segura, lejos de un desagüe abierto.",
          "Guardá cada anillo por separado y conservá su ficha de cuidado.",
        ],
      },
    ],
    faq: [
      {
        question: "¿Cómo limpiar anillos de plata que se oscurecieron?",
        answer:
          "Primero confirmá si tienen recubrimientos o piedras. Un paño o producto específico para plata puede servir en una pieza compatible; seguí las indicaciones del fabricante y evitá pulir superficies que no identificás.",
      },
      {
        question: "¿Puedo usar dentífrico o bicarbonato en cualquier anillo?",
        answer:
          "No son métodos universales. Pueden afectar superficies o acabados. Elegí la limpieza según la construcción real de la pieza.",
      },
      {
        question: "¿La limpieza ultrasónica sirve para todas las piedras?",
        answer:
          "No. Gemas, tratamientos y engarces pueden requerir cuidados distintos. Dejá esa evaluación a quien pueda identificar y revisar la pieza.",
      },
      {
        question: "¿Cómo evito perder un anillo al limpiarlo?",
        answer:
          "Prepará un recipiente o una superficie segura y evitá trabajar sobre un desagüe abierto. Contá las piezas antes y después, y guardalas en su lugar habitual.",
      },
    ],
    related: [
      materiales,
      plata,
      { label: "Piedras y cuidados", href: "/guias/piedras-para-anillos" },
    ],
  },
};

export const NEW_GUIDES: Guide[] = [
  {
    slug: "bodas-de-oro",
    collection: "oro",
    title: "Bodas de oro: aniversario y anillos para celebrar",
    heading: "Bodas de oro: cómo elegir un anillo de aniversario",
    description:
      "Ideas para elegir un anillo para las bodas de oro: significado, materiales, talles y detalles que conviene confirmar antes de preparar el regalo.",
    sections: [
      {
        id: "significado",
        title: "Un anillo para celebrar las bodas de oro",
        paragraphs: [
          "Las bodas de oro celebran habitualmente cincuenta años de matrimonio. Un anillo puede acompañar ese aniversario como un recuerdo nuevo, una renovación de las alianzas o un regalo elegido por ambos. La celebración no obliga a comprar oro ni a reemplazar las piezas que ya tienen.",
          "Empiecen por lo que quieren recordar. Una banda sencilla, un detalle compartido o una inscripción pueden expresar una historia sin necesidad de un diseño grande. La elección funciona mejor cuando respeta la forma de vestir y de usar joyas de cada persona.",
        ],
        links: [boda],
      },
      {
        id: "eleccion",
        title: "Material, diseño y presupuesto para el aniversario",
        paragraphs: [
          "Si eligen oro, confirmen quilataje, peso y construcción. Si prefieren plata o acero, revisen igualmente composición y acabado. El nombre del aniversario no define el material de una pieza ni acredita un producto que aparece en una imagen.",
          "Comparen el total de la propuesta en guaraníes, indicando si necesitan un anillo o un par. Incluyan los extras que realmente quieren: un grabado puede ser más significativo que una piedra mayor. Confirmen por escrito qué incluye cada importe.",
        ],
        links: [oro, materiales],
      },
      {
        id: "talle",
        title: "Volver a medir antes de regalar un anillo",
        paragraphs: [
          "No usen sin comprobar el talle de una alianza de hace años. Midan el dedo actual en la mano donde irá la nueva pieza. Si la persona ya usa un anillo cómodo, puede servir como referencia de diámetro interior, siempre que corresponda al mismo dedo.",
          "Para una banda ancha, conviene probar una referencia similar. Antes de fabricar o grabar, consulten opciones de ajuste y condiciones de cambio. Si el regalo es una sorpresa, separen la elección del estilo de la confirmación final de la medida.",
        ],
        links: [talles],
      },
      {
        id: "personalizar",
        title: "Grabado y preparación de la fecha",
        paragraphs: [
          "Revisen nombres, iniciales y fecha tal como aparecerán en el grabado. Confirmen el espacio disponible y si la inscripción afecta las condiciones de ajuste. Una ilustración con un texto no significa que ese servicio esté incluido.",
          "Dejen tiempo para confirmar disponibilidad y probar la pieza. Una fecha deseada no equivale a un plazo aceptado por un taller o un servicio de entrega. Antes de pagar, revisen modelo, material, talle, precio y condiciones juntos.",
        ],
        links: [cuidados],
      },
    ],
    faq: [
      {
        question: "¿Cuántos años son las bodas de oro?",
        answer:
          "Habitualmente se usa esa denominación para los cincuenta años de matrimonio.",
      },
      {
        question: "¿El anillo de bodas de oro tiene que ser de oro?",
        answer:
          "No. El nombre identifica el aniversario, no una obligación de material. Elijan según significado, comodidad y presupuesto.",
      },
      {
        question: "¿Hay que reemplazar las alianzas originales?",
        answer:
          "No. Pueden conservarlas, sumar un anillo o elegir otro recuerdo. Es una decisión personal de la pareja.",
      },
      {
        question: "¿Podemos usar el talle de las alianzas antiguas?",
        answer:
          "Úsenlo sólo como referencia inicial. Confirmen las medidas actuales y el ajuste del nuevo diseño antes de personalizar.",
      },
    ],
    related: [oro, boda, talles],
  },
  {
    slug: "estilos-de-anillos",
    collection: "hombre",
    title: "Estilos de anillos: solitarios, carretones y giratorios",
    heading: "Estilos de anillos y cómo elegirlos",
    description:
      "Conocé estilos de anillos, desde bandas y solitarios hasta carretones y giratorios. Compará forma, comodidad y uso para elegir un diseño personal.",
    sections: [
      {
        id: "bandas",
        title: "Bandas lisas, anchas y de perfil redondeado",
        paragraphs: [
          "Una banda puede ser fina o ancha, plana o redondeada, pulida o satinada. Estos detalles cambian la apariencia y la sensación al usarla. Una pieza discreta puede funcionar como anillo personal, de promesa o alianza: el significado no depende únicamente de la forma.",
          "Para comparar dos bandas, pedí ancho, altura y perfil interior. Probá una referencia parecida en el dedo elegido. Una banda de más superficie puede sentirse diferente de otra fina aunque lleve el mismo número de talle.",
        ],
        links: [talles, boda],
      },
      {
        id: "solitarios",
        title: "Solitarios y anillos con una piedra protagonista",
        paragraphs: [
          "En un solitario, una piedra central concentra la atención. Ese estilo no identifica la gema ni el metal. Mirá la altura de la montura, las puntas y cómo se apoya con otras piezas antes de decidir sólo por el tamaño visible.",
          "Un anillo con varias piedras o una forma envolvente tiene otra distribución del diseño. Pedí identificación de cada material y recomendaciones de cuidado. La fotografía ayuda a comparar proporciones, pero no confirma composición.",
        ],
        links: [
          { label: "Anillos solitarios", href: "/categoria/solitarios" },
          {
            label: "Piedras para anillos",
            href: "/guias/piedras-para-anillos",
          },
        ],
      },
      {
        id: "carretones",
        title: "Carretones y diseños con volumen",
        paragraphs: [
          "Los nombres de estilos pueden variar entre joyerías. Si buscás un carretón u otro diseño de volumen, acompañá el nombre con una referencia visual y pedí medidas completas. Confirmá la forma del modelo real en lugar de asumir una construcción por su denominación.",
          "Un diseño ancho requiere revisar el apoyo sobre el dedo y la comodidad al cerrar la mano. Material, peso y construcción se comparan por separado de la forma. ‘De oro’ necesita una composición identificada; el tono de una imagen no es suficiente.",
        ],
        links: [
          oro,
          { label: "Anillos para hombre", href: "/categoria/hombre" },
        ],
      },
      {
        id: "giratorios",
        title: "Anillos giratorios y la denominación antiestrés",
        paragraphs: [
          "Un anillo giratorio puede incorporar una parte móvil que gira respecto de una banda. Al comparar modelos, revisá qué parte se mueve, si resulta cómoda y qué instrucciones de limpieza acompañan el mecanismo. No todos los diseños llamados antiestrés tienen la misma construcción.",
          "La palabra antiestrés es una denominación comercial, no una prueba de eficacia terapéutica. Esta guía describe accesorios y su funcionamiento; no atribuye tratamiento de ansiedad a un anillo. Elegí por diseño, comodidad y datos reales del producto.",
        ],
        links: [materiales, cuidados],
      },
    ],
    faq: [
      {
        question: "¿Cómo funciona un anillo giratorio?",
        answer:
          "Algunos diseños tienen una pieza móvil alrededor de una banda. Confirmá el mecanismo y sus cuidados en la ficha del modelo real.",
      },
      {
        question: "¿Antiestrés y giratorio significan exactamente lo mismo?",
        answer:
          "No necesariamente. Una denominación comercial no explica toda la construcción. Pedí fotos y descripción del mecanismo.",
      },
      {
        question: "¿Un solitario es siempre de compromiso?",
        answer:
          "No. Es un estilo que también puede elegirse como regalo o para uso personal.",
      },
      {
        question: "¿Un anillo ancho necesita un talle diferente?",
        answer:
          "Puede sentirse distinto de uno fino. Probá un ancho similar y confirmá el ajuste con el proveedor antes de elegir.",
      },
    ],
    related: [
      talles,
      materiales,
      { label: "Anillos solitarios", href: "/categoria/solitarios" },
    ],
  },
  {
    slug: "piedras-para-anillos",
    collection: "solitarios",
    title: "Piedras para anillos: diamante, moissanita y formas",
    heading: "Piedras para anillos: qué comparar antes de elegir",
    description:
      "Compará diamante, moissanita, circonita y amatista para anillos: identificación, formas, engarce, cuidados y factores de precio.",
    sections: [
      {
        id: "identificar",
        title: "La piedra necesita una identificación propia",
        paragraphs: [
          "Una gema no se identifica con certeza por su color o brillo en una pantalla. Pedí el nombre del material, dimensiones y datos de origen o tratamiento que correspondan. Metal y piedra son especificaciones separadas: un anillo de oro puede llevar piedras muy distintas.",
          "Si se entrega un informe, comprobá quién lo emitió, qué describe y a qué piedra pertenece. Una afirmación genérica de certificación no explica esas condiciones. Las ilustraciones de este sitio muestran estilos y no acreditan gemas reales.",
        ],
        links: [materiales],
      },
      {
        id: "diamantes",
        title: "Anillos de diamante: qué comparar",
        paragraphs: [
          "Para describir un diamante se consideran talla, color, claridad y peso en quilates, conocidos como las 4C. El peso no es una medida de diámetro ni una garantía de apariencia. Compará también proporciones, identificación y la documentación disponible.",
          "Preguntá si es natural o creado en laboratorio y qué tratamientos se declaran. Una piedra que imita el aspecto del diamante es otro material. La palabra ‘diamantado’ puede describir un acabado y no garantiza que el anillo tenga diamantes.",
        ],
        links: [{ label: "Anillos solitarios", href: "/categoria/solitarios" }],
      },
      {
        id: "precio-diamante",
        title: "Precio de un diamante y de un anillo terminado",
        paragraphs: [
          "Dos diamantes del mismo peso pueden tener otras características diferentes. Por eso no hay un precio único para ‘un diamante de un quilate’. Pedí una propuesta de la piedra identificada, con su documentación y las especificaciones que explican el importe.",
          "El anillo terminado incluye además metal, engarce y elaboración. Compará el total en guaraníes y los servicios incluidos. Una cotización de una piedra suelta no representa el precio de una joya completa.",
        ],
        links: [
          { label: "Anillos de compromiso", href: "/categoria/compromiso" },
        ],
      },
      {
        id: "amatista",
        title: "Amatistas para anillos y factores de precio",
        paragraphs: [
          "La amatista es una variedad de cuarzo de color violeta. En una propuesta de anillo con amatista, pedí identificación, dimensiones y cualquier tratamiento informado. La calidad de una fotografía puede alterar cómo percibís el color.",
          "Para comparar precios, separá piedra y pieza terminada. Color, tamaño, talla, metal y construcción pueden influir en la propuesta. No atribuyas efectos curativos a la piedra ni deduzcas su valor de una imagen ilustrativa.",
        ],
        links: [oro, plata],
      },
      {
        id: "cuidados",
        title: "Engarce y cuidados de un anillo con piedra",
        paragraphs: [
          "Revisá la altura de la montura y cómo se sujeta la piedra. Si el anillo se usará a diario, preguntá qué revisiones y precauciones requiere esa construcción. La comodidad incluye cómo se mueve la mano y si las puntas se enganchan en la ropa.",
          "Las gemas y sus tratamientos pueden necesitar cuidados distintos. Evitá vapor o ultrasonidos sin una identificación y evaluación previas. Si la piedra está floja, pedí una revisión antes de seguir usando o limpiar la pieza.",
        ],
        links: [cuidados],
      },
    ],
    faq: [
      {
        question: "¿Diamantado significa que el anillo tiene diamantes?",
        answer:
          "No lo garantiza. Puede referirse al acabado del metal. La ficha debe identificar expresamente las piedras que incluye.",
      },
      {
        question: "¿Quilates de oro y de una piedra significan lo mismo?",
        answer:
          "No. En el oro expresan proporción de oro en la aleación; en una gema, peso.",
      },
      {
        question: "¿Cuánto cuesta una amatista para un anillo?",
        answer:
          "Depende de la piedra identificada y de sus características. Un anillo terminado agrega material y construcción. Pedí una propuesta real en lugar de usar un precio genérico.",
      },
      {
        question: "¿Puedo identificar una piedra por una fotografía?",
        answer:
          "No con certeza. Necesitás información del producto y, cuando corresponda, una identificación o informe de la piedra concreta.",
      },
    ],
    related: [
      { label: "Anillos solitarios", href: "/categoria/solitarios" },
      materiales,
      cuidados,
    ],
    sources: [
      {
        title: "GIA: factores de calidad del diamante",
        url: "https://www.gia.edu/diamond-quality-factor",
      },
      { title: "GIA: amatista", url: "https://www.gia.edu/amethyst" },
      {
        title: "GIA: cuidado de joyería",
        url: "https://www.gia.edu/gia-news-research-tips-caring-jewelry",
      },
    ],
  },
];
