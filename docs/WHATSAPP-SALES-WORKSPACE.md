> The merged code can run with migration 0024 for catalogue browsing and ordinary image management. Migration 0025 enables the shared sales workspace and image focus controls. See [merge readiness](MERGE-READINESS-2026-10.md).

# Run sales through WhatsApp

This review batch adds the twenty-nine authorised coding priorities in [the scope plan](WHATSAPP-OPERATIONS-PLAN-2026-10.md). Open `/admin/ventas` as the owner. It extends PR #17; the earlier browser-only ledger remains at `/admin/herramientas-ventas` so existing local records can be reviewed and exported. They are not silently imported into the shared workspace.

The business remains a demand test. No workspace record accepts payment, creates a store order or reservation, changes stock, contacts a supplier or sends a customer message. A quotation is only useful after Anton supplies actual model evidence, prices, units and conditions. Email and the two-ring builder remain deferred.

## First useful records

1. Add an enquiry under **Consultas**, using an anonymous alias and the designs requested. Record a next action and its date; the inbox shows due follow-ups. Customer phone numbers and the original conversation remain in your WhatsApp account. Do not paste credentials, personal contact details or private message transcripts into free-text notes.
2. Under **Proveedores**, enter a genuine dated supplier quotation with an exact reference, source, size and unit. Blank cost fields mean unknown; enter zero only when that cost has been established as zero. Availability confirmation and quote expiry describe the supplier's statement, not inventory in this store.
3. Under **Cotizaciones**, choose supported model lines, the correct unit and quantity, confirmed customer prices, delivery terms and optional confirmed services. Mark the quote reviewed only after all amounts and conditions are known. Save it before printing or copying the customer sheet. Use the browser's print-to-PDF destination when a PDF is wanted.
4. After a genuine sale is completed outside this demand-test checkout, add an owner-reported outcome under **Ventas informadas**. Record actual revenue, refund and variable costs. The report shows contribution, not net profit. Incomplete costs produce an unknown contribution, not an assumed margin.
5. Save the workspace explicitly. Other devices read the same saved version. If another screen saves first, the stale screen keeps its draft and asks you to review the current saved version. Export an unfinished draft privately before discarding it.

## The ten added tools

| Tool                          | Where to use it                                          | What the evidence means                                                                                                                                                                                                       |
| ----------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Quote history and differences | Revisiones de cotización                                 | Saved edits preserve the prior quote automatically. Capture another revision when needed; accepting one requires a real date and confirmation reference. Accepted evidence is immutable. Expired terms require a fresh quote. |
| Actual sample inspection      | Muestras                                                 | Link the supplier quotation, actual measurements, finish, defects, outcome and evidence. An unchecked dimension stays unknown. An inspection is not material certification.                                                   |
| Supplier performance          | Desempeño observado                                      | Record request/response, promised/received dates and issue resolution. Compare observed response and fulfilment records; no invented supplier ratings are supplied.                                                           |
| Model and size demand         | Demanda por medida                                       | Link a real enquiry and record its requested measurement/system and unit. The summary keeps systems separate instead of converting an uncertain size.                                                                         |
| Purchasing drafts             | Plan de compras                                          | Link demand and a supplier quote, quantities, complete unit costs, available capital and review evidence. Copy a reviewed draft for your own next step. It never places an order.                                             |
| Customer alternatives         | Alternativas para cliente                                | Compare two or three supported quotes with matching units, confirmed totals and conditions. Saved customer sheets exclude sourcing costs and private notes.                                                                   |
| Audit and safe undo           | Historial y privacidad                                   | Review changed record IDs, date, actor and revision. Only the current latest save can be undone; a newer save or accepted evidence blocks an unsafe recovery.                                                                 |
| Connected export/deletion     | Historial y privacidad                                   | Export the saved linked records privately. For deletion, explicitly choose commercial-record, reminder and audit retention. The tool does not invent your legal retention policy.                                             |
| Model-specific questions      | Preguntas por modelo                                     | Enter a genuine question, supported answer, model, evidence and review date. Publishing needs explicit confirmation. Edits unpublish the answer for review; concepts cannot acquire commercial FAQ claims.                    |
| Local mobile checks           | [Repeatable storefront audit](LOCAL-STOREFRONT-AUDIT.md) | Run the existing Chromium tooling on a local production build. It records page-weight/timing budgets, practical accessibility checks and screenshots; it is not field performance or WCAG certification.                      |

Routine **Quitar del borrador** removes a row from the editable workspace; after saving, earlier audit copies may still recover it. Use the dedicated linked deletion tool for a deliberate permanent deletion. That action invalidates all earlier recovery payloads, even when audit metadata is retained, so undo cannot resurrect deleted records. Existing downloaded exports and backups remain separate copies that Anton must manage according to his actual retention decisions.

The private workspace has bounded collections, a 750 KB canonical payload limit and thirty recent audit recovery points. These limits suit the initial demand test. At larger volume, review the data model and retention requirements before widening limits. Exported JSON includes private commercial data; it is not a customer document.

## Storefront and marketing

The category pages now have verified stone-shape and width filters, bounded spelling/synonym assistance and a quick preview drawer. Image zoom, image order and focal positioning preserve product geometry. The optional gift section captures wishes and asks about presentation; it does not promise packaging, adjustment or a date.

Use **Campañas** for an editorial page at `/campanas/<slug>`. Select existing public categories, guides and published real models. No reserved concept product is accepted as a commercial campaign model. Enable the page only after reviewing its text. Enabled pages appear in the selections index, collection links and sitemap; a disabled or unknown page returns 404. There are no new Meta/Google pixels or product-account requirements.

Product-specific FAQ answers expose only the question and answer. Supplier references, evidence links, verifier identity, costs, anonymous enquiries and case notes remain private. The reserved `concepto-*` pages retain noindex, hidden prices, no purchase controls, no offers and no sitemap/feed entries.

Bulk price previews also show cost-floor warnings from complete private cost profiles with a confirmed matching sale unit. Unknown costs or units remain unassessed. A single-ring price is never compared to a pair cost. Warnings do not adjust any prices automatically.

## Data and migration

This batch introduces **migration 0025**: `sales_workspace`, `sales_workspace_audit`, `sales_search_gaps`, and nullable focal-position fields on `product_images`. The tables participate in the existing backup/restore allowlist and cursor handling. No production migration was applied in this session. Existing production migrations 0023 and 0024 must not be repeated.

Missing workspace tables have a safe empty public projection, and the owner screen disables saving when the migration is missing. Catalogue image reads now retry the existing 0024 columns with default centred focus; ordinary image creation, editing and ordering remain available. **Migration 0025 must be applied and verified before enabling the shared workspace and image focus controls**, as part of a separately authorised rollout with a recovery plan. While it is pending, health correctly reports schema readiness as false. Confirm migration status, catalogue reads and the complete health booleans afterwards; an HTTP 200 alone is insufficient. Back up and verify recovery using [backup operations](BACKUP-RECOVERY.md). Do not run push or seed recipes on production.

Search-gap collection is **off by default**. If enabled explicitly, it stores only day, one of ten known intent buckets and a capped count. It does not persist raw searches, visitor IPs or customer messages. Follow-up reminders are dashboard/manual drafts; occasion reminders require recorded consent and never send automatically.

## What Anton still supplies

- Real supplier quotations, rights to product photographs, confirmed model/size/unit/material facts and actual sample evidence. Research documents identify prospects; they do not establish a supply agreement.
- Customer prices, full variable costs, genuine service/delivery availability and conditions, returns/resizing/engraving decisions, and actual sale outcomes.
- The retention decisions for private records, exports and backups; owner access and device security.
- Review of this draft PR and the migration plan. Anton has authorised merging the stacked PRs. Production migration and hosting actions still need separate authorisation.
- An existing destination inbox and ready Cloudflare account when email work is resumed. The non-email workflows remain usable meanwhile.

Return to [the owner operating guide](OWNER-OPERATING-GUIDE.md) for supplier research, identity settings, website administration, security, cron jobs, data and all related documents.
