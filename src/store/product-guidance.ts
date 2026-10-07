import type { ProductSpecifications } from "@/lib/product-attributes";
import type { ContentLink } from "@/content/ring-content";

export type ProductGuidanceInput = {
  categorySlug: string;
  specifications?: ProductSpecifications | null;
  /** Set only after explicit fact verification; never infer from an image or category. */
  factsVerified: boolean;
  concept?: boolean;
};
export type ProductQuestion = { question: string; answer: string };
const guide = (label: string, slug: string): ContentLink => ({ label, href: `/guias/${slug}` });

/** Only receives safe public facts. Supplier references, sources and contacts stay private. */
export function productGuidance(input: ProductGuidanceInput) {
  const facts = input.factsVerified && !input.concept ? input.specifications : null;
  const related: ContentLink[] = [guide("Cómo confirmar tu talle", "talles"), guide("Cuidados de los anillos", "cuidados")];
  const faq: ProductQuestion[] = [{ question: "¿Cómo elijo el talle de este modelo?", answer: "Medí el dedo y la mano donde vas a usarlo y compará con las variantes y la escala del proveedor. El número de talle de otro fabricante puede usar un sistema distinto." }];
  if (facts?.unit === "pair") faq.push({ question: "¿Esta ficha corresponde a un anillo o a un par?", answer: "La unidad confirmada es un par de dos anillos. Revisá las dos medidas de la variante y qué incluye la propuesta antes de decidir." });
  else if (facts?.unit === "individual") faq.push({ question: "¿Esta ficha corresponde a una pieza individual?", answer: "La unidad confirmada es un anillo. Si querés dos piezas, revisá por separado las variantes, cantidades y condiciones de la propuesta." });
  if (facts?.material) {
    faq.push({ question: "¿Qué material está confirmado para esta pieza?", answer: `La composición registrada en la ficha es: ${facts.material}${facts.purity ? `; ley o pureza: ${facts.purity}` : ""}. Revisá también cualquier recubrimiento declarado y las instrucciones específicas de cuidado.` });
    related.push(guide("Materiales, aleaciones y recubrimientos", "materiales"));
  }
  if (facts?.stone) {
    faq.push({ question: "¿Qué piedra declara la ficha?", answer: `La piedra identificada en la información confirmada es: ${facts.stone}. El color o brillo de una foto no reemplaza esa identificación. Revisá el origen, los tratamientos y la documentación que correspondan a la pieza.` });
    related.push(guide("Piedras y alternativas al diamante", "piedras-para-anillos"));
    if (/rub[ií]|zafiro|esmeralda|[oó]palo|aguamarina|alejandrita|topacio|[oó]nix|[aá]gata|jaspe|jade/i.test(facts.stone)) related.push(guide("Cómo elegir piedras de color", "piedras-de-color"));
  }
  if (facts?.widthMm !== undefined && Number.isFinite(facts.widthMm) && facts.widthMm > 0) faq.push({ question: "¿Qué ancho tiene la banda?", answer: `El ancho confirmado de la banda es ${facts.widthMm.toLocaleString("es-PY")} mm. El ancho no indica por sí solo el talle: compará la medida interior y el ajuste en el dedo donde vas a usarla.` });
  if (["compromiso", "promesa", "alianzas", "alianzas-oro", "alianzas-plata"].includes(input.categorySlug)) related.push(guide("Promesa, compromiso y alianza", "compromiso-y-alianzas"));
  if (["alianzas", "alianzas-oro", "alianzas-plata"].includes(input.categorySlug)) related.push(guide("Elegir alianzas de boda", "alianzas-boda-civil"));
  if (input.categorySlug === "hombre" || input.categorySlug === "solitarios") related.push(guide("Comparar estilos de anillos", "estilos-de-anillos"));
  if (!facts) faq.push({ question: "¿Una imagen ilustrativa confirma material, piedra o medidas?", answer: "No. Una referencia visual ayuda a comparar estilos, pero esos datos requieren confirmación de la pieza real. Una ficha incompleta o un concepto no acreditan precio, disponibilidad ni composición." });
  return { faq, related };
}
