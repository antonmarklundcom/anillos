# Admin workspace audit and navigation

## Scope and evidence

This change concerns the admin presentation, navigation and setup guidance, with a login redirect correction that validates the current database session. Order state transitions, inventory, checkout pricing and role permission contracts are preserved. The inventory below was read from every `src/app/admin/**/page.tsx` and the permission matrix in `src/lib/permissions.ts`. Execution evidence is recorded below; synthetic fixtures are separate from the preview and production databases.

## Navigation contract

Replace the horizontal overflowing menu with a persistent desktop sidebar and a mobile drawer. Preserve `data-admin-panel`, which hides the public store header/footer/cart context, and `TESTIDS.adminNavOrders`. Preserve the pending-review badge, logout and a link back to the storefront.

The server must filter destinations using the authenticated actor's capabilities before passing items to a client component. Saved IDs can reorder only this already authorized list. They cannot create destinations, grant capabilities, override labels or add routes. Each existing page and server action keeps its own guard.

Provide **Editar menú**, drag reordering, keyboard-accessible up/down buttons, **Guardar**, **Cancelar** and **Restaurar orden original**. Changes stay a draft until saved. Cancel discards the draft; restoring the original order also stays a draft until saved. New authorized entries append to a saved order. Invalid JSON, duplicates, unknown IDs and unavailable storage must leave usable navigation. Announce save failures through a status region.

Preferences are per admin account in this browser/origin, stored in localStorage, not in the server database and not shared across devices. Do not store credentials or customer/order data there. Document the local scope beside the save controls. Use a stable server hydration snapshot; honor account switches and role changes without exposing previously authorized items. The mobile drawer should close after navigation or Escape and return focus to its trigger. Current-route highlighting must recognize product and order detail paths.

For printing, remove sidebar, mobile menu, open drawer and action chrome. Main content should use the page width. Keep the remito's own identity/date/payment header and role-specific price visibility. The previous global print selector `header { display: none }` also hides that remito header and needs narrowing to navigation chrome.

## Reusable implementation investigation

Read-only inspection found an existing implementation in sibling `productos-new/src/components/admin/sidebar.tsx`, its integration in `src/app/admin/(panel)/layout.tsx`, and `tests/e2e/admin-sidebar.spec.ts`. The local upstream snapshot `ecom-source-2026-10-05` still uses the horizontal header; no template synchronization was performed.

The Productos component accepts `AdminNavItem[]` with stable ID, href, label, optional test ID and review badge, plus user ID. The server filters capabilities. It uses `admin-menu-order:v1:${userId}`, validated ID ordering, `useSyncExternalStore`, storage/custom events, a desktop sidebar and mobile Sheet. Reuse the design and contracts within this repository; add the owner guide destination and preserve this store's wrapper/printing behavior. Existing Productos tests cover owner route traversal, save/cancel/reset, mobile closure/focus and print visibility, but Anillos also needs role isolation, corrupt preferences and populated detail-page checks. No files in the sibling repository were changed or copied with environment/build/Git data.

For promotion to the ecom template, use `src/lib/admin-navigation.ts` and `src/components/admin/admin-navigation.tsx` with the server-filtered role list, stable account ID and role-appropriate home URL. The components contain no Anillos brand, domain, product or database assumptions. Their `admin-menu:v1:${userId}` preference is scoped naturally by origin. Carry the Spanish message keys, explicit print chrome selectors, CartSheet admin-route guard, validated login redirect, and focused tests together. `SetupForm` defaults to no fictional catalogue; a template store may explicitly opt in with `allowDemoCatalogue`, which explains that imports do not remove examples. Anillos keeps it disabled. This PR changes Anillos, not the upstream template checkout or another store.

## Complete page inventory

All protected pages inherit the session-validated panel layout and noindex admin metadata. `owner` has all capabilities. `staff` has operational capabilities. `vendedor` has only order viewing, dispatch and internal notes.

| URL | Page gate | Main workflow / preservation check |
| --- | --- | --- |
| `/admin/login` | Public login; signed-in redirect | Password masking, safe next destination, setup link only while setup is available; no automatic email recovery claim. |
| `/admin` | `dashboard` | Pending orders, stock, unmatched payments and truthful launch/cron notices; owner/staff only. |
| `/admin/pedidos` | `adminActor` + layout | Search, status/payment/date filters, pagination; vendedor never sees monetary values or exports. |
| `/admin/pedidos/por-cobrar` | `pedidos.cobrar` | Recoverable orders and follow-up views; owner/staff only. |
| `/admin/pedidos/[id]` | `adminActor` + layout | Order items, transitions, internal notes, tracking; receipt, edit, refund and price blocks separately capability-gated. Invalid/missing IDs return 404. |
| `/admin/pedidos/[id]/imprimir` | `adminActor` + layout | Remito with correct identity/items, no navigation chrome; vendedor print output has no prices. |
| `/admin/productos` | `productos` | Search/category/featured filters, selected rows, activation/duplication; bulk pricing and export remain owner-only. |
| `/admin/productos/nuevo` | `productos` | Create a draft, Markdown preview, safe slug, then redirect to numeric detail. |
| `/admin/productos/[id]` | `productos` | Edit product, variants, stock, images and duplication; invalid/missing IDs return 404. |
| `/admin/categorias` | `categorias` | Create/edit/activate categories; owner-only. |
| `/admin/resenas` | `resenas` | Moderate existing real customer reviews and respond; preserve pending badge; do not create invented reviews. |
| `/admin/devoluciones` | `devoluciones` | Inventory returns and history; stock return is separate from owner-only monetary refund. |
| `/admin/clientes` | `clientes` | Search/list customer information; owner-only export appears only when its existing account/permission conditions hold. |
| `/admin/cupones` | `cupones` | Create/update coupons with existing usage limits and dates; owner-only. |
| `/admin/actividad` | `actividad` | Filter real order/stock events and pagination; owner/staff. |
| `/admin/envios` | `envios` | Zones/prices and shipping methods/payment eligibility; owner-only. |
| `/admin/banco` | `banco` | Account details and optional QR; owner-only. |
| `/admin/ajustes` | `ajustes` | Identity/contact/policies/hero, stock threshold and customer-account setting; owner-only. |
| `/admin/integraciones` | `integraciones` | Configured source/status, masked secrets and existing provider tests; owner-only. |
| `/admin/usuarios` | `usuarios` | Separate users/roles, active status, protect last active owner; owner-only. |
| `/admin/bienvenida` | `usuarios` | Owner access is distinct from readiness to sell; essential tasks and initial setup closure. |
| `/admin/guia` | `usuarios` | Basic operation, verified supplier/KWP drafting guidance, concepts and manual access recovery. |

## Safe isolated fixtures and smoke workflow

Use a new loopback MySQL/MariaDB database whose name contains `test`, distinct from production and the existing preview. Verify resolved host/database before any reset. `tests/global-setup.ts` drops/recreates the supplied test database and migrates with Drizzle plus extras; its name check alone does not enforce loopback, so the caller must do both checks. Never point the reset helpers at the preview or real store. Keep URLs and temporary passwords in ignored/process-local environments, never in this document or tool output. No provider calls, messages or real charges are required.

`tests/helpers/factories.ts` supplies `createCategory`, `createProduct`, `createVariant`, `createOrder` and `createAdminUser`. For simple render fixtures these are sufficient: create a synthetic category, product, stocked variant, three users with `owner`/`staff`/`vendedor`, and a synthetic pending order. `createOrder` creates only the header: add an `orderItems` row with variant FK, name/SKU snapshots, integer PYG unit/line prices, IVA and quantity for detail/print checks. Use visibly synthetic buyer details and `.test` admin emails. Do not derive anything from live customers.

For mutations involving inventory, payments or transitions, create the order through the existing `src/domain/create-order.ts` flow with the fixture's variant/shipping/payment prerequisites. That establishes reservations, snapshots, counter and audit history correctly. Do not exercise state transitions on a header-only order or change domain state through browser-calculated totals. Leave external credentials/messaging absent and use synthetic transfer data; keep browser fixtures separate from integration suites which call `resetTables()` between cases.

Prioritize these meaningful checks:

1. Login owner, traverse all 17 primary panel pages and populated product/order detail plus new-product/print pages. Assert rendered content, no panel error boundary, no public store chrome and no JavaScript errors. Check invalid detail IDs return 404.
2. Search the synthetic product/order, create a product draft, preview Markdown, duplicate and deactivate the copy. Edit an isolated variant's stock and confirm audit history. Existing `tests/e2e/productos.spec.ts` provides useful test-ID contracts.
3. On a correctly created pending order, save an internal note and edit quantity. Follow allowed paid/preparing/shipped transitions with synthetic tracking using existing actions; compare the buyer view. Existing `tests/e2e/panel.spec.ts` covers these workflows.
4. Login staff and vendedor separately. Assert the allowed menu and direct-route guards; vendedor must not receive amounts, receipts, refunds, bulk pricing or owner settings. Tampered saved navigation cannot expose owner links. Direct action guards remain independently tested in `tests/unit/admin-guards.test.ts` and integration suites.
5. Save menu order, reload, cancel a draft, reset/save, test account isolation and corrupted/duplicate/unknown IDs. Simulate storage failure, check keyboard controls and responsive overflow. On mobile verify Sheet Escape, link closure and returned focus.
6. Print the populated order for owner and vendedor: preserve remito heading/items, redact vendedor prices and hide desktop/mobile navigation without clipping the content.

## Essential versus optional services

Entering the panel confirms the account/session, not commerce readiness. Real supplier data, sale mode, stock, integer PYG prices/unit-pair semantics, contact, delivery coverage/methods and an operational payment route are prerequisites for opening sales. The five reserved `concepto-*` examples stay unpurchasable/noindex/out of sitemap; create real products with new slugs and confirmed specifications.

Bank account data controls transfer eligibility in `src/domain/payment-readiness.ts`. Cloudinary is required for the existing image and transfer-receipt upload workflow; missing upload credentials must be presented honestly, never replaced by fake values. Configure a real public WhatsApp contact for the intended support workflow. Public WhatsApp links and automated WhatsApp Cloud templates are separate features. Code-level payment readiness does not itself verify an image/receipt provider or a human fulfillment promise.

Pagopar is optional if using another working payment route; card eligibility uses its existing configured check. Automated messages/templates, analytics and customer accounts are optional. Do not enable GTM/analytics as part of this task. Existing jobs such as unpaid-order expiration still require an operational cron independently of optional notifications. Provider checks/QR/uploads that need external accounts must be marked unverified in local smoke results rather than invoked with invented credentials.

The current owner recovery is manual `pnpm create-owner` using the same owner email and a new password on the authorized server; it invalidates prior sessions. Automatic email recovery is not implemented. Cloudflare email investigation is not a ready integration or a promise of recovery delivery. Remove `SETUP_SECRET` and redeploy only after verifying ordinary owner login; do not remove database/session/cron configuration.

## Validation evidence

The implementation includes `scripts/test-admin-workspace-fixture.ts` and `tests/store/admin-workspace.spec.ts`. The fixture requires `STORE_ADMIN_E2E=1`, equal explicit `DATABASE_URL` and `TEST_DATABASE_URL`, loopback MySQL and the exact database name `anillos_admin_workspace_test`. It refuses populated account/product/order/integration tables and does not migrate or reset anything. Run it only after creating and migrating that fresh isolated database. It creates synthetic `.example.test` accounts, one stocked product and a domain-created order with reservations; its manifest in ignored `playwright/.cache/admin-workspace-fixture.json` contains IDs only. Integration provider fields are blanked in the fixture process.

Commands after isolated database preparation:

```text
pnpm exec tsx scripts/test-admin-workspace-fixture.ts
pnpm exec playwright test --config playwright.store.config.ts admin-workspace.spec.ts
```

The separately started browser server must use that same isolated database, absent real provider credentials and a loopback `STORE_BASE_URL`; browser execution also requires `STORE_ADMIN_E2E=1`. The test password is deliberately synthetic and committed solely for the disposable accounts. Never provision those accounts in production. The browser suite checks route rendering, owner/staff/vendedor permissions, menu persistence/drafts, mobile navigation, remito print output, product editing, internal notes and allowed paid/preparing transitions through existing actions. Desktop/mobile share one isolated order and avoid confirming it twice. It does not send messages, call providers or verify real fulfillment.

Validation on 6 October 2026:

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed, lockfile unchanged. |
| `pnpm db:generate` | 33 tables, no schema changes or new migration. |
| `pnpm typecheck`, `pnpm lint` | Passed. |
| `pnpm test:unit` | 99 files; 1,058 passed and 2 inherited skips. |
| `pnpm exec vitest run --project integration` on MySQL 8.4.11 | 83 files; 868 passed, 1 unconfigured sandbox skip. Separate guarded loopback schema. |
| Same integration suite on MariaDB 10.11.19 | 83 files; 868 passed, the same sandbox skip. Independent guarded loopback schema. |
| `pnpm build` | Production webpack build passed. |
| Store browser tests | 21 passed: desktop Chromium, mobile Chromium and installed Google Chrome; all 22 page routes, roles, printing, product edit, order notes and paid/preparing transitions. |
| In-app browser | Synthetic owner login, sidebar navigation and menu editor/cancel verified. No panel error. |

Browser command: `pnpm exec playwright test --config playwright.store.config.ts admin-workspace.spec.ts admin-setup.spec.ts`, with `STORE_ADMIN_E2E=1`, `STORE_CHROME_E2E=1` and `STORE_BASE_URL=http://127.0.0.1:3044`. Chrome is opt-in and uses the installed browser; standard runs retain desktop/mobile Chromium. The final mobile menu editor also checks 320 × 568 px. Unit checks cover corrupt/blocked storage, account isolation, pending-review badge and route highlighting; browser checks cover real native drag/save/reload and drawer Escape/focus return. Synthetic fixtures do not prove external payments, receipt uploads, backups, messages or real fulfillment. Pagopar sandbox credentials were absent; the skipped sandbox transaction was not claimed as verified. The two inherited unit skips concern the template-only customer-account default and an absent local `tiendas.json` registry.

The Chrome extension connection timed out; installed Chrome verification used the repository's Playwright channel instead. Local server logs contained early response-stream closures during rapid automated navigation. Next's renderer emits that message when the destination closes; it does not identify the underlying reason. Rendered admin responses stayed 200 with no JavaScript or panel error boundary. Sidebar links disable speculative prefetch to reduce authenticated database rendering; this is not a diagnosis of the earlier Productos incident. If a panel error recurs, inspect its request ID, timestamp and server log.

External Cloudinary uploads/receipt storage, Pagopar sandbox/card/webhook, WhatsApp automation, backup delivery and future email recovery remain outside verified local behavior. No production credentials, accounts, orders, DNS or provider settings were changed. GitHub Actions is disabled for this repository; these are local checks, not CI results.
