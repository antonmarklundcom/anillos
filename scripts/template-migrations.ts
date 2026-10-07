import { gitEn } from "./template-shared";

type Entry = { idx: number; tag: string; when: number };
type History = { entries: Entry[]; sql: Record<string, string>; snapshots?: Record<string, string> };

/** Pure guard: a generic file merge cannot reconcile independently deployed migration histories. */
export function migrationSyncIssue(base: History, store: History, incoming: History): string | null {
  for (const history of [base, store, incoming]) {
    const indices = new Set<number>(), tags = new Set<string>(), times = new Set<number>();
    let previous = -1;
    for (const [position, entry] of history.entries.entries()) {
      if (entry.idx !== position || indices.has(entry.idx) || tags.has(entry.tag) || times.has(entry.when)
        || !Number.isSafeInteger(entry.when) || entry.when <= previous || !history.sql[entry.tag])
        return "Historial de migraciones inválido: revisá índices, fechas y SQL antes de sincronizar.";
      indices.add(entry.idx); tags.add(entry.tag); times.add(entry.when); previous = entry.when;
    }
  }
  for (const entry of base.entries) {
    for (const history of [store, incoming]) {
      const match = history.entries[entry.idx];
      if (!match || JSON.stringify(match) !== JSON.stringify(entry) || history.sql[entry.tag] !== base.sql[entry.tag])
        return "La sincronización reescribiría una migración existente. No alteres historial aplicado.";
      if (base.snapshots && history.snapshots?.[entry.tag] !== base.snapshots[entry.tag])
        return "La sincronización reescribiría un snapshot existente. Preservá el historial aplicado.";
    }
  }
  const last = store.entries.at(-1);
  for (const entry of incoming.entries.slice(base.entries.length)) {
    const match = store.entries.find((row) => row.tag === entry.tag);
    if (match) {
      if (JSON.stringify(match) !== JSON.stringify(entry) || incoming.sql[entry.tag] !== store.sql[entry.tag])
        return "Migración compartida con SQL, índice o fecha distintos. Resolvé el historial manualmente.";
      if (incoming.snapshots && incoming.snapshots[entry.tag] !== store.snapshots?.[entry.tag])
        return "Snapshots distintos para la misma migración; resolvé el historial manualmente.";
      continue;
    }
    if (store.entries.some((row) => row.idx === entry.idx || row.when === entry.when) || (last && entry.when <= last.when))
      return "Migración del template en conflicto con migraciones de la tienda (índice/fecha). No sincronices: preservá las aplicadas y regenerá sólo las pendientes.";
  }
  return null;
}

export function templateMigrationIssue(cwd: string, baseline: string, target: string): string | null {
  const read = (ref: string): History => {
    let contents: string;
    try { contents = gitEn(cwd, ["show", `${ref}:drizzle/meta/_journal.json`]); }
    catch { return { entries: [], sql: {} }; }
    const parsed = JSON.parse(contents) as { entries: Entry[] };
    if (!Array.isArray(parsed.entries)) throw new Error("Journal inválido");
    const snapshots: Record<string, string> = {};
    let previousId: string | undefined;
    for (const entry of parsed.entries) {
      const raw = gitEn(cwd, ["show", `${ref}:drizzle/meta/${String(entry.idx).padStart(4, "0")}_snapshot.json`]);
      const snapshot = JSON.parse(raw) as { id: string; prevId: string; dialect: string };
      if (!snapshot.id || snapshot.dialect !== "mysql" || (previousId && snapshot.prevId !== previousId))
        throw new Error("Snapshots incoherentes");
      previousId = snapshot.id; snapshots[entry.tag] = raw;
    }
    return { entries: parsed.entries, snapshots, sql: Object.fromEntries(parsed.entries.map((entry) =>
      [entry.tag, gitEn(cwd, ["show", `${ref}:drizzle/${entry.tag}.sql`])])) };
  };
  try { return migrationSyncIssue(read(baseline), read("HEAD"), read(target)); }
  catch { return "No se pudo verificar el historial de migraciones. Revisá journal y SQL antes de sincronizar."; }
}
