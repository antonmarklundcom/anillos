import "../src/lib/load-env";
import { inspectBackup, restoreBackup } from "../src/domain/restore-backup";
import { closePool } from "../src/db";
import { safeError } from "../src/lib/safe-error";

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const file = args.find((arg) => !arg.startsWith("--"));
  if (!file || args.some((arg) => arg.startsWith("--") && arg !== "--restore"))
    throw new Error("Uso: pnpm backup:verify -- archivo.jsonl.gz [--restore]");
  const inspected = await inspectBackup(file);
  if (inspected.keyMatches === false) throw new Error("La clave de cifrado no coincide con la copia");
  console.log(JSON.stringify({ verified: true, format: inspected.manifest!.format,
    rows: inspected.rows, encryptionKeyMatches: inspected.keyMatches }));
  if (args.includes("--restore")) {
    const target = new URL(process.env.DATABASE_URL ?? "");
    if (!["127.0.0.1", "localhost", "[::1]"].includes(target.hostname) ||
      !target.pathname.endsWith("_restore_check") || !target.pathname.includes("test"))
      throw new Error("El ensayo requiere una base loopback vacía con test en el nombre y sufijo _restore_check");
    const result = await restoreBackup({ archivo: file });
    if (result.secrets !== result.decryptedSecrets || result.keyMatches === false || !result.reconciliation.ok)
      throw new Error("El ensayo no pasó la verificación de claves o conciliación");
    console.log(JSON.stringify({ restored: true, rows: result.filas, tables: result.tablas }));
  }
}
void main().catch((error) => { console.error(safeError(error).message); process.exitCode = 1; }).finally(closePool);
