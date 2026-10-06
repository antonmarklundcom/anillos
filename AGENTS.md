# Instrucciones de la tienda

Leé `CLAUDE.md`, `ARCH.md`, `NEW-STORE.md` y `docs/STORE-IMPLEMENTATION.md` antes de cambiar la tienda. Este repositorio es Anillos, una implementación independiente del template ecom, no un worker limitado a una lista de archivos de un manager.

- Respetá el alcance autorizado por el usuario. Conservá origin, historial y `.template-baseline`.
- Separá diseño/configuración de maquinaria. `src/domain/**`, `src/lib/**`, `src/app/actions/**`, checkout y admin mantienen las garantías del template.
- Plata entera en PYG; estados del pedido sólo por `transitionOrder`; restas SQL entre UNSIGNED con `CAST(... AS SIGNED)`.
- Schema nuevo requiere migración generada y commiteada. No elimines contratos `data-testid`.
- Marca desde configuración e identidad efectiva del panel. Datos de contacto, pagos, composición, precios y entregas requieren confirmación; no inventes defaults.
- No habilites compras de conceptos. Reservá los slugs `concepto-*`; noindex, sin sitemap, precios ocultos, stock cero y seed sólo en base loopback descartable con `test` en el nombre.
- Secretos privados en entorno ignorado; nunca imprimirlos ni agregarlos a Git. No copiar bases, credenciales, builds ni Git de otros repositorios.
- Antes de entregar: frozen install, migraciones coherentes, typecheck, lint, tests con MySQL y MariaDB descartables, build y Chromium cuando el alcance lo requiera. Reportá skips y fallos con honestidad.
- No desplegar, fusionar ni contactar proveedores sin autorización nueva y explícita.
