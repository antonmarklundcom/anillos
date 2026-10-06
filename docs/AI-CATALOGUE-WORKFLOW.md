# Catálogo de Anillos con ayuda de IA

El setup crea acceso administrativo y prepara el schema. No debe cargar un catálogo genérico. Codex o Claude pueden preparar la estructura, las fichas y el SEO a partir de Keyword Planner; la demanda no confirma qué mercadería existe ni su composición, precio o stock.

## Qué productos de ejemplo hay

`scripts/seed-data.ts` conserva 24 fixtures del template. No son anillos ni ofertas reales de esta tienda. No ejecutar `pnpm db:seed`, `pnpm demo` ni el setup con `seed:true` en producción.

| Categoría de prueba | Productos                                                                                                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Electrónica         | Auriculares Bluetooth TWS; Parlante portátil 20W; Smartwatch deportivo; Power bank 20.000 mAh; Teclado mecánico compacto; Cámara de seguridad WiFi.                                      |
| Hogar y Cocina      | Termo de acero inoxidable 1L; Jarra térmica para tereré 2,5L; Juego de sábanas 2 plazas; Set de ollas antiadherentes 5 piezas; Ventilador de pie 18 pulgadas; Yerba mate compuesta 1 kg. |
| Moda                | Remera de algodón básica; Camisa de lino manga corta; Jean slim hombre; Vestido de verano floral; Mochila urbana impermeable; Gorra trucker.                                             |
| Deportes            | Pelota de fútbol N°5; Zapatillas de running; Set de mancuernas 10 kg; Bicicleta MTB rodado 29; Colchoneta de yoga 6 mm; Guía de entrenamiento (libro).                                   |

Los cinco conceptos de Anillos son otra cosa: **Banda satinada, Onda de plata, Par de alianzas lisas, Par de alianzas doradas y Solitario delicado**. Son ilustraciones de diseño con slugs `concepto-*`, sin compra, precios públicos, stock, indexación ni sitemap. El nombre del concepto no certifica la composición de una pieza. Se siembran sólo con `scripts/seed-store.ts --with-concepts` en bases loopback descartables con `test` en el nombre. El seed de tienda sin esa opción crea únicamente las diez categorías y conserva los datos existentes.

## Trabajo que puede hacer Codex o Claude

1. Leer el archivo del dueño `anillos.com.py-keywords-for-ai.md` en orden: resumen, grupos de significado y detalles de cada grupo. Usar Paraguay/español. Los mismos números de variantes cercanas cuentan una vez; un grupo corresponde a una página o sección. Excluir marcas y competidores incluso si la clasificación automática del archivo no los detecta.
2. Partir de las categorías y guías ya implementadas y de `docs/STORE-IMPLEMENTATION.md`. Engagement/compromiso, promesa y matrimonio son intenciones diferentes. Evitar URLs duplicadas por ortografía, singular o plural.
3. Proponer una matriz de surtido por intención, material y presupuesto. Mantener los datos desconocidos como **pendiente de proveedor**. El volumen sirve para priorizar la investigación y el texto, no para inventar artículos.
4. Con fichas de proveedor confirmadas, redactar nombre natural, slug nuevo, descripción útil, composición, medidas, contenido de la unidad, cuidados y preguntas frecuentes. Un par contiene dos anillos y requiere dos medidas independientes.
5. Preparar título SEO, H1, meta descripción y enlaces a la categoría y guías correspondientes. Responder dudas reales sin saturar el texto ni atribuir certificaciones, procedencia, garantías, entrega o personalización no confirmadas.
6. Revisar cada ficha contra el proveedor y cargarla inicialmente desactivada o en modo consulta según las opciones del panel. Fotografías ilustrativas deben seguir identificadas; no se presentan como imágenes del producto real.
7. Activar compra sólo con precio final entero en PYG, tratamiento fiscal, stock por variante, fotos, entrega, cambios y cobro verificados. No reutilizar los slugs de conceptos ni convertirlos en ofertas reales.

## Datos mínimos por producto real

| Dato                   | Confirmación necesaria                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| Proveedor y referencia | Fuente privada identificable y artículo exacto.                                           |
| Metal y piedra         | Material, pureza, recubrimiento, identidad/origen/tratamiento de gema cuando corresponda. |
| Unidad y variantes     | Un anillo o par de dos; escala del proveedor, medidas independientes y SKU.               |
| Precio y stock         | Precio final en guaraníes, IVA aplicable, stock físico confirmado por variante.           |
| Fotografías            | Pieza real, permiso de uso y correspondencia con cada variante.                           |
| Condiciones            | Ajustes, grabado, cambios, despacho, cobertura y costos reales.                           |

Mientras falten esos datos, se puede mejorar el contenido de categorías y guías y preparar borradores de productos. No corresponde publicar stock o precios supuestos. La guía para el dueño está en `/admin/guia`.
