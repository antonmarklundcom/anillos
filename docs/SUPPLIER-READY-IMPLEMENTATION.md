# Supplier-ready catalogue and transfer-first checkout

Implementation reviewed on 6 October 2026. This is code and local verification, not a production launch, supplier agreement or upstream template contribution.

## What the store gains

- Public WhatsApp fallback: **+595 992 279599**, confirmed by the owner. Saved public contact/integration configuration retains precedence. Internal order-alert recipients still require their own private integration configuration.
- Anillos starts with **bank transfer only**. Explicit owner payment settings override deployment policy and the store profile. Missing or unreadable bank prerequisites prevent transfer checkout; no ueno recipient, account or identity was invented. Enter the actual details in `/admin/banco` and review `/admin/ajustes#checkout`.
- Product and category SEO title/description editors; validated optional CSV columns; private supplier reference/source/image provenance fields; separately verified material, purity, stone, unit and size facts.
- Advisory product completeness checks, a private owner-only `/admin/seo` coverage dashboard, verified-fact FAQs and links to related guides.
- Product URL history with permanent redirects to the current visible product, reserved alias namespaces and backup/restore support. Next.js emits **308**, not 301.
- Stable SKU selection links, base-product canonicals, conditional `ProductGroup` structured data for verified individual size variants, and checked GTIN/MPN identifiers.
- Material, stone, unit and live-stock filters; comparison of up to three public models; accessible gallery zoom with keyboard controls and focus return.

Private supplier information never enters public catalogue queries, comparison or schema markup. Public attributes require an explicit dated verification. Concepts remain illustrative, unpurchasable, without offers, noindex and excluded from sitemap/feed. The reusable template's demo catalogue was not published or imported into production.

## Research and external work

[Supplier briefs](SUPPLIER-PRODUCT-BRIEFS.md) identify twelve exact candidates across Asunción Joyas, Majestic, G&A in Luque and Hub in Brazil. Their prices are source references, not our selling prices or confirmed landed costs. Stock, resale terms, delivery to Paraguay, samples and image permissions remain unconfirmed. No suppliers were contacted and no AI image jobs were submitted.

[Template mapping](ECOM-TEMPLATE-UPSTREAM.md) covers all twenty latest priorities and separates generic mechanisms from ring copy, KWP data, suppliers, contact values and transfer policy. The upstream `ecom` repository and `.template-baseline` were not changed.

[Cloudflare email handoff](CLOUDFLARE-EMAIL-HANDOFF.md) contains current primary documentation and a Claude investigation prompt. Sending, routing, password recovery and order-email implementation remain future work; this PR does not enable them. Google account setup, Search Console and analytics were deferred by the owner.

## Migration and rollout

The generated **`drizzle/0023_previous_mockingbird.sql`** adds nullable product/category SEO and structured JSON metadata, variant facts/identifiers, and the product-slug history table. It does not populate genuine merchandise, inventory, bank details or provider credentials.

New catalogue/admin queries require this migration. A merge alone does not apply it. Coordinate schema application with deployment; an automatic code redeploy before schema application can temporarily leave the catalogue fallback in use and make affected admin screens unavailable. Back up the intended production database first, then use the reviewed versioned migration path in **DEPLOY.md §4** (`pnpm db:migrate` against the intended database, or migration-only setup with `{}` and its private setup secret). Do not use `db:push`, `seed:true` or owner/password fields for this upgrade. Remove temporary setup access and redeploy when finished.

Production migration/manual hosting changes require separate explicit authorization under `docs/LAUNCH-CHECKLIST.md`. They were not performed during this implementation. Verify `/api/health` reports `db:true` and `catalog:true`, then inspect real catalogue/admin pages, transfer readiness and cron freshness. Real product publishing still requires actual stock or verified enquiry terms.

## Verification

- Frozen install: pnpm **11.22.0**, no lockfile changes; local Node **24.19**.
- Drizzle generation reports no schema changes after the committed migration/snapshot; schema has 34 tables. Migration applied only to guarded loopback disposable databases.
- Full lint, final standalone TypeScript check and final production webpack build passed. Scoped lint also covers the final browser-test updates.
- GitHub Actions is disabled at repository level (`actions/permissions`: `enabled:false`). No remote checks/runs were generated for this PR; all test/build evidence above and below is local verification, not GitHub CI. Hosting deployment status is separate.
- Unit/component suite: **1,123 passed, 2 existing conditional skips**, combining the full run with targeted reruns after stale contact/selector expectations and concurrent-worker timing failures were corrected. No assertion timeouts were relaxed.
- MySQL integration: **879 passed, 1 external Pagopar sandbox skip**, combining the full run and the corrected contact-test rerun. MariaDB integration: **879 passed, 1 identical skip** in one full run. Includes slug transactions, structured imports, signed live inventory, malformed/future fact exclusion and gzip backup/reset/restore roundtrip.
- Desktop public audit passed for public pages, local links, images, whole-ring scroll bounds, motion preferences and server-rendered SEO. A broader repeated browser run was stopped after its desktop project; five stale gallery/contact expectations failed there and were corrected in the focused reruns. Focused public verification: **20 cases passed, 1 intentional duplicate-viewport skip** across desktop, mobile and installed Chrome, combining the selected run and corrected product-FAQ reruns. Includes comparison limits, zoom/focus, variant selection, contact links, canonicals and concept/merchant-image exclusion. The optional separate empty-database browser check was not configured in this run; database outage handling has existing regression coverage.
- Isolated synthetic admin workflow suite: **12 cases passed** across desktop, mobile and installed Chrome, combining the initial run and three reruns. Covers every admin section including SEO, details/forms/print, roles, menu order persistence, logout, product editing, order notes and allowed state transitions. Trace inspection showed pending login requests exceeding the original five-second assertion during concurrent checks; reruns passed without changing the login code or timeout.
- Desktop/mobile screenshots of catalogue, product, comparison, zoom and owner SEO/settings were captured and visually reviewed. No page-level horizontal overflow was found; the comparison table scrolls within its own container.
- ChatGPT in-app browser login remains **unverified**: its automation connection timed out/failed to attach. Installed Chrome login and admin workflows passed. No conclusion about a site defect was drawn from the browser connection failure.

External credentials/services, production schema and jobs, transfer receipt storage, bank reconciliation, genuine product data and email delivery were not verified in production. Local synthetic credentials and browser captures are ignored/local evidence and are not committed.
