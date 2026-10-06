/**
 * Sólo aceptamos rutas internas de `/admin` como destino post-login.
 *
 * `?next=` viaja en la URL, o sea que lo escribe quien manda el link. Sin este
 * filtro, `/admin/login?next=https://sitio-falso.py` convierte el login del
 * comercio en un redirector abierto: el dueño entra con sus credenciales
 * reales y termina en una copia del panel. Se exige `/admin` seguido de `/` o
 * fin de string, así que `//evil.com`, `/adminfalso` y cualquier URL absoluta
 * caen al default.
 *
 * Vive fuera del módulo `"use server"` porque ahí sólo se pueden exportar
 * funciones async — y de paso queda testeable sin levantar una sesión.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return "/admin";
  // `\` lo normalizan algunos navegadores a `/`: `/\evil.com` sale del sitio.
  if (next.includes("\\")) return "/admin";
  if (next.startsWith("//")) return "/admin";
  if (!/^\/admin(\/|\?|$)/.test(next)) return "/admin";
  try {
    // URL normalization handles dot segments; decoding also catches a login
    // destination spelled with escaped letters. Never redirect back to login.
    const parsed = new URL(next, "https://admin.invalid");
    const path = new URL(
      decodeURIComponent(parsed.pathname),
      "https://admin.invalid"
    );
    if (
      path.origin !== "https://admin.invalid" ||
      !/^\/admin(?:\/|$)/.test(path.pathname)
    )
      return "/admin";
    if (path.pathname.replace(/\/+$/, "") === "/admin/login") return "/admin";
  } catch {
    return "/admin";
  }
  return next;
}
