"use server";

import { requireOwnerSession } from "@/lib/admin-guard";
import {
  readSalesWorkspace,
  saveSalesWorkspace,
} from "@/domain/sales-workspace-store";
import type {
  SalesWorkspaceSnapshot,
  SaveSalesWorkspaceResult,
} from "@/domain/sales-workspace";

export async function readSalesWorkspaceAction(): Promise<
  { ok: true; snapshot: SalesWorkspaceSnapshot } | { ok: false; error: string }
> {
  try {
    await requireOwnerSession();
    return { ok: true, snapshot: await readSalesWorkspace() };
  } catch {
    return {
      ok: false,
      error:
        "No se pudo acceder al espacio de ventas. Requiere sesión de propietario.",
    };
  }
}

export async function saveSalesWorkspaceAction(
  input: unknown
): Promise<SaveSalesWorkspaceResult> {
  let actorUserId: number;
  try {
    actorUserId = (await requireOwnerSession()).userId;
  } catch {
    return {
      ok: false,
      code: "forbidden",
      error: "Requiere sesión de propietario.",
    };
  }
  const result = await saveSalesWorkspace(input, { actorUserId });
  if (result.ok) {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/campanas/[slug]", "page");
    revalidatePath("/producto/[slug]", "page");
    revalidatePath("/sitemap.xml");
  }
  return result;
}

export async function readSalesWorkspaceAuditAction(): Promise<
  | { ok: true; entries: import("@/domain/sales-workspace").SalesAuditEntry[] }
  | { ok: false; error: string }
> {
  try {
    await requireOwnerSession();
    const { readSalesWorkspaceAudit } =
      await import("@/domain/sales-workspace-store");
    return { ok: true, entries: await readSalesWorkspaceAudit() };
  } catch {
    return {
      ok: false,
      error:
        "No se pudo leer el historial. Requiere sesión de propietario y migración vigente.",
    };
  }
}
export async function undoSalesWorkspaceAction(
  input: unknown
): Promise<SaveSalesWorkspaceResult> {
  try {
    const actor = await requireOwnerSession();
    const { z } = await import("zod");
    const parsed = z
      .object({
        revision: z.number().int().min(1).max(2_000_000_000),
        auditId: z.number().int().positive(),
      })
      .strict()
      .safeParse(input);
    if (!parsed.success)
      return {
        ok: false,
        code: "invalid",
        error: "Revisión de historial inválida.",
      };
    const { undoSalesWorkspace } =
      await import("@/domain/sales-workspace-store");
    return await undoSalesWorkspace(parsed.data, actor.userId);
  } catch {
    return {
      ok: false,
      code: "unavailable",
      error:
        "No se pudo revertir. Requiere sesión de propietario y migración vigente.",
    };
  }
}
export async function exportEnquiryRecordsAction(
  input: unknown
): Promise<
  | { ok: true; export: import("@/domain/sales-workspace").LinkedEnquiryExport }
  | { ok: false; error: string }
> {
  try {
    await requireOwnerSession();
    if (typeof input !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(input))
      return { ok: false, error: "Consulta inválida." };
    const { exportLinkedEnquiry } = await import("@/domain/sales-workspace");
    return {
      ok: true,
      export: exportLinkedEnquiry(
        (await readSalesWorkspace()).workspace,
        input
      ),
    };
  } catch {
    return { ok: false, error: "No se pudo exportar la consulta vinculada." };
  }
}
export async function deleteEnquiryRecordsAction(
  input: unknown
): Promise<SaveSalesWorkspaceResult> {
  try {
    const actor = await requireOwnerSession();
    const { deleteEnquiryRecords } =
      await import("@/domain/sales-workspace-store");
    return await deleteEnquiryRecords(input, actor.userId);
  } catch {
    return {
      ok: false,
      code: "unavailable",
      error:
        "No se pudieron eliminar registros. Requiere sesión de propietario.",
    };
  }
}

export async function recordSalesSearchGapAction(
  input: unknown
): Promise<{ ok: boolean }> {
  const { SearchGapIntentSchema } = await import("@/domain/sales-workspace");
  const parsed = SearchGapIntentSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const { headers } = await import("next/headers");
  const { clientIp, rateLimit } = await import("@/lib/rate-limit");
  const { createHash } = await import("node:crypto");
  const key = createHash("sha256")
    .update(clientIp(await headers()))
    .digest("hex");
  if (!rateLimit(`sales-gap:${key}`, { limit: 10, windowMs: 60_000 }).ok)
    return { ok: false };
  if (!rateLimit("sales-gap-global", { limit: 500, windowMs: 60_000 }).ok)
    return { ok: false };
  try {
    const { recordSalesSearchGap } =
      await import("@/domain/sales-workspace-store");
    await recordSalesSearchGap(parsed.data);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
export async function readSalesSearchGapsAction(): Promise<
  | { ok: true; rows: { day: string; intent: string; count: number }[] }
  | { ok: false; error: string }
> {
  try {
    await requireOwnerSession();
    const { readSalesSearchGaps } =
      await import("@/domain/sales-workspace-store");
    return { ok: true, rows: await readSalesSearchGaps() };
  } catch {
    return { ok: false, error: "No se pudieron leer los conteos." };
  }
}
