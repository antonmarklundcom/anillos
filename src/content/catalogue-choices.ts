export type CatalogueChoice = {
  title: string;
  detail: string;
  check: string;
  guide: string;
};

/** Style comparisons, not product offers. No supplier research enters public props. */
export const CATALOGUE_CHOICES: Record<string, CatalogueChoice[]> = {
  solitarios: [
    {
      title: "Cuatro puntas o engarce cerrado",
      detail: "Compará cuánto se ve de la piedra y cómo queda protegida.",
      check: "Pedí una vista frontal y otra lateral del modelo real.",
      guide: "piedras-para-anillos",
    },
    {
      title: "Altura y banda",
      detail:
        "Un solitario también se elige por su perfil y cómo acompaña tu mano.",
      check:
        "Confirmá altura, ancho y comodidad; el brillo no identifica la gema.",
      guide: "estilos-de-anillos",
    },
  ],
  promesa: [
    {
      title: "Una banda sencilla",
      detail:
        "El significado puede estar en una forma discreta que uses cada día.",
      check: "Compará ancho, perfil interior y acabado en una pieza real.",
      guide: "compromiso-y-alianzas",
    },
    {
      title: "Una piedra o un corazón",
      detail: "Elegí el detalle que conecte con tu historia y tu estilo.",
      check: "Confirmá piedra, metal base y recubrimiento por separado.",
      guide: "materiales",
    },
  ],
  compromiso: [
    {
      title: "La piedra como protagonista",
      detail: "Compará la forma de la piedra y la altura de la montura.",
      check:
        "Pedí identidad y documentación de la gema; una imagen no la certifica.",
      guide: "piedras-para-anillos",
    },
    {
      title: "El perfil que te acompaña",
      detail:
        "Pensá en el uso diario y cómo combinarías el anillo con otra banda.",
      check:
        "Confirmá medidas, posibilidad de ajuste y condiciones antes de decidir.",
      guide: "compromiso-y-alianzas",
    },
  ],
  alianzas: [
    {
      title: "Perfil plano o media caña",
      detail: "Compará una superficie plana con una curva suave.",
      check: "Revisá el ancho, espesor y perfil interior de cada anillo.",
      guide: "alianzas-boda-civil",
    },
    {
      title: "Dos medidas, una elección",
      detail: "Cada persona puede necesitar un talle y ancho diferentes.",
      check:
        "Confirmá que la propuesta incluye dos piezas y detalla cada medida.",
      guide: "talles",
    },
  ],
  "alianzas-plata": [
    {
      title: "Banda lisa o con detalle",
      detail:
        "Compará perfiles simples, texturas y apliques sin perder de vista el material.",
      check: "“Plata nacional” no confirma por sí sola una ley 925.",
      guide: "materiales",
    },
    {
      title: "El par completo",
      detail:
        "Elegí sus medidas por separado y compará el contenido de la propuesta.",
      check:
        "Pedí composición, ancho y total de las dos piezas, sin asumir extras.",
      guide: "alianzas-boda-civil",
    },
  ],
  "alianzas-oro": [
    {
      title: "Cinta o media caña",
      detail: "La silueta cambia aunque dos bandas tengan un ancho parecido.",
      check: "Compará sección, ancho y espesor con una vista lateral real.",
      guide: "estilos-de-anillos",
    },
    {
      title: "Composición y peso",
      detail:
        "Una cotización se entiende mejor cuando detalla cada una de las dos piezas.",
      check: "Confirmá quilataje, peso, medidas y qué incluye el par.",
      guide: "materiales",
    },
  ],
  oro: [
    {
      title: "Aleación o baño dorado",
      detail:
        "El color puede ser parecido; la construcción y el cuidado son distintos.",
      check:
        "Pedí metal base, quilataje y recubrimiento. No los deduzcas de una foto.",
      guide: "materiales",
    },
    {
      title: "Banda o solitario",
      detail: "Compará proporción y perfil antes de elegir por el brillo.",
      check: "Confirmá ancho, peso y, si hay piedra, su identidad.",
      guide: "estilos-de-anillos",
    },
  ],
  hombre: [
    {
      title: "Ancho y perfil",
      detail:
        "Compará una banda estrecha con una más ancha en el dedo donde la usarías.",
      check: "El ancho no reemplaza la medida interior; revisá ambos.",
      guide: "talles",
    },
    {
      title: "Liso o con textura",
      detail: "Elegí el acabado que te gusta y preguntá cómo se mantiene.",
      check: "Confirmá material, recubrimientos y posibilidades de ajuste.",
      guide: "cuidados",
    },
  ],
  acero: [
    {
      title: "Liso o satinado",
      detail: "Compará cómo cambia el acabado con la luz y el uso cotidiano.",
      check: "Pedí composición y detalles de cualquier recubrimiento.",
      guide: "materiales",
    },
    {
      title: "Tu medida primero",
      detail: "Elegí ancho y perfil con una medida del dedo correcto.",
      check:
        "Confirmá talles disponibles y posibilidad de ajuste del modelo real.",
      guide: "talles",
    },
  ],
  "plata-925": [
    {
      title: "Una línea simple",
      detail: "Compará silueta, ancho y terminaciones antes de elegir.",
      check:
        "Confirmá ley 925 en la pieza; la apariencia plateada no la acredita.",
      guide: "materiales",
    },
    {
      title: "Un detalle de piedra",
      detail: "Una piedra suma forma y color, además de sus propios cuidados.",
      check: "Pedí identidad de la gema y cómo está fijada a la montura.",
      guide: "piedras-para-anillos",
    },
  ],
};
