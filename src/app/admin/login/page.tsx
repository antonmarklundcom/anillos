import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { safeNextPath } from "@/lib/safe-redirect";
import { requireAdminSession } from "@/lib/admin-guard";
import { can } from "@/lib/permissions";
import {
  ForbiddenError,
  UnauthorizedError,
  type AdminActor,
} from "@/lib/session";
import { t } from "@/i18n";

export const metadata: Metadata = {
  title: t("panel.login.meta"),
  robots: { index: false, follow: false },
};

// La sesión se lee en cada visita: cachear esta página serviría el estado de
// login de otro.
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await searchParams;
  const rawNext = Array.isArray(query.next) ? query.next[0] : query.next;
  const next = safeNextPath(rawNext);

  // A signed cookie may be revoked, inactive or contain an old role. Use the
  // same database validation as panel pages before skipping the login form.
  let actor: AdminActor | null = null;
  try {
    actor = await requireAdminSession();
  } catch (error) {
    if (!(
      error instanceof UnauthorizedError || error instanceof ForbiddenError
    ))
      throw error;
  }
  // Keep Next's redirect outside the catch: it is a control-flow exception.
  if (actor)
    redirect(
      next === "/admin" && !can(actor.role, "dashboard")
        ? "/admin/pedidos"
        : next
    );

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("panel.login.titulo")}
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {t("panel.login.bajada")}
      </p>
      <div className="mt-6">
        <LoginForm next={next} />
      </div>
      {(process.env.SETUP_SECRET?.length ?? 0) >= 16 ? (
        <Link href="/setup" className="mt-6 text-sm underline">
          {t("panel.login.configurar")}
        </Link>
      ) : null}
    </main>
  );
}
