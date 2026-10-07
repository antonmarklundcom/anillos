import { getPool } from "@/db";
import { migrationStatus } from "@/db/migration-status";
import { backupAtrasado, cronAtrasado, getJobRun } from "@/domain/job-runs";
import { backupsEnabled } from "@/domain/backup";
import { cargarIntegraciones } from "@/lib/integraciones-store";

/** Public booleans only. Each independent probe has a deadline; never logs private SQL errors. */
export const dynamic = "force-dynamic";
const DB_TIMEOUT_MS = 3_000;

async function probe(check: () => Promise<boolean>): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve().then(check),
      new Promise<boolean>((resolve) => {
        timer = setTimeout(() => resolve(false), DB_TIMEOUT_MS);
        timer.unref?.();
      }),
    ]);
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(): Promise<Response> {
  const [db, cron, catalog, schema, backup] = await Promise.all([
    probe(async () => { await getPool().query("SELECT 1"); return true; }),
    probe(async () => !cronAtrasado(await getJobRun("vencer_pedidos"))),
    probe(async () => {
      const { getCatalog } = await import("@/db/queries");
      await getCatalog({ limit: 1 });
      return true;
    }),
    probe(async () => (await migrationStatus()).current),
    probe(async () => {
      await cargarIntegraciones();
      // Disabled backups impose no freshness requirement. No success is fabricated.
      return !backupsEnabled() || !backupAtrasado(await getJobRun("backup"));
    }),
  ]);
  return Response.json({ ok: true, db, cron, catalog, schema, backup }, {
    headers: { "cache-control": "no-store" },
  });
}
