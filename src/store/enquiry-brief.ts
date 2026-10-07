export function enquiryBriefText(input: {
  name: string;
  categorySlug: string;
  concept: boolean;
  url?: string | null;
}) {
  const pair = ["alianzas", "alianzas-plata", "alianzas-oro"].includes(
    input.categorySlug
  );
  return [
    `Hola, quiero consultar por ${input.name}.`,
    input.concept
      ? "Vi un diseño ilustrativo; quisiera saber si existe una pieza real similar."
      : "Quisiera confirmar la pieza real antes de decidir.",
    pair
      ? "Cantidad deseada (una pieza o dos): [completar]."
      : "Cantidad deseada: [completar].",
    pair
      ? "Medida interior de cada persona, si la sé: [completar]."
      : "Medida interior, si la sé: [completar].",
    "Ciudad y fecha deseada, sin plazo confirmado: [completar].",
    "Solicito fotos reales y confirmación de modelo, material, piedra si corresponde, medidas, precio y condiciones de entrega.",
    "Es una consulta: no confirma disponibilidad ni crea pedido, reserva o pago.",
    input.url,
  ]
    .filter(Boolean)
    .join("\n");
}
