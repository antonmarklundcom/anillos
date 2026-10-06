import type { RingContent } from "./ring-content";

const talles = { label: "Medidas y tallas de anillos", href: "/guias/talles" };
const materiales = {
  label: "Plata 925, oro 18k y acero",
  href: "/guias/materiales",
};
const cuidados = {
  label: "Cómo limpiar y cuidar tus anillos",
  href: "/guias/cuidados",
};
const diferencias = {
  label: "Compromiso, promesa y alianza",
  href: "/guias/compromiso-y-alianzas",
};
const piedras = {
  label: "Piedras para anillos",
  href: "/guias/piedras-para-anillos",
};
const boda = {
  label: "Anillos de boda y alianzas",
  href: "/categoria/alianzas",
};

/** Evergreen buying information. Prices, inventory and offers come only from the catalog. */
export const CATEGORY_PAGES: Record<string, RingContent> = {
  compromiso: {
    title: "Anillos de compromiso en Paraguay",
    heading: "Anillos de compromiso en Paraguay",
    description:
      "Conocé qué comparar al elegir un anillo de compromiso en Paraguay: material, piedra, talle y presupuesto. Revisá las características de cada modelo.",
    sections: [
      {
        id: "elegir",
        title: "Cómo elegir un anillo de compromiso",
        paragraphs: [
          "Un anillo de compromiso acompaña una propuesta de matrimonio. Puede ser un solitario, una banda sencilla o un diseño con varias piedras: el significado lo acuerdan ustedes. Empezá por el gusto de quien lo va a usar y por un presupuesto que puedas destinar con tranquilidad.",
          "Compará altura, ancho y perfil interior. Una montura elevada puede engancharse en la ropa; una banda ancha se siente diferente de una fina. Si se usará junto a una alianza, mirá cómo apoyan ambas piezas. Una fotografía del frente no muestra toda esa información: pedí también una vista lateral y las medidas.",
        ],
        links: [
          diferencias,
          { label: "Anillos solitarios", href: "/categoria/solitarios" },
        ],
      },
      {
        id: "materiales",
        title: "Anillos de compromiso de plata, oro y oro blanco",
        paragraphs: [
          "Separá el material de la forma del anillo. La plata 925, el oro amarillo y el oro blanco son opciones que requieren descripciones distintas de composición y acabado. Un metal plateado en una imagen no permite saber cuál es. Preguntá por el metal base y por cualquier recubrimiento.",
          "Con las piedras ocurre lo mismo: una piedra transparente no es automáticamente un diamante. La ficha debería identificar la gema, su origen declarado y cualquier tratamiento informado. Elegir con datos permite comparar dos propuestas que realmente incluyen lo mismo.",
        ],
        links: [materiales, piedras],
      },
      {
        id: "precios",
        title: "Precios de anillos de compromiso en Paraguay",
        paragraphs: [
          "Para comparar precios en guaraníes, pedí el importe final por un anillo y el detalle de metal, peso declarado, piedra y talle. Confirmá si incluye ajustes, grabado, estuche y entrega. La expresión ‘desde’ necesita una explicación de qué modelo y especificaciones corresponden a ese monto.",
          "El precio del oro por gramo no equivale al precio de un anillo terminado. Diseño, elaboración, gema y servicios pueden formar parte del total. Los conceptos ilustrativos de este sitio no tienen precio ni disponibilidad confirmados; una referencia visual no es una cotización.",
        ],
        links: [{ label: "Comparar anillos de oro", href: "/categoria/oro" }],
      },
      {
        id: "sorpresa",
        title: "Talle, sorpresa y confirmación de entrega",
        paragraphs: [
          "Si la propuesta será una sorpresa, usá como referencia un anillo del mismo dedo y de la misma mano. Medí su diámetro interior y confirmá el resultado con el proveedor. Antes de fabricar o grabar, preguntá qué opciones habrá si el ajuste no resulta cómodo.",
          "Para una consulta desde Luque u otra ciudad de Paraguay, indicá la localidad y la fecha deseada. Confirmá cobertura, costo y plazo con quien vaya a entregar la pieza. No deduzcas que hay retiro en local o envío a tu ciudad porque un modelo aparece en una web.",
        ],
        links: [
          talles,
          { label: "Disponibilidad y entrega", href: "/como-funciona" },
        ],
      },
    ],
    faq: [
      {
        question: "¿Un anillo de compromiso tiene que ser de oro?",
        answer:
          "No existe una obligación de material. Compará composición, comodidad y mantenimiento, y elegí de acuerdo con tu presupuesto y con lo que la pieza significa para ustedes.",
      },
      {
        question: "¿Todo anillo de compromiso lleva un diamante?",
        answer:
          "No. Puede llevar otra gema o no tener piedra. La identidad de una piedra debe constar en la ficha real; no se puede confirmar por una imagen.",
      },
      {
        question: "¿Cuánto cuesta un anillo de compromiso?",
        answer:
          "Depende de sus especificaciones y del contenido de la propuesta. Confirmá el precio final en PYG de un modelo real. No publicamos importes inventados para los conceptos.",
      },
      {
        question: "¿En qué mano va el anillo de compromiso?",
        answer:
          "El uso cambia según las costumbres y las preferencias de la pareja. Elegí la mano y el dedo antes de medir: la talla de una mano no garantiza el mismo ajuste en la otra.",
      },
    ],
    related: [
      { label: "Anillos de promesa", href: "/categoria/promesa" },
      boda,
      talles,
    ],
  },
  promesa: {
    title: "Anillos de promesa en Paraguay",
    heading: "Anillos de promesa en Paraguay",
    description:
      "Elegí un anillo de promesa según su significado, material y talle. Compará estilos para una persona o una pareja y prepará tu consulta en Paraguay.",
    sections: [
      {
        id: "significado",
        title: "Qué significa un anillo de promesa",
        paragraphs: [
          "Un anillo de promesa expresa un compromiso personal que dos personas deciden compartir. Puede representar una relación, una intención de futuro o un momento importante. Conviene conversar sobre ese significado: una forma o un nombre comercial no explica por sí solo qué se está prometiendo.",
          "A diferencia de una propuesta de matrimonio, regalar un anillo de la promesa no tiene que anunciar una boda. Tampoco hay una edad, un presupuesto o un diseño obligatorio. Elegí una pieza que la persona pueda disfrutar y acompañá el regalo con palabras claras sobre lo que significa para vos.",
        ],
        links: [diferencias],
      },
      {
        id: "disenos",
        title: "Plata, bandas simples y otros diseños de promesa",
        paragraphs: [
          "Una banda lisa, un detalle de corazón o una piedra protagonista pueden funcionar como anillo de promesa. Mirá cómo se relaciona el diseño con el estilo cotidiano de quien lo recibe. El ancho, la altura y el acabado importan tanto como la apariencia en una fotografía.",
          "Si buscás anillos de promesa de plata, confirmá si la pieza es plata 925 o si tiene un baño sobre otro metal. Para cualquier opción dorada, pedí la composición y el recubrimiento. El nombre de una colección y una ilustración no certifican el material de una pieza disponible.",
        ],
        links: [
          { label: "Anillos de plata 925", href: "/categoria/plata-925" },
          materiales,
        ],
      },
      {
        id: "pareja",
        title: "Anillos de promesa para parejas",
        paragraphs: [
          "Los anillos de pareja pueden compartir un detalle sin ser idénticos. Uno puede ser más ancho, tener otro acabado o adaptarse mejor a la rutina de cada persona. Diseños complementarios, como sol y luna, son una elección estética; su significado lo acuerdan ustedes.",
          "Si querés dos piezas, anotá dos talles independientes y confirmá qué incluye el precio. Dos anillos mostrados juntos en una foto no garantizan que se vendan como un par. Indicá si necesitás una unidad o dos antes de comparar opciones o pedir un grabado.",
        ],
        links: [boda, talles],
      },
      {
        id: "presupuesto",
        title: "Precio, talle y preparación del regalo",
        paragraphs: [
          "Definí tu presupuesto en guaraníes considerando la pieza, la entrega y cualquier detalle adicional. No es necesario que un anillo de promesa tenga un material costoso para tener valor personal. Una opción sencilla y cómoda puede acompañar mejor la vida diaria.",
          "Para una sorpresa, buscá una referencia del dedo correcto y consultá las condiciones de ajuste antes de personalizar. Si hay una fecha especial, pedí confirmación de disponibilidad y entrega. Los conceptos de este sitio sirven para explorar estilos y no se pueden comprar ni reservar.",
        ],
        links: [talles, cuidados],
      },
    ],
    faq: [
      {
        question: "¿Promesa y compromiso son lo mismo?",
        answer:
          "No necesariamente. Un anillo de compromiso suele acompañar una propuesta de matrimonio; un anillo de promesa puede expresar otro acuerdo personal sin fijar una boda.",
      },
      {
        question: "¿Se regala un anillo o un par?",
        answer:
          "Ambas opciones son posibles. Si eligen un par, confirmen el contenido de la propuesta y los dos talles por separado.",
      },
      {
        question: "¿Hay anillos de promesa para hombre?",
        answer:
          "El significado no depende del género. Elegí ancho, diseño, material y medida de acuerdo con quien lo vaya a usar.",
      },
      {
        question: "¿En qué dedo se usa?",
        answer:
          "No hay un único dedo obligatorio. Decidan dónde se usará y midan ese dedo antes de elegir el talle.",
      },
    ],
    related: [
      { label: "Anillos de compromiso", href: "/categoria/compromiso" },
      diferencias,
      talles,
    ],
  },
  solitarios: {
    title: "Anillos solitarios en Paraguay",
    heading: "Anillos solitarios en Paraguay",
    description:
      "Compará anillos solitarios por su piedra, engarce, material y talle. Conocé qué revisar para elegir un diseño de compromiso o de uso personal en Paraguay.",
    sections: [
      {
        id: "solitario",
        title: "Qué caracteriza a un anillo solitario",
        paragraphs: [
          "El solitario es un diseño en el que una piedra central concentra la atención. Puede elegirse para una propuesta de matrimonio, un regalo o el uso personal. ‘Solitario’ describe el estilo: no identifica por sí solo el metal, la gema ni su calidad.",
          "Compará proporciones además del tamaño de la piedra. Una banda fina y una montura elevada producen una silueta distinta de una base ancha o de un engarce bajo. Mirá el anillo desde el frente y el costado, y pedí medidas para imaginar cómo se sentirá en el dedo.",
        ],
        links: [
          { label: "Anillos de compromiso", href: "/categoria/compromiso" },
        ],
      },
      {
        id: "piedra",
        title: "Diamantes solitarios y otras piedras",
        paragraphs: [
          "Un solitario puede llevar un diamante u otra piedra. Pedí la identidad de la gema, las dimensiones y la información sobre origen o tratamientos que corresponda. El brillo de una foto no demuestra que sea un diamante, una moissanita o una imitación.",
          "Si la propuesta incluye un informe gemológico, verificá a qué piedra pertenece y qué datos describe. El peso en quilates de una gema no equivale a los quilates del oro de la montura. Separar esos datos evita comparar una especificación de piedra con una de metal.",
        ],
        links: [piedras],
      },
      {
        id: "montura",
        title: "Anillos solitarios de oro y de plata",
        paragraphs: [
          "El oro amarillo, el oro blanco y la plata ofrecen apariencias diferentes. Al comparar un solitario de oro, pedí el quilataje y el detalle del acabado; para plata, confirmá composición y recubrimientos. Las imágenes conceptuales muestran formas sin acreditar esos materiales.",
          "Revisá también el engarce y la altura. Preguntá cómo se cuida la sujeción y si el diseño puede apoyarse junto a una alianza. La comodidad depende de la construcción completa, no sólo de la piedra protagonista.",
        ],
        links: [
          materiales,
          { label: "Anillos de oro", href: "/categoria/oro" },
        ],
      },
      {
        id: "comparar",
        title: "Qué comparar antes de elegir un solitario",
        paragraphs: [
          "Armá una comparación con metal, piedra identificada, ancho, altura, talle y precio final de una unidad. Confirmá los servicios incluidos y las condiciones de ajuste. Un precio menor puede corresponder a una especificación diferente y no a una oferta equivalente.",
          "Si será una sorpresa, reservá tiempo para confirmar la medida antes de fabricar o grabar. Elegí pensando en la rutina de quien lo recibe: una pieza que se usa cómoda tiene más posibilidades de acompañar el día a día.",
        ],
        links: [talles, cuidados],
      },
    ],
    faq: [
      {
        question: "¿Todo solitario lleva un diamante?",
        answer:
          "No. Solitario es un estilo de anillo. La piedra debe identificarse por separado en la ficha del producto real.",
      },
      {
        question: "¿Solitario y anillo de compromiso son sinónimos?",
        answer:
          "No exactamente. Muchos solitarios se eligen para compromiso, pero un compromiso puede tener otros diseños y un solitario puede usarse como regalo personal.",
      },
      {
        question: "¿Qué es más importante: tamaño o engarce?",
        answer:
          "Conviene evaluar ambos junto con material, altura y comodidad. Una piedra protagonista necesita una montura adecuada y un talle bien confirmado.",
      },
      {
        question: "¿Las ilustraciones acreditan el metal o la piedra?",
        answer:
          "No. Son referencias de estilo. Para una compra necesitás fotografía y especificaciones de la pieza real, con disponibilidad y precio confirmados.",
      },
    ],
    related: [piedras, materiales, talles],
  },
  alianzas: {
    title: "Anillos de boda y alianzas en Paraguay",
    heading: "Anillos de boda y alianzas en Paraguay",
    description:
      "Compará alianzas de plata y oro para su boda en Paraguay. Revisá materiales, talles y cómo se informa el precio de cada anillo o par.",
    sections: [
      {
        id: "matrimonio",
        title: "Alianzas, anillos de boda y de matrimonio",
        paragraphs: [
          "Alianzas y anillos de matrimonio son nombres habituales para las piezas con las que una pareja representa su unión. Pueden ser bandas lisas, satinadas o con detalles personales. Elegirlas juntos ayuda a encontrar un diseño que cada persona quiera usar.",
          "Los dos anillos no tienen que ser idénticos. Pueden compartir material o acabado y tener anchos diferentes. Piensen en las actividades cotidianas, en el contacto con otras piezas y en la comodidad al cerrar la mano. Una elección conjunta también contempla dos preferencias distintas.",
        ],
        links: [diferencias],
      },
      {
        id: "material",
        title: "Alianzas de plata, oro y acero",
        paragraphs: [
          "Comparen el material base y el acabado de cada propuesta. En plata, diferencien plata 925 y baño de plata. En oro, pidan quilataje, peso y construcción. En acero, consulten aleación y recubrimientos. Un color parecido no vuelve equivalentes a dos piezas.",
          "El material también influye en los cuidados y en las posibilidades de ajuste. No den por hecho que cualquier banda puede modificarse después. Antes de un grabado o una fabricación a medida, confirmen por escrito las condiciones aplicables.",
        ],
        links: [
          { label: "Alianzas de plata", href: "/categoria/alianzas-plata" },
          { label: "Alianzas de oro", href: "/categoria/alianzas-oro" },
          { label: "Anillos de acero", href: "/categoria/acero" },
        ],
      },
      {
        id: "dos-talles",
        title: "Dos talles para un par de anillos de boda",
        paragraphs: [
          "Midan el dedo de cada persona en la mano donde se usará la alianza. Registren las dos medidas con unidad y prueben un ancho parecido al que quieren elegir. Una banda ancha puede sentirse distinta de una fina aunque lleve el mismo número comercial.",
          "La propuesta debe indicar si vende una pieza o un par de dos anillos. Cuando elijan dos, identifiquen el material, ancho y talle de cada uno. No deduzcan el contenido de la compra por la cantidad de anillos que aparece en una fotografía.",
        ],
        links: [talles],
      },
      {
        id: "civil",
        title: "Anillos para una boda civil y su presupuesto",
        paragraphs: [
          "La elección del anillo puede ser sencilla: dos medidas claras, un perfil cómodo y un presupuesto definido. Comparen el precio final en guaraníes incluyendo los extras acordados. Grabado, estuche, ajuste y entrega deben aparecer en la propuesta si forman parte del pedido.",
          "Anoten la fecha deseada y dejen tiempo para probar las piezas. Una fecha en una consulta no es una promesa de fabricación ni de despacho. Esta página trata de elegir anillos; los requisitos de la ceremonia se confirman con el organismo correspondiente.",
        ],
        links: [
          {
            label: "Alianzas para una boda civil",
            href: "/guias/alianzas-boda-civil",
          },
          {
            label: "Anillos de boda económicos",
            href: "/guias/anillos-economicos",
          },
        ],
      },
    ],
    faq: [
      {
        question: "¿Alianza y anillo de compromiso son iguales?",
        answer:
          "Suelen acompañar momentos distintos: la propuesta y la unión. Pueden tener estilos diferentes o usar una misma pieza; lo importante es lo que acuerden ustedes.",
      },
      {
        question: "¿El precio incluye uno o dos anillos?",
        answer:
          "Depende de la propuesta. Confirmá la unidad indicada en la ficha y el total de las dos piezas antes de comparar precios.",
      },
      {
        question: "¿Las alianzas tienen que ser iguales?",
        answer:
          "No. Pueden compartir un detalle y tener anchos, talles o acabados distintos para que cada persona se sienta cómoda.",
      },
      {
        question: "¿Hay que elegir oro para una boda civil?",
        answer:
          "El material del anillo es una elección personal. Comparen composición, comodidad, cuidados y presupuesto sin asumir una obligación de comprar oro.",
      },
    ],
    related: [
      talles,
      materiales,
      {
        label: "Anillos de boda económicos",
        href: "/guias/anillos-economicos",
      },
    ],
  },
  oro: {
    title: "Anillos de oro en Paraguay",
    heading: "Anillos de oro en Paraguay",
    description:
      "Compará anillos de oro en Paraguay por quilataje, diseño y precio. Revisá composición, peso y características para elegir una pieza o un par.",
    sections: [
      {
        id: "composicion",
        title: "Oro macizo, baños y recubrimientos",
        paragraphs: [
          "Al elegir un anillo de oro, empezá por la composición. Una pieza de una aleación de oro no equivale a un metal con un baño dorado. Además, ‘macizo’ puede describir tanto el material como la construcción: preguntá si la banda es hueca o sólida para evitar esa ambigüedad.",
          "Pedí el quilataje y el peso declarado de la pieza. Oro amarillo, blanco y rosa describen distintas apariencias de aleaciones; el color de una imagen no confirma pureza. Un nombre como ‘oro italiano’ tampoco sustituye una especificación del material.",
        ],
        links: [materiales],
      },
      {
        id: "mujer",
        title: "Anillos de oro para mujer",
        paragraphs: [
          "Compará bandas finas, formas anchas y diseños con piedras según el gusto de quien los va a usar. Un detalle con iniciales puede tener significado personal, pero antes de personalizar confirmá el diseño, el talle y las condiciones de modificación.",
          "Si buscás una opción de oro para mujer con presupuesto contenido, compará modelos con especificaciones completas. Una pieza más ligera, una construcción diferente o un recubrimiento pueden explicar un precio distinto. No interpretes ‘barato’ como una garantía de igual material.",
        ],
        links: [talles, { label: "Solitarios", href: "/categoria/solitarios" }],
      },
      {
        id: "carretones",
        title: "Anillos carretón de oro y diseños para hombre",
        paragraphs: [
          "Cuando consultes por un anillo carretón, pedí una foto real y medidas de ancho, altura y perfil. Los nombres de estilos pueden variar entre proveedores. Una descripción de la forma resulta más precisa que asumir que todos los modelos llamados carretón tienen la misma construcción.",
          "Para anillos de oro para hombre, probá el ancho y el ajuste en el dedo elegido. Una banda con más superficie puede sentirse distinta de un anillo fino. Compará peso, comodidad y posibilidad de ajuste antes de decidir por la apariencia frontal.",
        ],
        links: [
          { label: "Anillos para hombre", href: "/categoria/hombre" },
          talles,
        ],
      },
      {
        id: "precios-18k",
        title: "Precios de anillos de oro 18k en Paraguay",
        paragraphs: [
          "Un anillo de oro 18k terminado se cotiza por sus especificaciones completas. El precio del oro por gramo es una referencia del material, no una tarifa de joyería. El peso de la aleación, la elaboración, las piedras y los servicios pueden formar parte del precio final.",
          "Pedí el total en PYG, la vigencia de la propuesta y qué incluye. Confirmá el precio de un anillo o del par, según lo que necesitás. Los conceptos ilustrativos no tienen un importe verificado; no publicamos una cotización diaria del oro ni deducimos precios a partir de una foto.",
        ],
        links: [
          materiales,
          { label: "Prepará una consulta de precio", href: "/contacto" },
        ],
      },
      {
        id: "alianzas",
        title: "Anillos de oro para boda y aniversario",
        paragraphs: [
          "Para alianzas, comparen las dos piezas con sus talles y especificaciones independientes. Un ancho igual no significa necesariamente un peso igual. Si el regalo es para un aniversario, revisá la medida actual en lugar de reutilizar sin comprobar un talle de hace años.",
          "Definí con tiempo el material, el diseño y cualquier grabado. Un texto personalizado exige revisar la escritura y confirmar el espacio disponible. La entrega, el ajuste y las garantías deben constar en una propuesta real antes de pagar.",
        ],
        links: [
          { label: "Alianzas de oro", href: "/categoria/alianzas-oro" },
          { label: "Anillos para bodas de oro", href: "/guias/bodas-de-oro" },
        ],
      },
    ],
    faq: [
      {
        question: "¿Qué significa oro 18k?",
        answer:
          "Es una aleación con 18 partes de oro de un total de 24, equivalente al 75 %. El sello 750 expresa esa proporción; la identificación de una pieza real requiere documentación y comprobación.",
      },
      {
        question: "¿Un anillo dorado es de oro?",
        answer:
          "No necesariamente. Puede ser otro metal con un recubrimiento. Pedí la composición del material base y del acabado.",
      },
      {
        question: "¿Cómo comparar precios de anillos de oro?",
        answer:
          "Compará el mismo quilataje, peso, construcción, piedra y contenido de la propuesta. Confirmá el monto final en guaraníes y los extras incluidos.",
      },
      {
        question: "¿Oro italiano y oro 18k significan lo mismo?",
        answer:
          "No. Una denominación de procedencia y una medida de pureza son datos diferentes. Confirmá ambos sin inferir uno a partir del otro.",
      },
    ],
    related: [
      materiales,
      { label: "Alianzas de oro", href: "/categoria/alianzas-oro" },
      cuidados,
    ],
  },
  hombre: {
    title: "Anillos para hombre en Paraguay",
    heading: "Anillos para hombre en Paraguay",
    description:
      "Compará anillos para hombre en Paraguay por material, ancho y diseño. Conocé cómo medir el talle y qué confirmar sobre cada pieza antes de elegir.",
    sections: [
      {
        id: "disenos",
        title: "Bandas lisas, anillos anchos y diseños personales",
        paragraphs: [
          "Elegí un anillo pensando en el dedo donde lo usarás y en tu rutina. Una banda discreta, un perfil ancho o una pieza con un detalle protagonista pueden sentirse muy distintos. El diseño para hombre no impone una forma: la comodidad y tu gusto son el punto de partida.",
          "Compará fotos laterales, ancho y perfil interior. Si trabajás con las manos, pensá cuándo tendrías que retirar la pieza para evitar golpes o enganches. Probá un ancho parecido al que te interesa antes de tomar el número de otra banda como referencia definitiva.",
        ],
        links: [
          talles,
          { label: "Estilos de anillos", href: "/guias/estilos-de-anillos" },
        ],
      },
      {
        id: "plata",
        title: "Anillos de plata para hombre",
        paragraphs: [
          "Para un anillo de plata liso o ancho, confirmá la composición y cualquier recubrimiento. Plata 925 no significa lo mismo que baño de plata. Un acabado pulido y uno satinado pueden requerir cuidados distintos aunque tengan el mismo material base.",
          "Si querés un grabado, revisá el texto y consultá las condiciones de ajuste antes de personalizar. La foto de una pieza grabada no implica que el servicio esté incluido ni que se pueda aplicar a cualquier modelo.",
        ],
        links: [
          { label: "Anillos de plata 925", href: "/categoria/plata-925" },
          cuidados,
        ],
      },
      {
        id: "oro",
        title: "Anillos de oro para hombre",
        paragraphs: [
          "Al comparar oro, pedí quilataje, peso y construcción. Un diseño de apariencia dorada puede llevar un recubrimiento; una pieza ancha puede ser hueca o sólida. Esos datos ayudan a entender el precio y la sensación al usarla.",
          "Para un carretón u otra forma de volumen, pedí medidas completas y probá el apoyo sobre el dedo. Un nombre de estilo no confirma la forma exacta ni el material de una pieza. Compará modelos reales con su ficha antes de decidir.",
        ],
        links: [
          { label: "Anillos de oro", href: "/categoria/oro" },
          materiales,
        ],
      },
      {
        id: "acero",
        title: "Acero, talla y presupuesto",
        paragraphs: [
          "Si empezás por acero, consultá la aleación y el acabado. ‘Acero quirúrgico’ es una descripción que debe respaldarse con información del producto; no garantiza por sí sola que una pieza sea adecuada para todas las personas.",
          "Medí el dedo elegido y confirmá la escala del fabricante. El precio, el ajuste y la entrega se revisan para cada modelo disponible. En un regalo, un talle aproximado sólo sirve para iniciar la consulta: necesitás confirmar cómo se resolvería un cambio de medida.",
        ],
        links: [
          { label: "Anillos de acero", href: "/categoria/acero" },
          talles,
        ],
      },
    ],
    faq: [
      {
        question: "¿Qué ancho de anillo conviene para hombre?",
        answer:
          "No hay un ancho universal. Probá una banda similar a la que querés y evaluá comodidad, paso por el nudillo y movimiento del dedo.",
      },
      {
        question: "¿La talla depende del género?",
        answer:
          "Se determina por el dedo concreto y por el sistema de medidas del fabricante. No elijas un talle sólo por una etiqueta de género.",
      },
      {
        question: "¿Puedo usar una alianza como anillo personal?",
        answer:
          "Sí. Una banda puede tener el significado que quieras darle. Confirmá material y medida como lo harías con cualquier anillo.",
      },
      {
        question: "¿Hay un precio general para anillos para hombre?",
        answer:
          "No: depende del material, la construcción y el diseño. Compará propuestas con especificaciones equivalentes y precio final en PYG.",
      },
    ],
    related: [talles, materiales, boda],
  },
  "plata-925": {
    title: "Anillos de plata 925 en Paraguay",
    heading: "Anillos de plata 925 en Paraguay",
    description:
      "Conocé los anillos de plata 925 en Paraguay y compará diseños, talles y precios. Revisá composición, recubrimientos y cuidados antes de elegir.",
    sections: [
      {
        id: "plata",
        title: "Qué comparar en un anillo de plata 925",
        paragraphs: [
          "Plata 925 describe una aleación con 92,5 % de plata. Es diferente de una capa de plata aplicada sobre otro metal. Cuando compares anillos de plata, pedí el material base, cualquier recubrimiento y la documentación de la pieza real.",
          "El sello 925 ayuda a interpretar una descripción, pero no reemplaza una comprobación. Tampoco una ilustración de color plateado demuestra composición. Elegí con una ficha que explique qué recibís y cómo cuidarlo.",
        ],
        links: [materiales],
      },
      {
        id: "disenos",
        title: "Bandas, formas delicadas y anillos de plata para mujer",
        paragraphs: [
          "Una banda lisa, una línea orgánica o un anillo con piedra pueden acompañar usos diferentes. Mirá ancho, altura y perfil interior. Para un diseño ajustable, preguntá qué rango de medidas admite y cómo se ajusta sin dañar la pieza.",
          "La elección no depende sólo del género indicado en un catálogo. Lo importante es que el diseño te guste y se sienta cómodo en el dedo donde lo usarás. Para un anillo de plata para hombre, aplican las mismas preguntas de composición, medidas y acabado.",
        ],
        links: [
          { label: "Anillos para hombre", href: "/categoria/hombre" },
          talles,
        ],
      },
      {
        id: "precios",
        title: "Precios de anillos de plata 925 en Paraguay",
        paragraphs: [
          "El precio de un anillo terminado incluye más que la cantidad de plata. Diseño, elaboración, piedra, recubrimiento y servicios pueden cambiar el total. Una cotización de plata por gramo no permite deducir el precio de una joya.",
          "Compará importes finales en guaraníes por la misma unidad. Si necesitás alianzas, confirmá si se cotiza una pieza o el par y qué talles incluye. Los conceptos ilustrativos de esta web no tienen precios confirmados ni se ofrecen como mercadería disponible.",
        ],
        links: [
          { label: "Alianzas de plata", href: "/categoria/alianzas-plata" },
        ],
      },
      {
        id: "cuidados",
        title: "Talle y cuidados de la plata",
        paragraphs: [
          "Medí el diámetro interior de un anillo que te queda en el mismo dedo y confirmá la medida con el proveedor. Una banda ancha puede necesitar una prueba distinta de una fina. Consultá si el diseño y sus piedras permiten modificar el talle.",
          "Para la limpieza, conocé primero si tiene un baño, un acabado especial o piedras. Guardá las piezas separadas y seguí las instrucciones específicas. Una recomendación para plata lisa no se aplica automáticamente a cualquier anillo de apariencia plateada.",
        ],
        links: [talles, cuidados],
      },
    ],
    faq: [
      {
        question: "¿925 significa plata?",
        answer:
          "En una descripción de plata, 925 indica 925 partes de plata por cada mil. La marca es una pista; para una pieza concreta pedí documentación y verificación de la composición.",
      },
      {
        question: "¿Plata italiana 925 tiene otra pureza?",
        answer:
          "La indicación 925 expresa la misma proporción. La procedencia es otro dato y debe confirmarse por separado.",
      },
      {
        question: "¿Por qué dos anillos de plata tienen precios diferentes?",
        answer:
          "Pueden cambiar peso, construcción, diseño, piedras o servicios. Compará la ficha y el contenido de la propuesta antes de comparar sólo el monto.",
      },
      {
        question: "¿Se puede cambiar el talle?",
        answer:
          "Depende de la pieza y del servicio disponible. Confirmá las posibilidades y condiciones antes de fabricar, grabar o pagar.",
      },
    ],
    related: [
      materiales,
      cuidados,
      { label: "Alianzas de plata", href: "/categoria/alianzas-plata" },
    ],
  },
  "alianzas-plata": {
    title: "Alianzas de plata en Paraguay",
    heading: "Alianzas de plata en Paraguay",
    description:
      "Compará alianzas de plata para su boda en Paraguay: composición, ancho y talles. Confirmá si el precio corresponde a una pieza o al par de dos anillos.",
    sections: [
      {
        id: "elegir",
        title: "Alianzas de plata para boda y matrimonio",
        paragraphs: [
          "Las alianzas de plata pueden ser una opción para compartir una banda sencilla y cotidiana. Empiecen por lo que cada persona quiere usar: ancho, perfil redondeado o plano y acabado pulido o satinado. Pueden tener diferencias y seguir formando una elección conjunta.",
          "Para confirmar el material, pidan composición y recubrimientos de ambas piezas. Plata 925 y baño de plata no son equivalentes. La apariencia de una imagen no permite identificar una aleación ni confirmar que haya dos productos disponibles.",
        ],
        links: [materiales, boda],
      },
      {
        id: "medidas",
        title: "Dos medidas independientes",
        paragraphs: [
          "Cada persona necesita una medida del dedo donde usará la alianza. Prueben un ancho parecido al elegido y confirmen el sistema del proveedor. Una misma cifra en dos escalas distintas puede no representar la misma medida.",
          "Anoten las medidas en la propuesta como persona A y persona B, con el ancho correspondiente. Si se prevé ajuste o fabricación, consulten condiciones antes de grabar. No supongan que las dos piezas tendrán el mismo peso por compartir diseño.",
        ],
        links: [talles],
      },
      {
        id: "precio",
        title: "Precio del par y detalles incluidos",
        paragraphs: [
          "La unidad debe quedar clara: un anillo o un par de dos anillos. Pidan el total en guaraníes y el detalle de material, talles y extras. Un grabado o un estuche que aparece en una foto no está necesariamente incluido.",
          "Comparen propuestas completas con la misma cantidad de piezas. Confirmen ajuste, cambios y entrega para los dos talles. Un concepto visual permite conversar sobre estilo, pero no tiene una cotización ni una fecha de despacho asociadas.",
        ],
        links: [
          {
            label: "Organizar alianzas para el civil",
            href: "/guias/alianzas-boda-civil",
          },
        ],
      },
      {
        id: "mantenimiento",
        title: "Cuidados y uso diario",
        paragraphs: [
          "Los cuidados dependen de la aleación, el acabado y cualquier piedra o recubrimiento. Guarden las alianzas separadas y eviten aplicar limpiadores sin identificar antes la superficie. Un acabado satinado no debería tratarse como si fuera uno pulido.",
          "Si la boda tiene una fecha definida, dejen tiempo para probar ambas piezas. La fecha deseada sirve para preparar la consulta; el proveedor deberá confirmar qué puede cumplir antes de aceptar el pedido.",
        ],
        links: [cuidados],
      },
    ],
    faq: [
      {
        question: "¿Un par incluye dos talles diferentes?",
        answer:
          "Debería especificarlos. Confirmá que la propuesta identifica las medidas de las dos personas y el contenido del par.",
      },
      {
        question: "¿Alianzas de plata significa plata 925?",
        answer:
          "Necesitás una especificación de la aleación. No deduzcas el porcentaje por el nombre de la colección o por la fotografía.",
      },
      {
        question: "¿Se pueden grabar las alianzas?",
        answer:
          "Depende del diseño y del servicio disponible. Confirmá espacio, texto, precio y condiciones de ajuste antes de personalizar.",
      },
      {
        question: "¿Las alianzas de plata tienen que ser iguales?",
        answer:
          "No. Pueden compartir material y acabado con anchos y medidas diferentes, según la comodidad de cada persona.",
      },
    ],
    related: [
      boda,
      talles,
      {
        label: "Anillos de boda económicos",
        href: "/guias/anillos-economicos",
      },
    ],
  },
  "alianzas-oro": {
    title: "Alianzas de oro en Paraguay",
    heading: "Alianzas de oro en Paraguay",
    description:
      "Compará alianzas de oro en Paraguay por quilataje, peso, ancho y talle. Revisá qué incluye la propuesta y el precio final del par de dos anillos.",
    sections: [
      {
        id: "oro",
        title: "Quilataje y construcción de las alianzas",
        paragraphs: [
          "Una propuesta de alianzas de oro debe identificar el quilataje de cada pieza. Oro 18k y oro 14k son composiciones diferentes; un baño dorado sobre otro metal es otra clase de producto. Pedí también el peso declarado y si la construcción es hueca o sólida.",
          "El color amarillo, blanco o rosa no demuestra la pureza. Si hay un recubrimiento, confirmá cuál es y qué mantenimiento exige. Comparar estas especificaciones permite entender por qué dos pares de apariencia parecida pueden tener precios distintos.",
        ],
        links: [materiales],
      },
      {
        id: "diseno",
        title: "Ancho, perfil y dos talles",
        paragraphs: [
          "Elijan el ancho y perfil que resulta cómodo para cada persona. Una banda ancha puede sentirse distinta de una fina. Prueben una referencia similar y confirmen ambos talles en el sistema de medidas del fabricante.",
          "Las alianzas pueden compartir acabado con anchos diferentes. Si una se usará junto a un anillo de compromiso, revisen el contacto entre las piezas. Registren cada medida por separado antes de una fabricación o un grabado.",
        ],
        links: [talles, diferencias],
      },
      {
        id: "precio",
        title: "Precio de alianzas de oro: pieza o par",
        paragraphs: [
          "Pidan una propuesta que indique si el precio corresponde a una pieza o a un par de dos anillos. Identifiquen quilataje, peso, ancho y talle de ambos. El valor del oro por gramo no representa por sí solo el costo del par terminado.",
          "Confirmen qué incluye el importe final en PYG: piezas, grabado, estuche, ajustes y entrega si se ofrecen. Comparen el mismo contenido de pedido y la vigencia de cada cotización. Los conceptos ilustrativos no tienen un precio de proveedor publicado.",
        ],
        links: [
          {
            label: "Comparar precios de anillos de oro",
            href: "/categoria/oro#precios-18k",
          },
        ],
      },
      {
        id: "fecha",
        title: "Preparación para la boda",
        paragraphs: [
          "Anoten la fecha deseada y pidan una confirmación real de fabricación o despacho. Dejen tiempo para probar las dos piezas. Antes de personalizar, revisen escritura, medidas y condiciones si se necesita una modificación.",
          "Una guía no sustituye las condiciones de la propuesta. Cobertura de entrega, cambios y mantenimiento deben confirmarse con quien venda las piezas antes de pagar.",
        ],
        links: [
          {
            label: "Alianzas para el civil",
            href: "/guias/alianzas-boda-civil",
          },
          cuidados,
        ],
      },
    ],
    faq: [
      {
        question: "¿El precio del par se obtiene duplicando el de un anillo?",
        answer:
          "No necesariamente. Los talles, anchos y pesos pueden ser distintos. Pedí el total de las dos piezas con sus especificaciones.",
      },
      {
        question: "¿750 y 18k expresan lo mismo?",
        answer:
          "Como indicaciones de pureza del oro, ambas representan el 75 %. La composición de una pieza real necesita documentación y comprobación.",
      },
      {
        question: "¿Se pueden elegir dos anchos distintos?",
        answer:
          "Es una posibilidad de diseño que debés confirmar con el proveedor. La propuesta tiene que describir cada pieza por separado.",
      },
      {
        question: "¿El grabado está incluido?",
        answer:
          "Sólo si se indica expresamente. Confirmá texto, precio, espacio disponible y condiciones de ajuste antes de autorizarlo.",
      },
    ],
    related: [boda, materiales, talles],
  },
  acero: {
    title: "Anillos de acero en Paraguay",
    heading: "Anillos de acero en Paraguay",
    description:
      "Compará anillos de acero en Paraguay por composición, acabado, ancho y talle. Conocé qué preguntar sobre acero quirúrgico y recubrimientos.",
    sections: [
      {
        id: "composicion",
        title: "Acero inoxidable y acero quirúrgico: qué preguntar",
        paragraphs: [
          "Los nombres comerciales del acero no reemplazan una ficha de composición. Si buscás anillos de acero quirúrgico, pedí la aleación declarada y el detalle del acabado. No todos los productos llamados acero comparten las mismas especificaciones.",
          "El color también necesita una explicación. Una pieza dorada puede llevar un recubrimiento sobre el acero; ese acabado tiene sus propias instrucciones de cuidado. Una fotografía permite comparar el diseño, pero no certifica la aleación.",
        ],
        links: [materiales],
      },
      {
        id: "disenos",
        title: "Bandas simples, anillos anchos y uso cotidiano",
        paragraphs: [
          "Compará ancho, perfil interior y altura. Una banda sencilla puede acompañar diferentes estilos sin una piedra protagonista. Mirá el diseño de costado y pensá cómo se sentirá al mover la mano o al usar otras piezas.",
          "Probá una referencia de ancho parecido antes de elegir el talle. Para dos anillos de pareja, cada persona necesita su medida. Una apariencia similar no significa que ambos anillos deban tener la misma talla o el mismo ancho.",
        ],
        links: [
          talles,
          { label: "Anillos para hombre", href: "/categoria/hombre" },
        ],
      },
      {
        id: "presupuesto",
        title: "Cómo comparar una opción accesible",
        paragraphs: [
          "Pedí el precio final en guaraníes por una unidad y confirmá los extras incluidos. El importe no basta para comparar: revisá material, acabado, medidas y condiciones. Una opción accesible sigue necesitando una descripción precisa.",
          "Antes de encargar, preguntá si el talle se puede modificar y qué condiciones aplicarían a un cambio. No asumas que una banda de acero se ajusta igual que una de plata u oro. El diseño y la construcción concreta son parte de esa respuesta.",
        ],
        links: [
          {
            label: "Elegir anillos económicos",
            href: "/guias/anillos-economicos",
          },
        ],
      },
      {
        id: "cuidados",
        title: "Cuidar el acabado y confirmar la pieza",
        paragraphs: [
          "Seguí las instrucciones del fabricante, especialmente si hay un recubrimiento. Guardá los anillos separados y evitá aplicar abrasivos o químicos sin conocer la superficie. El cuidado de una pieza lisa no sirve automáticamente para una con piedras o capas de color.",
          "Las imágenes conceptuales de este sitio ayudan a explorar formas. Para una compra hacen falta una pieza real, composición identificada, precio y disponibilidad confirmados. Una ilustración no acredita ninguna de esas condiciones.",
        ],
        links: [cuidados],
      },
    ],
    faq: [
      {
        question: "¿Acero y acero quirúrgico son siempre equivalentes?",
        answer:
          "No conviene asumirlo. Pedí la aleación declarada y el respaldo de la descripción del producto concreto.",
      },
      {
        question: "¿Un anillo de acero dorado contiene oro?",
        answer:
          "El color puede provenir de un recubrimiento. Necesitás identificar el material base y el acabado antes de sacar esa conclusión.",
      },
      {
        question: "¿Se puede modificar el talle de un anillo de acero?",
        answer:
          "Depende de la pieza y de los servicios disponibles. Confirmá esa posibilidad antes de elegir, especialmente si el anillo será un regalo.",
      },
      {
        question: "¿El acero es adecuado para cualquier persona?",
        answer:
          "No hay una garantía universal basada sólo en el nombre. Consultá la composición y tus necesidades particulares antes de usar una pieza.",
      },
    ],
    related: [materiales, talles, cuidados],
  },
};
