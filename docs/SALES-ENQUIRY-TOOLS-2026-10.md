# Ventas por consulta: lote de octubre de 2026

Este lote mejora la elección, la calidad de las consultas y la organización del dueño durante la prueba de demanda. No habilita cobros ni convierte una consulta en pedido. No requiere schema, migración, variables nuevas, importación de productos ni cambios de hosting.

## Dependencia y alcance

- Rama: `codex/sales-enquiry-tools`, basada en `codex/supplier-catalogue-pilot` (PR #16, commit `0dfac98`).
- PR #15 fue fusionado por fuera de esta sesión. `origin/main` contiene su commit `e6ffc16`; PR #16 ahora apunta a `main`.
- Este lote se revisa sobre #16 para mostrar únicamente las mejoras de ventas. No se fusiona ni despliega ningún PR desde esta sesión.
- Los conceptos conservan sus slugs reservados, noindex, exclusión de sitemap/feed, precios ocultos y bloqueo de compra.
- Sin trabajo adicional en generación de imágenes, publicación de modelos, Meta/Google products o atribución de anuncios.

## Cambios para compradores

1. Los títulos visibles de conceptos dejan de repetir `· concepto`, también en autocomplete y si la DB conserva el nombre antiguo. No se reescriben filas. Las imágenes conservan `Imagen ilustrativa`; la tarjeta usa solamente `Solo consulta`. El historial de vistos descarta conceptos reservados incluso si conserva un precio antiguo.
2. `/elegir` pregunta ocasión y estilo, sugiere hasta tres colecciones existentes y enlaza guías existentes, favoritos y comparación. Las respuestas nunca se convierten en hechos del producto.
3. La ficha permite preparar una consulta opcional con cantidad, diámetro, segundo diámetro cuando corresponde, ciudad, fecha deseada, preferencia de presupuesto y detalles del estilo. Se puede revisar el mensaje antes de abrir WhatsApp o copiarlo.
4. Favoritos permite consultar hasta cinco diseños en un solo mensaje. Cambiar los diseños seleccionados conserva los datos todavía no guardados. Las fichas en modo showcase quedan fuera de esta selección de consulta.
5. Guardar, recuperar y eliminar borradores son acciones explícitas en el navegador. No hay guardado automático ni envío automático. Si el contacto o el portapapeles no están disponibles, queda texto para copiar.
6. La guía de talles incorpora una hoja A4 imprimible con línea de calibración de 50 mm y círculos de diámetro interior de 13 a 23 mm. La pantalla no es una regla física: imprimir al 100 % y verificar con regla. Es una referencia geométrica; confirmar talle y ajuste con el proveedor.
7. En comparación, la columna de etiquetas permanece visible al desplazar la tabla en móvil.

### Unidad y mensaje de WhatsApp

Una unidad verificada como par equivale a dos anillos. La cantidad se expresa en pares completos solamente si todos los diseños seleccionados tienen esa unidad verificada. En una selección mixta o con unidad desconocida, se expresa en anillos y pide confirmar cómo corresponde a la unidad de venta. La categoría de alianzas permite anotar dos medidas sin afirmar que la ficha venda un par.

El mensaje solicita fotos reales y confirmación de modelo, material, piedra, medidas, precio y entrega. La fecha y el presupuesto son preferencias del comprador. Abrir WhatsApp prepara el texto; el comprador debe enviarlo manualmente. No registra disponibilidad, reserva, pedido ni pago.

## Herramientas del dueño

Ruta: `/admin/herramientas-ventas`, opción **Consultas y margen**. La sesión de dueño se exige antes de resolver información para la página. No se expone a staff.

### Registro manual

- Hasta 200 consultas con alias anónimo `consulta-001`, categoría, estilo, estado, fecha y próximo seguimiento.
- Estados: nueva, esperando proveedor, cotizada, cerrada perdida o venta informada manualmente.
- Resumen por estado y categoría, y seguimientos vencidos. Ningún clic de WhatsApp se contabiliza como venta.
- Agregar, editar y quitar cambian la pantalla. Guardar o abrir la copia local requiere una acción explícita; la página comienza vacía hasta abrirla.
- Exportación JSON y revisión de importación antes de confirmar reemplazo. Se rechazan formatos, fechas y duplicados inválidos. Los archivos no incluyen costos.
- Sólo vive en ese navegador, separado por dueño. No tiene sincronización, avisos automáticos, clientes ni datos personales. Exportar periódicamente si se usa para trabajo real; borrar datos del navegador puede eliminar la copia local.

### Margen de contribución

Usar todos los importes en PYG enteros y en la misma unidad (un anillo o un par). Completar compra al proveedor, flete asignado, empaque, comisiones, envío absorbido, ajustes/devoluciones, marketing e impuestos variables. Vacío significa desconocido; ingresar 0 sólo cuando se haya confirmado.

La calculadora muestra contribución y equilibrio por unidad, y precio para una contribución deseada con esos mismos costos. No estima demanda ni ganancia neta; faltan costos fijos y gastos no incluidos. Al ensayar otro precio, recalcular las comisiones o impuestos que dependan de él. No presupone tasas ni guarda/exporta los costos.

### Marketing

Tres objetivos: explorar estilos, preparar medidas y preparar una consulta. Elegir `/elegir`, `/guias/talles`, `/favoritos` o una categoría activa. El borrador usa el nombre efectivo de la tienda y su origen público configurado; si no existe un origen válido, no inventa un dominio.

Revisar y copiar el texto para publicar por cuenta propia. No publica, programa, guarda borradores ni instala medición de Meta/Google. No promete precios, stock, material o entrega.

## Uso recomendado por Anton

1. Probar la elección y la consulta en móvil, incluyendo una pareja y favoritos con varios estilos.
2. Imprimir la guía al 100 % y medir físicamente la línea de 50 mm.
3. Registrar consultas manualmente y elegir una fecha de seguimiento; usar alias anónimos.
4. Completar costos reales o estimados conscientemente antes de interpretar la contribución. Confirmar cotización y condiciones con el proveedor por su cuenta cuando corresponda.
5. Guardar/exportar el registro si se usa en el trabajo diario. La calculadora se vuelve a completar en cada visita.
6. Revisar el borrador de marketing y la página destino antes de publicarlo por cuenta propia.

## Validación

Las verificaciones usan una copia de fuentes visibles sin `.env.local` y únicamente bases loopback descartables con `test` en el nombre. No se copian secretos, bases, Git ni builds de otros repositorios. Node 24.19.0 y pnpm 11.22.0, conforme al pin del repositorio.

| Verificación                                               | Resultado                                                                                                                                                            |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                           | PASS; sin cambios de dependencias ni lockfile                                                                                                                        |
| `pnpm typecheck` y `pnpm lint`                             | PASS                                                                                                                                                                 |
| Unit/UI, 2 workers, límite local 15 s                      | PASS: 133 archivos, 1.224 tests; 2 skips existentes                                                                                                                  |
| MySQL 8.4.11 loopback descartable                          | PASS: 90 archivos, 898 tests; 1 skip existente                                                                                                                       |
| MariaDB 10.11.19 loopback descartable                      | PASS: 90 archivos, 898 tests; 1 skip existente                                                                                                                       |
| `pnpm build:webpack` con URL explícita de preview loopback | PASS                                                                                                                                                                 |
| Chromium 1440 px y 390 px                                  | PASS: elección, consulta codificada, borradores explícitos, favoritos sin pérdida de datos, comparación, checkout pausado y ausencia de overflow en las rutas nuevas |
| Chromium dueño/staff                                       | PASS: registro y cálculo manuales; borrador de marketing; staff redirigido a pedidos sin exponer herramientas del dueño                                              |
| Sitemap y conceptos                                        | PASS: `/elegir` incluido; `concepto-*`/`candidato-*` excluidos; detalle protegido sin Offers, precio ni compra                                                       |
| Impresión                                                  | PASS: A4 de una página, línea CSS de 50 mm y render inspeccionado; falta la comprobación con regla física de Anton                                                   |
| Preflight sin configuración de producción                  | BLOCKED esperado: 7 controles de preparación para cobro sin datos; no acredita el estado de producción ni autoriza habilitar pagos                                   |

Skips: default de cuentas sólo del template; `tiendas.json` ausente en esta tienda; Pagopar sandbox sin credenciales, en ambos motores. No se agregaron credenciales para habilitarlos.

GitHub Actions está deshabilitado en este repositorio (verificado por API el 7 de octubre). Estos resultados son locales; no se afirma CI hospedado en verde.

En el navegador se verificó que órdenes, pagos y reservas permanecieron en cero. El owner usa únicamente actores sintéticos de la base de preview descartable. La URL de preview es `http://127.0.0.1:54643/elegir`; no es una instalación pública ni el dominio de producción.

El primer pase encontró expectativas de texto antiguas, el contrato CSP de la nueva ruta y un fixture que armaba un enlace de WhatsApp fuera del helper compartido. Se corrigieron. Hubo dos timeouts UI de 5 segundos durante build concurrente; el pase final limita workers y permite 15 segundos por test, sin cambiar configuración del repositorio. El harness de preview también necesitó ajustar el selector de los dropdowns y configurar su URL durante build para generar el sitemap local. La revisión visual llevó a usar fondo blanco al imprimir y el guard de capacidad del template para redirigir staff en vez de mostrar una pantalla de error.

## Lo que sigue pendiente

Confirmar modelos reales, permisos de imagen, precios, talles, unidad, entrega y devoluciones sigue siendo trabajo comercial del dueño. El registro actual ayuda a organizar esa prueba; un CRM compartido y persistente requeriría diseño de datos y posiblemente una migración posterior. Este lote no necesita trabajo nuevo de base de datos ni ejecuta acciones de producción.
