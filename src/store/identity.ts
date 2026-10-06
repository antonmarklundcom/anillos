import { nombrePublicoDeMarca } from "@/config/tienda";
import { marcaEfectiva } from "@/lib/marca";

/** Store presentation adapter; the shared admin identity and data stay intact. */
export async function storeIdentity() {
  const brand = await marcaEfectiva();
  return { ...brand, nombre: nombrePublicoDeMarca(brand.nombre) };
}

export async function storeName() {
  return (await storeIdentity()).nombre;
}
