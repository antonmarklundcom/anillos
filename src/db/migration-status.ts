import { readMigrationFiles } from "drizzle-orm/migrator";
import journal from "../../drizzle/meta/_journal.json";
import { getPool } from "@/db";

type Migration = { tag: string; hash: string; timestamp: number };
type Applied = { hash: string; created_at: number | string };

export function compareMigrations(expected: readonly Migration[], applied: readonly Applied[]) {
  const compatible = applied.length <= expected.length && applied.every((row, index) =>
    row.hash === expected[index]?.hash && Number(row.created_at) === expected[index]?.timestamp
  );
  const pending = compatible ? expected.slice(applied.length).map((row) => row.tag) : [];
  return { compatible, current: compatible && pending.length === 0, pending };
}

export async function migrationStatus() {
  const files = readMigrationFiles({ migrationsFolder: "drizzle" });
  const expected = files.map((file, index) => ({
    tag: journal.entries[index]!.tag, hash: file.hash, timestamp: file.folderMillis,
  }));
  const [rows] = await getPool().query("SELECT hash, created_at FROM __drizzle_migrations ORDER BY id ASC");
  return compareMigrations(expected, rows as Applied[]);
}
