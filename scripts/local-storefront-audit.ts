import { chromium, type Browser, type BrowserServer } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  AUDIT_BUDGETS,
  AUDIT_ROUTES,
  AUDIT_VIEWPORTS,
  auditProductRoute,
  localAuditBaseUrl,
  performanceBudgetFailures,
  localAuditFailure,
} from "./local-storefront-audit-policy";

async function bounded<T>(
  operation: Promise<T>,
  milliseconds: number
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Cleanup timeout")),
          milliseconds
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function closeAuditBrowser(
  server: BrowserServer,
  browser?: Browser
): Promise<void> {
  if (browser) {
    try {
      // A connected browser closes only this audit's protocol connection.
      await bounded(browser.close(), 2000);
    } catch {
      console.error("No se pudo desconectar el navegador de auditoría.");
      process.exitCode = 1;
    }
  }
  if (process.platform !== "win32") {
    await bounded(server.kill(), 5000);
    return;
  }
  const owned = server.process();
  const pid = owned.pid;
  if (!pid) throw new Error("Audit browser PID unavailable");
  const exited = () => owned.exitCode !== null || owned.signalCode !== null;
  const closed = exited()
    ? Promise.resolve()
    : new Promise<void>((resolve) => owned.once("close", () => resolve()));
  try {
    if (!exited()) {
      // Playwright's Windows kill path runs synchronous taskkill without a
      // deadline. This async command targets only the browser we launched.
      await new Promise<void>((resolve, reject) => {
        execFile(
          "taskkill.exe",
          ["/PID", String(pid), "/T", "/F"],
          { windowsHide: true, timeout: 15000 },
          (error) => {
            if (error && !exited())
              reject(new Error("Owned browser shutdown failed"));
            else resolve();
          }
        );
      });
    }
  } catch {
    if (!exited()) owned.kill("SIGKILL");
    console.error("No se pudo finalizar el navegador de auditoría.");
    process.exitCode = 1;
  } finally {
    // Chromium also owns debugging pipes beyond stdin/stdout/stderr. Those
    // inherited handles must close before Node emits the child close event.
    for (const stream of owned.stdio) {
      stream?.destroy();
      if (stream && "unref" in stream && typeof stream.unref === "function")
        stream.unref();
    }
    owned.unref();
    try {
      await bounded(closed, 3000);
    } catch {
      console.error(
        "No se pudo confirmar el cierre del navegador de auditoría."
      );
      process.exitCode = 1;
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const value = (name: string) => {
    const index = args.indexOf(name);
    return index < 0 ? undefined : args[index + 1];
  };
  const supplied = value("--base-url");
  if (!supplied)
    throw new Error(
      "Indicá --base-url http://127.0.0.1:PUERTO. Usá el build local de producción para medir rendimiento."
    );
  const origin = localAuditBaseUrl(supplied);
  const product = value("--product-slug");
  const routes = [
    ...AUDIT_ROUTES,
    ...(product ? [auditProductRoute(product)] : []),
  ];
  const output = path.resolve(
    "test-results",
    "local-storefront-audit",
    new Date().toISOString().replace(/[:.]/g, "-")
  );
  await mkdir(output, { recursive: true });
  const executablePath =
    process.env.CHROMIUM_PATH || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  const browserServer = await chromium.launchServer({
    host: "127.0.0.1",
    ...(executablePath ? { executablePath } : {}),
  });
  const browser = await chromium
    .connect(browserServer.wsEndpoint())
    .catch(async (error: unknown) => {
      await closeAuditBrowser(browserServer);
      throw error;
    });
  const pages: Array<{
    route: string;
    viewport: string;
    failures: string[];
    [key: string]: unknown;
  }> = [];
  const writeCheckpoint = async (complete: boolean) => {
    await writeFile(
      path.join(output, "report.json"),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          origin,
          complete,
          expectedPages: routes.length * AUDIT_VIEWPORTS.length,
          budgets: AUDIT_BUDGETS,
          method:
            "Chromium local, contextos nuevos, 1440/390 px, movimiento reducido, sin throttle. Heurísticas DOM; no sustituye una auditoría WCAG ni métricas de campo.",
          pages,
        },
        null,
        2
      )
    );
  };
  try {
    for (const viewport of AUDIT_VIEWPORTS) {
      for (const [routeIndex, route] of routes.entries()) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          reducedMotion: "reduce",
          serviceWorkers: "block",
        });
        const blockedOrigins = new Set<string>();
        await context.route("**/*", async (request) => {
          const url = new URL(request.request().url());
          // Approved image delivery is read-only. Everything else must stay on the explicit local origin.
          if (
            url.origin === origin ||
            (url.protocol === "https:" &&
              url.hostname === "res.cloudinary.com" &&
              request.request().resourceType() === "image")
          )
            await request.continue();
          else {
            blockedOrigins.add(url.origin);
            await request.abort();
          }
        });
        const page = await context.newPage();
        const session = await context.newCDPSession(page);
        await session.send("Network.enable");
        const resourceTypes = new Map<string, string>();
        const transferred = { total: 0, scripts: 0, largestImage: 0 };
        session.on("Network.responseReceived", (event) =>
          resourceTypes.set(event.requestId, event.type)
        );
        session.on("Network.loadingFinished", (event) => {
          transferred.total += event.encodedDataLength;
          if (resourceTypes.get(event.requestId) === "Script")
            transferred.scripts += event.encodedDataLength;
          if (resourceTypes.get(event.requestId) === "Image")
            transferred.largestImage = Math.max(
              transferred.largestImage,
              event.encodedDataLength
            );
          resourceTypes.delete(event.requestId);
        });
        let pageErrors = 0;
        page.on("pageerror", () => {
          pageErrors++;
        });
        const initializeMetrics = () => {
          const metrics = {
            lcpMs: null as number | null,
            cls: null as number | null,
          };
          Object.assign(window, { __localAuditMetrics: metrics });
          if (
            PerformanceObserver.supportedEntryTypes.includes(
              "largest-contentful-paint"
            )
          )
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries())
                metrics.lcpMs = entry.startTime;
            }).observe({ type: "largest-contentful-paint", buffered: true });
          if (
            PerformanceObserver.supportedEntryTypes.includes("layout-shift")
          ) {
            metrics.cls = 0;
            let sessionValue = 0,
              sessionStart = 0,
              lastShift = 0;
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                const shift = entry as PerformanceEntry & {
                  value: number;
                  hadRecentInput: boolean;
                };
                if (shift.hadRecentInput) continue;
                if (
                  sessionValue &&
                  shift.startTime - lastShift < 1000 &&
                  shift.startTime - sessionStart < 5000
                )
                  sessionValue += shift.value;
                else {
                  sessionValue = shift.value;
                  sessionStart = shift.startTime;
                }
                lastShift = shift.startTime;
                metrics.cls = Math.max(metrics.cls ?? 0, sessionValue);
              }
            }).observe({ type: "layout-shift", buffered: true });
          }
        };
        // tsx names nested functions with __name. Provide its identity helper
        // before invoking serialized callbacks; this exists only in the audit browser.
        await page.addInitScript({
          content: `Object.defineProperty(globalThis, "__name", { value: (target) => target, configurable: true }); (${initializeMetrics.toString()})();`,
        });
        let stage = "navigation";
        try {
          const response = await page.goto(`${origin}${route}`, {
            waitUntil: "load",
            timeout: 30_000,
          });
          await page.waitForTimeout(1500);
          stage = "metrics";
          const result = await page.evaluate(() => {
            const visible = (element: Element) => {
              const style = getComputedStyle(element);
              return (
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                element.getClientRects().length > 0 &&
                !element.closest('[aria-hidden="true"], [hidden]')
              );
            };
            const name = (element: Element) =>
              (
                element.getAttribute("aria-label") ||
                (element.getAttribute("aria-labelledby") ?? "")
                  .split(/\s+/)
                  .map((id) => document.getElementById(id)?.textContent ?? "")
                  .join(" ") ||
                element.textContent ||
                element.getAttribute("title") ||
                element.querySelector("img")?.getAttribute("alt") ||
                ""
              ).trim();
            const issues: string[] = [];
            if (!document.documentElement.lang.trim())
              issues.push("Falta el idioma del documento.");
            if (document.querySelectorAll("main").length !== 1)
              issues.push("La página debe tener un único landmark main.");
            if (
              [...document.querySelectorAll("h1")].filter(visible).length !== 1
            )
              issues.push("La página debe tener un único H1 visible.");
            if (document.documentElement.scrollWidth > innerWidth + 2)
              issues.push(
                "Hay desborde horizontal; revisar controles o columnas en esta pantalla."
              );
            for (const image of [...document.querySelectorAll("img")].filter(
              visible
            )) {
              if (!image.hasAttribute("alt"))
                issues.push("Hay una imagen sin atributo alt.");
              const rect = image.getBoundingClientRect();
              if (
                rect.bottom > 0 &&
                rect.top < innerHeight &&
                (!(image as HTMLImageElement).complete ||
                  !(image as HTMLImageElement).naturalWidth)
              )
                issues.push("Hay una imagen en pantalla que no pudo cargarse.");
            }
            for (const element of [
              ...document.querySelectorAll("button,a[href]"),
            ].filter(visible))
              if (!name(element))
                issues.push("Hay un botón o enlace sin nombre accesible.");
            for (const element of [
              ...document.querySelectorAll(
                "input:not([type=hidden]),select,textarea"
              ),
            ].filter(visible)) {
              const control = element as HTMLInputElement;
              if (!name(element) && !control.labels?.length)
                issues.push("Hay un campo sin etiqueta accesible.");
            }
            const navigation = performance.getEntriesByType("navigation")[0] as
              PerformanceNavigationTiming | undefined;
            const resources = performance.getEntriesByType(
              "resource"
            ) as PerformanceResourceTiming[];
            const bytes = (entry: PerformanceResourceTiming) =>
              entry.encodedBodySize || entry.transferSize;
            const scripts = resources.filter(
              (resource) =>
                resource.initiatorType === "script" ||
                /\.js(?:\?|$)/.test(resource.name)
            );
            const images = resources.filter(
              (resource) =>
                resource.initiatorType === "img" ||
                /\.(webp|avif|png|jpe?g)(?:\?|$)/i.test(resource.name)
            );
            const metrics = (
              window as unknown as {
                __localAuditMetrics: {
                  lcpMs: number | null;
                  cls: number | null;
                };
              }
            ).__localAuditMetrics;
            if (!metrics)
              throw new Error(
                "ReferenceError: __localAuditMetrics is not defined"
              );
            return {
              ...metrics,
              transferBytes:
                (navigation?.encodedBodySize || navigation?.transferSize || 0) +
                resources.reduce((sum, resource) => sum + bytes(resource), 0),
              scriptBytes: scripts.reduce(
                (sum, resource) => sum + bytes(resource),
                0
              ),
              largestImageBytes: Math.max(0, ...images.map(bytes)),
              issues: [...new Set(issues)],
            };
          });
          // CDP measures encoded transfer even when a remote image has no Timing-Allow-Origin header.
          result.transferBytes = transferred.total;
          result.scriptBytes = transferred.scripts;
          result.largestImageBytes = transferred.largestImage;
          stage = "keyboard";
          await page.keyboard.press("Tab");
          const keyboardFocus = await page.evaluate(() => {
            const element = document.activeElement;
            if (!element || element === document.body) return false;
            const rect = element.getBoundingClientRect();
            return (
              rect.width > 0 &&
              rect.height > 0 &&
              rect.bottom > 0 &&
              rect.right > 0 &&
              rect.top < innerHeight &&
              rect.left < innerWidth
            );
          });
          if (!keyboardFocus)
            result.issues.push(
              "El primer Tab no alcanza un control visible; revisar el acceso por teclado."
            );
          const screenshot = `${viewport.name}-${routeIndex}.png`;
          stage = "screenshot";
          await page.screenshot({
            path: path.join(output, screenshot),
            fullPage: true,
          });
          const failures = [
            ...(response?.status() !== 200
              ? [
                  `HTTP ${response?.status() ?? "sin respuesta"}; revisar esta ruta.`,
                ]
              : []),
            ...result.issues,
            ...performanceBudgetFailures(result),
            ...(pageErrors
              ? [`${pageErrors} errores de JavaScript; revisar hidratación.`]
              : []),
            ...(blockedOrigins.size
              ? [
                  `Recursos externos no permitidos: ${[...blockedOrigins].join(", ")}.`,
                ]
              : []),
          ];
          pages.push({
            route,
            viewport: viewport.name,
            width: viewport.width,
            screenshot,
            ...result,
            pageErrors,
            failures,
          });
          console.log(
            `${viewport.name} ${route}: ${failures.length ? `${failures.length} puntos para revisar` : "OK"}`
          );
        } catch (error) {
          const diagnostic = localAuditFailure(error);
          console.error(
            `${viewport.name} ${route}: ${stage} / ${diagnostic.code}`
          );
          pages.push({
            route,
            viewport: viewport.name,
            failures: [diagnostic.message],
            diagnostic: { stage, ...diagnostic },
          });
        } finally {
          // Keep measured evidence even if browser cleanup is interrupted.
          await writeCheckpoint(false);
          await context.unrouteAll({ behavior: "ignoreErrors" });
          await context.close();
        }
      }
    }
  } finally {
    await writeCheckpoint(
      pages.length === routes.length * AUDIT_VIEWPORTS.length
    );
    console.log(`Reporte y capturas: ${output}`);
    if (pages.some((page) => page.failures.length)) process.exitCode = 1;
    await closeAuditBrowser(browserServer, browser);
  }
}

void main()
  .catch((error: unknown) => {
    console.error(localAuditFailure(error).message);
    process.exitCode = 1;
  })
  .finally(() => {
    // This standalone CLI has finished all report writes and bounded cleanup.
    // A missing Windows child-close event must not keep its protocol server alive.
    process.exit(Number(process.exitCode) || 0);
  });
