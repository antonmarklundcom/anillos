import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import type { SQL } from "drizzle-orm";
import { expect, it } from "vitest";
import { backupTablesForMigration, migrationVersions, tablesForMigration } from "@/domain/backup-format";
import { dumpDatabase } from "@/domain/backup";
import { inspectBackup } from "@/domain/restore-backup";
import type { Executor } from "@/domain/executor";

it("dumps and validates an applied0022 inventory without querying newer tables", async () => {
  const migration = migrationVersions().find((entry) => entry.tag.startsWith("0022_"))!;
  const expected = backupTablesForMigration(migration.tag);
  expect(expected).not.toContain("product_slug_redirects");
  expect([...expected].sort()).toEqual(tablesForMigration(migration.tag));
  const queried: string[] = [];
  const dialect = new MySqlDialect();
  const executor = { execute: async (query: SQL) => {
    const text = dialect.sqlToQuery(query).sql;
    if (text.includes("__drizzle_migrations")) return [[{ hash: migration.hash }]];
    if (text.includes("VERSION()")) return [[{ version: "test" }]];
    const table = text.match(/FROM `([a-z_]+)`/)?.[1];
    if (!table || !expected.includes(table as typeof expected[number])) throw new Error(`Unexpected query ${text}`);
    queried.push(table); return [[]];
  } } as unknown as Executor;
  const folder = await mkdtemp(path.join(tmpdir(), "anillos-old-backup-"));
  try {
    const { stream, stats } = dumpDatabase(executor);
    const chunks: Buffer[] = []; for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    await stats;
    const file = path.join(folder, "backup.gz"); await writeFile(file, Buffer.concat(chunks));
    const inspected = await inspectBackup(file);
    expect(inspected.manifest!.migration.tag).toBe(migration.tag);
    expect([...new Set(queried)].sort()).toEqual([...expected].sort());
  } finally { await rm(folder, { recursive: true, force: true }); }
});
