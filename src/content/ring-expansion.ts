import type { Guide } from "./guides";
import type { ContentSection, RingContent } from "./ring-content";

type Addition = Pick<RingContent, "sections" | "faq" | "related"> &
  Pick<Partial<RingContent>, "sources">;
const section = (
  id: string,
  title: string,
  ...paragraphs: string[]
): ContentSection => ({ id, title, paragraphs });
const link = (label: string, href: string) => ({ label, href });
const custom = link(
  "Elegir anillos personalizados y grabados",
  "/guias/anillos-personalizados"
);
const colors = link(
  "Rubí, zafiro, esmeralda y otras piedras",
  "/guias/piedras-de-color"
);
const symbols = link(
  "Anillos con significado",
  "/guias/anillos-con-significado"
);
const materials = link("Comparar los materiales", "/guias/materiales");
const styles = link("Estilos y formas de anillos", "/guias/estilos-de-anillos");
const stones = link(
  "Diamantes, moissanita y alternativas",
  "/guias/piedras-para-anillos"
);
const sizes = link("Cómo elegir el talle", "/guias/talles");
const care = link("Cuidado de los anillos", "/guias/cuidados");
const source = (title: string, url: string) => ({ title, url });
const addition = (
  sections: ContentSection[],
  related: RingContent["related"] = [],
  faq: RingContent["faq"] = [],
  sources: RingContent["sources"] = []
): Addition => ({ sections, related, faq, sources });

/** Extend existing destinations without changing their primary intent or section IDs. */
export function appendRingContent<
  T extends Pick<RingContent, "sections" | "faq" | "related" | "sources">,
>(page: T, extra?: Addition): T {
  if (!extra) return page;
  const related = [...page.related];
  for (const item of extra.related)
    if (!related.some((existing) => existing.href === item.href))
      related.push(item);
  const sources = [...(page.sources ?? [])];
  for (const item of extra.sources ?? [])
    if (!sources.some((existing) => existing.url === item.url))
      sources.push(item);
  return {
    ...page,
    sections: [...page.sections, ...extra.sections],
    faq: [...page.faq, ...extra.faq],
    related,
    sources,
  };
}

export const CATEGORY_EXPANSION: Record<string, Addition> = {
  compromiso: addition(
    [
      section(
        "compromiso-hombre",
        "Anillos de compromiso para hombre",
        "Un anillo de compromiso para hombre puede ser una banda lisa, un sello o un diseño con una piedra. El sentido de la propuesta no depende de usar un solitario tradicional. Elegí según la mano, la rutina y los gustos de quien lo va a recibir: el ancho y la altura influyen tanto como el color.",
        "Si ambos quieren llevar anillo, comparen cada pieza por separado y definan qué compartir: material, acabado, inscripción o un detalle del diseño. No hace falta que tengan el mismo ancho o talle. Confirmá también si el precio corresponde a una unidad o a un par."
      ),
      section(
        "compromiso-sencillo",
        "Un anillo de compromiso sencillo",
        "Para un diseño sencillo, fijate en la proporción entre la banda y la piedra, el espacio bajo el engaste y cómo se combina con una futura alianza. Una banda fina no garantiza comodidad ni resistencia: importan su construcción y el uso previsto.",
        "Una piedra de color o una alternativa al diamante puede formar parte de una propuesta. Pedí el nombre preciso de la gema, su origen declarado y sus tratamientos; el parecido en una imagen no confirma qué material recibís. Compará propuestas con una ficha completa antes de decidir."
      ),
    ],
    [custom, colors]
  ),
  promesa: addition(
    [
      section(
        "promesa-corazon-infinito",
        "Corazón, infinito o una promesa sencilla",
        "Un corazón, un infinito o una banda lisa pueden representar una promesa personal. Elegí un símbolo que tenga sentido para ustedes y pensá si la persona querrá llevarlo todos los días. El significado que le dan a la pieza es más importante que una regla sobre su forma.",
        "Para un regalo, confirmá el talle sin asumir que todos los dedos usan la misma medida. Si considerás grabar una fecha o un nombre, averiguá primero si el diseño admite la inscripción y cómo cambia la posibilidad de devolución. No todos los anillos pueden personalizarse."
      ),
    ],
    [symbols, custom],
    [],
    [
      source(
        "GIA: combinar bandas y anillos",
        "https://4cs.gia.edu/en-us/blog/guide-on-how-to-stack-rings/"
      ),
    ]
  ),
  solitarios: addition(
    [
      section(
        "forma-piedra-solitario",
        "Redondo, ovalado, princesa o marquesa",
        "La forma describe el contorno de la piedra; la talla describe cómo está trabajada. Un solitario redondo, ovalado, princesa o marquesa puede ocupar un espacio distinto sobre la mano aunque las piedras tengan el mismo peso. Pedí medidas en milímetros y una vista lateral para comparar.",
        "En formas con puntas o esquinas, observá cómo las protege el engaste y si el diseño puede engancharse con la ropa. La elección también debe considerar el mantenimiento y la comodidad junto a otra banda, además de la apariencia en una foto."
      ),
      section(
        "alternativas-solitario",
        "Solitarios con otras gemas",
        "Solitario significa que una piedra ocupa el lugar central del diseño; no identifica por sí solo un diamante. Un modelo puede llevar moissanita, circonita u otra gema. La ficha debe decir qué piedra es y qué información respalda esa identificación.",
        "Al comparar precios, separá el material de la banda, la piedra y su tamaño. No compares sólo el diámetro visible ni tomes palabras como ‘brillante’ como prueba de composición. Elegí una pieza con información que puedas revisar antes de pagar."
      ),
    ],
    [stones, colors]
  ),
  alianzas: addition(
    [
      section(
        "alianzas-media-cana",
        "Media caña, banda plana y ajuste interior",
        "Una alianza de media caña tiene un perfil exterior curvo; una banda plana ofrece otra apariencia. Ninguna forma determina por sí sola la comodidad. El ancho, el espesor, los bordes y el perfil interior cambian la sensación al cerrar la mano.",
        "Prueben cada pieza en el dedo donde se usará. Si quieren alianzas diferentes pero relacionadas, pueden compartir el material o el acabado y elegir anchos distintos. Pedí medidas y una confirmación del talle para cada persona."
      ),
      section(
        "alianzas-grabadas",
        "Nombres, fechas y grabados de boda",
        "Antes de encargar un grabado, revisá el texto exacto, los acentos, la fecha y el espacio disponible. Confirmá dónde se hará la inscripción, cómo se verá y si el interior admite el trabajo sin afectar marcas o características de la pieza.",
        "El grabado no está incluido por defecto. Consultá disponibilidad, costo, tiempo y condiciones de cambios antes de aprobarlo. Si el talle todavía es incierto, resolvé primero el ajuste y después la personalización."
      ),
    ],
    [custom, styles]
  ),
  oro: addition(
    [
      section(
        "oro-rosa-blanco",
        "Oro rosa, amarillo o blanco",
        "El color del oro depende de la aleación y puede intervenir un acabado superficial. Oro rosa, rosado o blanco describe una apariencia, pero no informa por sí solo los quilates ni si hay un recubrimiento. Pedí esos datos por separado.",
        "Elegí el color considerando las joyas que ya usás y cómo se mantiene la pieza. En oro blanco conviene consultar si lleva rodio y qué atención necesitará ese acabado. Para comparar propuestas, usá la misma ley de oro y una construcción equivalente."
      ),
      section(
        "oro-quilates-precio",
        "Comparar oro de 14k, 18k y 24k",
        "Los quilates del oro expresan su proporción de oro: no son los quilates que miden el peso de una gema. La ley, el peso y la fabricación deben constar en la información de la pieza. Un color intenso o una foto no acreditan oro macizo.",
        "El precio de un anillo terminado incluye más que el metal. Pedí peso cuando esté disponible, composición, piedra y condiciones de la oferta. Un baño de oro o una descripción ‘color oro’ no equivale a una pieza de oro de 18k; confirmá el metal base y el recubrimiento."
      ),
    ],
    [materials, custom]
  ),
  hombre: addition(
    [
      section(
        "sello-hombre",
        "Anillos de sello para hombre",
        "Un anillo de sello presenta una superficie central que puede ser lisa o llevar un motivo. Para elegir, compará el tamaño de esa superficie, la altura y el peso declarado. Un diseño llamativo en primer plano puede sentirse muy distinto cuando movés los dedos.",
        "Si buscás iniciales o un emblema, confirmá si se trata de un diseño existente o de un trabajo personalizado disponible. El sello como estilo de anillo es diferente de una marca de ley como ‘925’ en el metal: una cosa no prueba la otra."
      ),
      section(
        "hombre-compromiso",
        "Compromiso, alianza o un regalo personal",
        "También se puede elegir un anillo de compromiso para hombre. Definí primero si será una pieza para la propuesta, una alianza de boda o un accesorio: esa decisión ayuda a elegir la forma y el uso, sin imponer un diseño por género.",
        "Para una pieza que acompañe la rutina, observá el ancho, el engaste y los bordes. Si considerás tungsteno o titanio, preguntá por la composición y las posibilidades reales de ajuste de talle antes de elegir."
      ),
    ],
    [custom, materials, symbols]
  ),
  "plata-925": addition(
    [
      section(
        "plata-personalizada",
        "Plata con iniciales, corazón o piedras",
        "La plata puede formar parte de diseños lisos, sellos, anillos con corazón y piezas con piedras. Revisá la identidad de la gema y cualquier baño o acabado como datos independientes de la ley de la plata.",
        "Para una inscripción, consultá el espacio útil y el servicio disponible antes de encargar. Conservá las instrucciones de cuidado del acabado: limpiar plata sin recubrimiento y limpiar una pieza bañada pueden requerir procedimientos distintos."
      ),
    ],
    [styles, custom, colors]
  ),
  "alianzas-plata": addition(
    [
      section(
        "alianzas-plata-comparacion",
        "Comparar un par de alianzas de plata",
        "Para comparar un par, revisá la ley de la plata, el ancho de cada banda y cualquier recubrimiento. Confirmá si el importe corresponde al par o a una unidad y si los talles elegidos están incluidos en esa propuesta.",
        "Un acabado pulido, satinado o con relieve cambia el aspecto y puede requerir mantenimiento distinto. Si quieren una inscripción, consulten disponibilidad y condiciones después de confirmar el ajuste de cada persona."
      ),
    ],
    [custom, care]
  ),
  "alianzas-oro": addition(
    [
      section(
        "alianzas-oro-eleccion",
        "Alianzas de oro rosa, blanco y amarillo",
        "Dos alianzas pueden compartir su significado y usar colores o anchos diferentes. Compará la ley, las medidas y el acabado de cada una; el color no reemplaza la confirmación de composición.",
        "Si una persona llevará también un anillo de compromiso, revisá cómo quedan juntos. La altura de la piedra, la separación entre las bandas y el contacto entre acabados importan para el uso cotidiano. Confirmá mantenimiento, ajuste y cualquier grabado antes de cerrar el pedido."
      ),
    ],
    [custom, materials]
  ),
  acero: addition(
    [
      section(
        "acero-y-alternativas",
        "Acero frente a tungsteno y titanio",
        "Acero, tungsteno y titanio son materiales diferentes. No elijas uno suponiendo que todos los anillos metálicos tienen la misma composición o admiten los mismos cambios de talle. Pedí el material exacto, el acabado y las medidas de la pieza.",
        "En un diseño negro, dorado o rosa, preguntá cómo se obtiene el color y cómo debe cuidarse. Un nombre comercial no garantiza una tolerancia universal de la piel ni que el acabado se mantenga sin cambios. Elegí con información específica de esa pieza."
      ),
    ],
    [materials, care]
  ),
};

export const GUIDE_EXPANSION: Record<string, Addition> = {
  materiales: addition(
    [
      section(
        "tungsteno-titanio",
        "Anillos de tungsteno y titanio",
        "En joyería, los anillos llamados de tungsteno suelen emplear carburo de tungsteno; confirmá la composición concreta. Titanio y carburo de tungsteno tienen propiedades y construcciones distintas, por lo que no alcanza con elegir por el color de una foto.",
        "Preguntá cuánto pesa la pieza y si el fabricante permite cambiar el talle. No presupongas que se puede agrandar o achicar como una banda convencional: el material y el diseño pueden limitar esa posibilidad. Confirmá también cómo se resuelve un talle incorrecto antes de comprar.",
        "La resistencia al rayado no significa que una pieza sea indestructible. Para comparar acero, titanio y tungsteno, considerá el trabajo que hacés con las manos, el mantenimiento del acabado y las instrucciones del fabricante. Si existe sensibilidad a ciertos metales, pedí composición sin aceptar una garantía general de ‘hipoalergénico’."
      ),
      section(
        "oro-colores-quilates",
        "Oro rosa, blanco y amarillo: color, ley y acabado",
        "El oro de joyería se combina con otros metales, y la aleación influye en el color. Rosa o rosado, blanco y amarillo no son grados de pureza. Los quilates del oro expresan su proporción en la aleación: 18k equivale a 18 partes de oro sobre 24; 14k, a 14 sobre 24.",
        "El oro blanco puede llevar una capa de rodio para lograr su apariencia. Consultá si la pieza la tiene y qué mantenimiento necesita. Los términos bañado, chapado o color oro requieren identificar el metal base y el recubrimiento; no describen automáticamente una pieza de oro macizo.",
        "Si buscás oro de 24k, preguntá si la pieza y su construcción son apropiadas para el uso que le vas a dar. No supongas que más quilates resuelven por sí solos la durabilidad, el ajuste o la comodidad. El precio final también depende del peso, el trabajo y las piedras."
      ),
      section(
        "materiales-organicos",
        "Madera, coco, resina y anillos de cuentas",
        "Los anillos de madera, coco, resina o cuentas son otra familia de materiales. Confirmá qué parte de la pieza corresponde a cada componente, si lleva adhesivos o recubrimientos y qué cuidados necesita. La apariencia orgánica no demuestra resistencia al agua ni una composición determinada.",
        "Para un diseño artesanal, pedí medidas del interior y observá bordes y uniones. Un anillo hecho con mostacillas puede tener un ajuste distinto de una banda rígida. Elegí según el uso previsto y evitá aplicar métodos de limpieza para metal sin instrucciones compatibles."
      ),
    ],
    [styles],
    [],
    [
      source(
        "GIA: metales alternativos para joyería",
        "https://4cs.gia.edu/en-us/blog/mens-jewelry-alternative-jewelry-metals/"
      ),
      source(
        "GIA: cómo elegir un metal blanco",
        "https://4cs.gia.edu/en-us/blog/pick-right-white-metal-engagement-wedding-ring/"
      ),
      source(
        "GIA: oro rosa y oro amarillo",
        "https://4cs.gia.edu/en-us/blog/yellow-gold-vs-rose-gold/"
      ),
    ]
  ),
  "estilos-de-anillos": addition(
    [
      section(
        "churumbela",
        "Churumbelas y bandas con piedras",
        "Una churumbela se reconoce por una sucesión de piedras a lo largo de la banda. Puede tener piedras en una parte o alrededor del aro; pedí una vista completa para saber cómo está construida. El término no confirma qué gemas lleva ni el material de la banda.",
        "Si pensás combinarla con un solitario o una alianza, compará ancho, altura y espacio entre las piezas. Preguntá por el cambio de talle y por el mantenimiento del engaste antes de comprar. La posibilidad de ajustar una banda con piedras depende de su diseño.",
        "También se busca como regalo por el nacimiento de un hijo o un aniversario. Podés darle ese significado sin tomarlo como una regla obligatoria: lo esencial es que el diseño y el uso tengan sentido para quien lo recibe."
      ),
      section(
        "sello-filigrana",
        "Sello, filigrana y eslabones",
        "El sello concentra el diseño en una superficie central; la filigrana utiliza un trabajo de líneas o entramados delicados. En ambos casos, pedí fotos de perfil y medidas: los relieves y los espacios abiertos cambian la forma en que el anillo se apoya y se limpia.",
        "En un diseño de eslabones, confirmá si la estructura es rígida o articulada y cómo se mide el interior. Un motivo de cadena no convierte la pieza en una pulsera o un collar. Compará la construcción real y evitá decidir sólo por una imagen ampliada."
      ),
      section(
        "corazon-infinito",
        "Corazón, infinito y tres aros",
        "Un corazón o un infinito pueden expresar afecto, recuerdo o compromiso personal. Los tres aros entrelazados también pueden recibir un significado elegido por quien los usa. No hay una interpretación obligatoria que determine cuándo comprarlos o en qué mano llevarlos.",
        "Para piezas que se combinan o se mueven, confirmá cómo se toma el talle y qué medidas tiene el conjunto. Pensá en la comodidad al cerrar la mano y en el contacto con otros anillos. Un motivo simbólico debe seguir siendo una pieza adecuada para su uso."
      ),
      section(
        "flores-tulipanes",
        "Anillos con flores y tulipanes",
        "Un motivo de flor o tulipán puede estar formado por metal, piedras o una combinación de ambos. Observá cómo están sujetos los pétalos y cuánto sobresale el diseño: el relieve influye en el contacto con la ropa y con los dedos vecinos.",
        "Para un regalo, compará una vista sobre la mano y las dimensiones reales. Un nombre de flor describe el motivo, pero no confirma una gema ni una técnica de fabricación. Pedí esa información y las instrucciones de limpieza del diseño completo."
      ),
    ],
    [symbols, custom],
    [],
    [
      source(
        "GIA: combinar bandas y anillos",
        "https://4cs.gia.edu/en-us/blog/guide-on-how-to-stack-rings/"
      ),
    ]
  ),
  "piedras-para-anillos": addition(
    [
      section(
        "moissanita-circonita",
        "Moissanita, circonita y diamante de laboratorio",
        "La moissanita y la circonita cúbica son materiales diferentes del diamante. Pueden imitar parte de su apariencia, pero no deben identificarse como diamantes en una ficha. La circonita cúbica tampoco es lo mismo que el circón, que es otra gema.",
        "Un diamante de laboratorio sí es diamante; su origen debe distinguirse del natural. Para una comparación útil, pedí la identidad, el origen declarado, las medidas y la documentación disponible de la piedra. Las palabras ‘sintético’ o ‘brillante’ sin más contexto no resuelven esa identificación.",
        "Elegí considerando el presupuesto, la apariencia que buscás y el cuidado del diseño. No asumas que todas las alternativas tienen el mismo mantenimiento o valor de reventa. Compará ofertas con descripciones equivalentes y sin sustituir una piedra por otra sin avisarte."
      ),
      section(
        "formas-piedras",
        "Formas de piedras: princesa, ovalada y marquesa",
        "Redonda, ovalada, princesa, marquesa, pera y corazón describen contornos distintos. El peso en quilates no informa por sí solo cuánto espacio se verá sobre el dedo. Compará largo y ancho en milímetros, proporciones y fotos que permitan entender la escala.",
        "La forma también condiciona el engaste. En piedras con puntas o esquinas, preguntá cómo están protegidas; en un diseño elevado, fijate en los enganches con la ropa y en el espacio para una alianza. La comodidad se evalúa con la pieza completa, no con una piedra aislada."
      ),
    ],
    [colors],
    [
      {
        question: "¿Moissanita y diamante son lo mismo?",
        answer:
          "No. La moissanita es un material diferente. Un diamante creado en laboratorio sí es diamante, con un origen que debe declararse. Pedí que la ficha identifique claramente la piedra de cada pieza.",
      },
    ],
    [
      source(
        "GIA: imitaciones, moissanita y diamantes de laboratorio",
        "https://4cs.gia.edu/en-us/simulants-moissanite-and-lab-grown-diamonds/"
      ),
    ]
  ),
  talles: addition(
    [
      section(
        "dedos-menique-indice",
        "Talle para meñique, índice y pulgar",
        "Podés llevar un anillo en el dedo que prefieras si el ajuste y la actividad lo permiten. El meñique, el índice y el pulgar requieren su propia medida, igual que el anular. Medí la mano y el dedo concretos; no extrapoles el talle de otro anillo.",
        "Para un anillo de sello o una banda ancha, observá además el espacio al juntar los dedos. Si el diseño es abierto o ajustable, consultá el rango indicado y cómo se ajusta: no significa que sirva para cualquier medida ni que admita doblarlo repetidamente."
      ),
    ],
    [styles]
  ),
  cuidados: addition(
    [
      section(
        "cambios-color",
        "Oscurecimiento, manchas y recubrimientos",
        "El aspecto de una pieza puede cambiar por su material, el ambiente, el uso o el desgaste de un acabado. Una mancha por sí sola no identifica la ley del metal, y una marca ‘925’ o ‘18k’ necesita respaldo en la descripción y documentación de la pieza.",
        "Si aparece un cambio de color, revisá primero qué material y recubrimiento tiene el anillo. No uses ácidos, abrasivos o pruebas caseras como método de limpieza o verificación. Consultá un procedimiento compatible antes de intentar restaurar la superficie."
      ),
    ],
    [materials]
  ),
  "anillos-economicos": addition(
    [
      section(
        "comparacion-presupuesto",
        "Un diseño sencillo con información completa",
        "Un anillo económico puede ser una banda lisa o una pieza con una piedra alternativa. Definí qué datos necesitás antes de comparar: material, gema, medidas, precio por unidad o par, talle y costo total de entrega. No confundas un precio de referencia de otro mercado con una oferta disponible en Paraguay.",
        "Separá lo imprescindible de los detalles opcionales. Un grabado, un acabado o una caja especial pueden cambiar el presupuesto; consultá si existen y cuánto cuestan. Una descripción completa permite elegir mejor que una promesa vaga sobre calidad o lujo."
      ),
    ],
    [custom, stones]
  ),
};

export const EXPANDED_GUIDES: Guide[] = [
  {
    slug: "anillos-personalizados",
    title: "Anillos personalizados y grabados: qué confirmar antes de encargar",
    heading: "Cómo elegir un anillo personalizado",
    description:
      "Nombres, iniciales, fechas y diseños a medida: revisá talle, material, texto, plazos y condiciones antes de encargar un anillo personalizado.",
    collection: "alianzas",
    sections: [
      section(
        "personalizar-o-grabar",
        "Personalizar no siempre significa fabricar a medida",
        "Un anillo personalizado puede ser una pieza existente con una inscripción, un diseño con iniciales o una fabricación a medida. Son trabajos diferentes. Definí qué querés cambiar y consultá si un proveedor ofrece realmente ese trabajo para el material y modelo elegidos.",
        "No supongas que una categoría de anillos incluye grabado, cambios de piedra o fabricación especial. Pedí una propuesta que describa la pieza, el trabajo acordado y su precio antes de confirmar. Una imagen de referencia ayuda a conversar, pero no reemplaza una especificación."
      ),
      section(
        "nombres-iniciales-fechas",
        "Nombres, iniciales y fechas",
        "Elegí un texto breve que entre en el espacio disponible. Revisá ortografía, acentos, mayúsculas, orden de los nombres y formato de la fecha. Si querés una frase, preguntá cuántos caracteres admite la pieza y cómo se verá el resultado.",
        "Confirmá la ubicación del grabado y la técnica que se usará. Una inscripción interior y un nombre que forma parte del diseño exterior no requieren el mismo trabajo. Aprobá el texto final por escrito y conservá esa confirmación junto con el pedido."
      ),
      section(
        "talle-antes-grabado",
        "Resolvé el talle antes del grabado",
        "Medí el dedo y la mano donde se llevará el anillo y confirmá el sistema de talles del fabricante. En bandas anchas, diseños con piedras o materiales con ajustes limitados, preguntá cómo se resuelve una medida incorrecta antes de personalizar.",
        "Consultá si un cambio de talle podría afectar una inscripción o un motivo. Si el regalo debe ser una sorpresa y no conocés la medida, averiguá alternativas reales con el proveedor. No encargues una modificación irreversible basándote sólo en una talla estimada."
      ),
      section(
        "diseno-a-medida",
        "Una propuesta a medida necesita detalles",
        "Para un diseño especial, confirmá material y ley, dimensiones, acabado e identidad de las piedras. Pedí que se aclare si la gema es natural, creada en laboratorio o una imitación y qué tratamientos se declaran. No deduzcas esos datos de una foto de inspiración.",
        "Si existe una etapa de aprobación del diseño, consultá qué se puede corregir, cuándo se inicia la fabricación y qué cambios tienen un costo adicional. El presupuesto debe aclarar si es por una pieza o un par, qué incluye y cómo se entrega."
      ),
      section(
        "condiciones-personalizados",
        "Plazos, anticipo y condiciones",
        "Pedí un plazo confirmado y las condiciones de pago, cancelación y cambios antes de autorizar el trabajo. Para una boda, propuesta o cumpleaños, separá la fecha del evento del margen necesario para fabricación, entrega y revisión del ajuste.",
        "Guardá la propuesta y comprobantes. Si hay un problema con el texto o la pieza recibida, esa documentación permite contrastar lo acordado. No tomes una personalización como garantía automática de exclusividad, composición o servicio posventa."
      ),
    ],
    faq: [
      {
        question: "¿Todos los anillos se pueden grabar?",
        answer:
          "No. Depende del material, las dimensiones, el diseño y el servicio que exista. Confirmá la viabilidad y las condiciones para la pieza concreta antes de encargar.",
      },
      {
        question: "¿Un anillo personalizado se puede cambiar de talle?",
        answer:
          "Depende de su construcción y material. Un ajuste puede afectar la inscripción o las piedras. Consultá esa posibilidad antes de aprobar el trabajo.",
      },
      {
        question: "¿Qué datos preparo para pedir un presupuesto?",
        answer:
          "Material deseado, dedo y talle confirmado, diseño de referencia, texto exacto, cantidad de piezas y fecha necesaria. El proveedor debe completar composición, gemas, precio, plazos y condiciones de la propuesta.",
      },
    ],
    related: [
      sizes,
      materials,
      link("Alianzas de boda", "/categoria/alianzas"),
      link("Anillos de promesa", "/categoria/promesa"),
    ],
  },
  {
    slug: "piedras-de-color",
    title: "Piedras de color para anillos: rubí, zafiro, esmeralda y más",
    heading: "Cómo elegir piedras de color para un anillo",
    description:
      "Compará rubí, zafiro, esmeralda, ópalo, aguamarina y otras gemas: identidad, tratamientos, engaste y cuidado antes de elegir.",
    collection: "solitarios",
    sections: [
      section(
        "identidad-gemas-color",
        "El color no identifica una piedra",
        "Una piedra roja no es necesariamente rubí, ni una verde es necesariamente esmeralda. Pedí la identidad exacta, el origen declarado y cualquier tratamiento antes de comparar anillos. Una imitación o una piedra creada en laboratorio debe describirse con claridad.",
        "Para elegir, compará dimensiones, aspecto, engaste y cuidados además del nombre. Las fotos dependen de la iluminación y no sustituyen la documentación disponible. Si una propiedad o un tratamiento influye en tu decisión, pedí esa información antes de pagar."
      ),
      section(
        "rubi-zafiro",
        "Rubí y zafiro para anillos",
        "Rubí y zafiro pertenecen a la familia del corindón: el rubí es su variedad roja y el zafiro puede presentar distintos colores. Por eso, no todos los zafiros son azules. En cada propuesta, confirmá color, identidad, origen y tratamientos declarados.",
        "Un anillo de rubí o de zafiro puede ser un solitario, una banda con varias piedras o un diseño combinado. Evaluá el tamaño de la piedra central y cómo se protege en el engaste. El precio no puede deducirse sólo del color o de una foto: compará piezas con datos equivalentes."
      ),
      section(
        "esmeralda-aguamarina",
        "Esmeralda y aguamarina",
        "Esmeralda y aguamarina son variedades del berilo, con apariencias distintas. El nombre de la gema no determina por sí solo su calidad, su tratamiento ni el cuidado de la pieza. Pedí la información específica del ejemplar que vas a recibir.",
        "Si buscás un anillo con esmeralda, preguntá especialmente por los tratamientos declarados y la limpieza compatible. Para una aguamarina, compará color y dimensiones bajo iluminación semejante. En ambos casos, el engaste y las instrucciones de mantenimiento forman parte de la elección."
      ),
      section(
        "opalo-alexandrita",
        "Ópalo y alejandrita",
        "Algunos ópalos muestran un juego de colores; no todos presentan el mismo aspecto. La alejandrita es conocida por un cambio de color según la iluminación. Pedí que las imágenes y la descripción correspondan a la piedra real y aclaraciones sobre su origen y tratamientos.",
        "Para un ópalo, consultá si la piedra es una pieza completa o una construcción compuesta y cómo debe cuidarse. Para una alejandrita, no tomes un cambio de color de una imagen editada como prueba de identidad. Una afirmación importante necesita documentación apropiada."
      ),
      section(
        "amatista-topacio",
        "Amatista y topacio",
        "La amatista es una variedad de cuarzo; el topacio es una gema diferente que puede presentar distintos colores. Un nombre como ‘topacio azul’ debe acompañarse de la información de origen y tratamientos que corresponda a la piedra.",
        "Si querés un anillo de amatista o topacio, compará las medidas y la altura del montaje, además del tono. Confirmá si la pieza es adecuada para el uso previsto y qué limpieza permite. No reemplaces las instrucciones específicas por una regla general para todas las piedras violetas o azules."
      ),
      section(
        "onix-agata-jaspe",
        "Ónix, ágata musgo, jaspe y jade",
        "Para un anillo con ónix, ágata musgo, jaspe o jade, pedí el material exacto y cualquier tratamiento declarado. Los dibujos y colores naturales pueden variar entre ejemplares: una foto representativa no garantiza que recibas el mismo patrón.",
        "Consultá cómo se selecciona la piedra y si podés ver la pieza concreta antes de decidir. ‘Jade’ requiere una identificación más precisa que un color verde. Si se mencionan amazonita, espinela, crisocola, marquesita u otras piedras, aplicá el mismo criterio: identidad clara, medidas, tratamientos y cuidado compatible."
      ),
      section(
        "negro-y-nacar",
        "Piedras negras, nácar y otros acabados",
        "Una piedra negra puede tener distintas identidades, incluida una circonita de ese color. El nácar es otro material y no debe confundirse con una gema transparente. La descripción tiene que aclarar qué componente lleva el anillo y cómo está sujeto.",
        "Si buscás una pieza por su apariencia, no hace falta atribuirle propiedades de salud o protección para apreciarla. Elegí por el diseño y la información comprobable; pedí instrucciones de cuidado de todos los materiales que la componen."
      ),
    ],
    faq: [
      {
        question: "¿Una piedra verde siempre es esmeralda?",
        answer:
          "No. El color por sí solo no identifica una gema. La ficha debe indicar el material exacto, su origen declarado y tratamientos cuando corresponda.",
      },
      {
        question: "¿Una piedra de color sirve para un anillo de compromiso?",
        answer:
          "Puede elegirse para una propuesta. Confirmá la identidad, el engaste y el cuidado necesario según el uso previsto; no todas las gemas y construcciones requieren el mismo mantenimiento.",
      },
      {
        question: "¿El precio permite saber si una gema es natural?",
        answer:
          "No. Pedí una identificación y documentación apropiadas. Un importe alto o bajo no demuestra por sí solo origen, calidad ni tratamientos.",
      },
    ],
    related: [
      stones,
      care,
      link("Anillos de compromiso", "/categoria/compromiso"),
    ],
    sources: [
      source("GIA: rubí", "https://www.gia.edu/ruby"),
      source("GIA: zafiro", "https://www.gia.edu/sapphire"),
      source("GIA: esmeralda", "https://www.gia.edu/emerald"),
      source("GIA: aguamarina", "https://www.gia.edu/aquamarine"),
      source("GIA: ópalo", "https://www.gia.edu/opal"),
      source("GIA: alejandrita", "https://www.gia.edu/alexandrite"),
      source("GIA: amatista", "https://www.gia.edu/amethyst"),
      source("GIA: topacio", "https://www.gia.edu/topaz"),
    ],
  },
  {
    slug: "anillos-con-significado",
    title: "Anillos con significado: símbolos, recuerdos y regalos",
    heading: "Elegir un anillo con significado personal",
    description:
      "Corazón, infinito, símbolos de fe, graduación y recuerdos familiares: elegí un anillo por su sentido, diseño, medida y composición.",
    collection: "promesa",
    sections: [
      section(
        "significado-personal",
        "Un significado elegido por quien lo usa",
        "Un anillo puede recordar una relación, una etapa o una persona. Un corazón, un infinito o una forma sencilla pueden expresar ese vínculo sin una regla universal sobre cuándo regalarlos. Conversá sobre el significado y los gustos de quien lo recibirá.",
        "Elegí también por la medida, la comodidad y la composición. Un símbolo no confirma el metal ni las piedras. Si querés añadir una inscripción, consultá si existe ese servicio para la pieza y resolvé primero el talle."
      ),
      section(
        "simbolos-fe",
        "San Benito, cruces y anillos rosario",
        "Un anillo de San Benito, con una cruz o con un motivo de rosario puede elegirse como expresión de fe. Revisá que el motivo sea el que buscás y que las imágenes permitan ver sus detalles. La interpretación personal o religiosa no sustituye la descripción material de la pieza.",
        "Para un regalo, considerá las preferencias de la persona y su forma de usar el símbolo. No atribuyas al anillo una garantía de protección o efectos sobre la salud. Pedí tamaño del motivo, medidas del aro y cuidados del acabado."
      ),
      section(
        "atlante-salomon",
        "Motivos atlantes y de Salomón",
        "Si buscás un anillo atlante o con un motivo asociado a Salomón, compará el dibujo concreto y su tamaño. Estos nombres pueden usarse para diseños distintos; pedí una vista clara en lugar de asumir que todas las piezas comparten la misma forma o historia.",
        "Podés elegirlos por su estética o por un significado personal, sin convertir creencias en propiedades comprobadas. Confirmá composición, talle y acabado igual que en cualquier otro anillo. No hay que dar por acreditados beneficios de salud, energía o protección por una descripción comercial."
      ),
      section(
        "emblemas-masonicos",
        "Emblemas y anillos masónicos",
        "Un anillo con un emblema masónico requiere ver el motivo concreto y sus detalles antes de elegir. Si lo buscás para un uso ceremonial o para una organización, consultá sus criterios con quienes corresponda; una tienda no determina esas reglas.",
        "La pieza no acredita por sí sola pertenencia, rango ni historia personal. Para evaluar el anillo como joya, revisá material, superficie central, altura y talle. Si el emblema se va a fabricar o grabar, confirmá previamente la disponibilidad y el diseño final."
      ),
      section(
        "regalos-graduacion",
        "Graduación, aniversario y recuerdos familiares",
        "Para una graduación o un aniversario, una banda, un sello o una pieza con iniciales puede recordar el logro o la fecha. Elegí un diseño que la persona quiera seguir usando y confirmá si la propuesta incluye realmente una inscripción o emblema.",
        "Los recuerdos de una madre, un hijo o una abuela pueden representarse con un anillo sin necesitar una técnica especial. Si considerás una joya con un material conmemorativo, pedí composición, proceso, conservación y condiciones antes de encargar. Un diseño de nácar no equivale a una joya hecha con leche materna."
      ),
      section(
        "animales-calaveras",
        "Serpientes, animales y calaveras",
        "Una serpiente, un escorpión o una calavera pueden formar parte de un diseño expresivo. El motivo no impone una identidad o pertenencia a quien lo usa. Mirá el relieve, los extremos y la forma en que se apoya sobre la mano.",
        "En un anillo con volumen, comprobá que sea cómodo al juntar los dedos y que no interfiera con tu actividad. Pedí una vista lateral y medidas. Para combinarlo con otras piezas, dejá espacio suficiente y evitá elegir el talle sólo por una foto."
      ),
    ],
    faq: [
      {
        question: "¿Cada símbolo tiene un significado obligatorio?",
        answer:
          "No. Puede tener una interpretación personal, cultural o religiosa. Elegí con respeto por quien lo usará y sin asumir que un diseño acredita creencias, pertenencia o propiedades materiales.",
      },
      {
        question: "¿Un anillo simbólico garantiza protección?",
        answer:
          "No corresponde presentar una creencia como un efecto comprobado de la pieza. Elegí por su significado personal y verificá composición, talla y cuidado como en cualquier otro anillo.",
      },
      {
        question: "¿Qué anillo regalar por una graduación?",
        answer:
          "Una banda, un sello o un diseño que le guste a la persona pueden servir como recuerdo. Confirmá su medida y cualquier personalización realmente disponible antes de encargar.",
      },
    ],
    related: [
      styles,
      custom,
      sizes,
      link("Anillos de promesa", "/categoria/promesa"),
    ],
  },
];
