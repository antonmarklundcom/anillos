import "../src/lib/load-env";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { closePool, getPool } from "@/db";
import { applySchemaExtras } from "@/db/extras";
import { safeError } from "@/lib/safe-error";
import { migrationStatus } from "@/db/migration-status";

async function main(): Promise<void> {
  const connection = await getPool().getConnection();
  try {
    // Bound metadata-lock waits: do not leave a deployment hanging behind a long backup/read.
    await connection.query("SET SESSION lock_wait_timeout = 30");
    const status = await migrationStatus().catch((error: unknown) => {
      if (error && typeof error === "object" && "code" in error && error.code === "ER_NO_SUCH_TABLE")
        return { compatible: true };
      throw error;
    });
    if (!status.compatible) throw new Error("El historial aplicado no coincide con esta revisión; no se aplican migraciones automáticamente");
    await migrate(drizzle(connection), { migrationsFolder: "drizzle" });
    await applySchemaExtras(connection);
    console.log("Migrations and schema extras applied");
  } finally {
    connection.release();
    await closePool();
  }
}
main().catch(async (error) => {
  console.error(safeError(error).message);
  await closePool();
  process.exitCode = 1;
});
