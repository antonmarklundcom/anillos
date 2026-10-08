export const AUDIT_VIEWPORTS = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
] as const;
export const AUDIT_ROUTES = [
  "/",
  "/colecciones",
  "/elegir",
  "/guias/talles",
  "/buscar?q=anillos",
];
export const AUDIT_BUDGETS = {
  lcpMs: 2500,
  cls: 0.1,
  transferBytes: 2_000_000,
  scriptBytes: 400_000,
  imageBytes: 600_000,
} as const;

/** Explicit loopback target only; never probe a hosted site or authenticated routes. */
export function localAuditBaseUrl(value: string): string {
  const url = new URL(value);
  if (
    url.protocol !== "http:" ||
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw new Error(
      "Usá únicamente un origen HTTP loopback local, sin credenciales ni ruta."
    );
  return url.origin;
}
export function auditProductRoute(slug: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 160)
    throw new Error("Slug de producto inválido.");
  return `/producto/${slug}`;
}
export type AuditMeasurements = {
  lcpMs: number | null;
  cls: number | null;
  transferBytes: number;
  scriptBytes: number;
  largestImageBytes: number;
};
export function performanceBudgetFailures(
  measurements: AuditMeasurements
): string[] {
  const failures: string[] = [];
  if (measurements.lcpMs === null)
    failures.push("No se pudo medir LCP: revisar carga y observador.");
  else if (measurements.lcpMs > AUDIT_BUDGETS.lcpMs)
    failures.push(
      "LCP supera 2500 ms: revisar imagen principal, tamaño y trabajo inicial de JavaScript."
    );
  if (measurements.cls === null)
    failures.push(
      "No se pudo medir CLS: revisar compatibilidad del navegador."
    );
  else if (measurements.cls > AUDIT_BUDGETS.cls)
    failures.push(
      "CLS supera 0,1: reservar espacio para imágenes y controles."
    );
  if (measurements.transferBytes > AUDIT_BUDGETS.transferBytes)
    failures.push(
      "La página supera 2 MB: reducir recursos iniciales y cargar imágenes secundarias al necesitarlas."
    );
  if (measurements.scriptBytes > AUDIT_BUDGETS.scriptBytes)
    failures.push(
      "JavaScript supera 400 KB: revisar componentes cliente y dependencias."
    );
  if (measurements.largestImageBytes > AUDIT_BUDGETS.imageBytes)
    failures.push(
      "Una imagen supera 600 KB: ajustar tamaño y compresión sin alterar el diseño de la pieza."
    );
  return failures;
}

/** Identify failures without recording request URLs, bodies or query text. */
export function localAuditFailure(error: unknown): {
  code: string;
  message: string;
} {
  const text = error instanceof Error ? error.message : "";
  const missing = text.match(
    /(?:ReferenceError:\s*)?([A-Za-z_$][\w$]{0,60}) is not defined/
  );
  if (missing)
    return {
      code: "browser_reference_error",
      message: `La evaluación del navegador necesita el identificador ${missing[1]}.`,
    };
  if (/ERR_CONNECTION_REFUSED|ECONNREFUSED/.test(text))
    return {
      code: "local_server_unavailable",
      message:
        "El servidor local rechazó la conexión; comprobar que está iniciado.",
    };
  if (/Timeout|timed out/i.test(text))
    return {
      code: "operation_timeout",
      message:
        "Se agotó el tiempo de una operación local; revisar carga y servidor.",
    };
  if (/Target.*closed|browser.*closed/i.test(text))
    return {
      code: "browser_closed",
      message:
        "El navegador o la página se cerró antes de completar el control.",
    };
  if (/SyntaxError|TypeError|ReferenceError/.test(text))
    return {
      code: "browser_evaluation_error",
      message:
        "La evaluación del navegador falló; revisar los callbacks del control local.",
    };
  return {
    code: "local_operation_failed",
    message:
      "No se pudo completar la operación local; revisar servidor, navegador y permisos de capturas.",
  };
}
