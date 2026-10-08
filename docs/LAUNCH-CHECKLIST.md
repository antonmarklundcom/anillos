# Launch checklist

Code review/merge and commercial launch are separate decisions. The owner authorized a conflict-free PR and merge for the site fixes. Selling real products still requires the business, supplier and operational checks below.

As of 7 October 2026, Anton confirms PR #14 is merged/live and migrations `0023`/`0024` are applied. Anton later authorised preparing and merging PRs #16–#18; see [merge readiness](MERGE-READINESS-2026-10.md). Production database and hosting actions remain separate. Demand-test actions, evidence and private cron/rotation steps are in [DEMAND-TEST-REVIEW-2026-10.md](DEMAND-TEST-REVIEW-2026-10.md). Do not repeat production setup, migrations or seeds. Pause payment methods explicitly in admin; code defaults do not override saved settings.

- Confirm the operator's legal/business identity, business WhatsApp/email, address and hours that will actually be published. Leave absent details unset.
- Agree supplier specifications, wholesale costs, material verification, photographs, manufacturing/dispatch responsibility, permitted sizes and truthful fulfilment conditions. Do not publish concept fixtures as real goods.
- Define each product's unit: individual ring or **pair of two rings**, with the exact included measures. Confirm final integer guaraní price, applicable tax treatment and optional extras before making it purchasable.
- Upload verified product photographs through the existing admin and create new real-product slugs. Keep concepts unpurchasable and noindex, or remove them from public visibility.
- Begin with `enquiry`/`showcase` and no payment acceptance. Switch an individual product to stock mode only when inventory and fulfilment are verified. Never record expected supplier inventory as physical stock.
- Confirm delivery areas, costs, timelines, returns, adjustments and engraving conditions. Only then configure shipping and enable the corresponding policy pages. The current information page explicitly states the unknowns.
- Configure real payment credentials/bank details only when fulfilment is ready. Prove readiness through `pnpm preflight` and provider-controlled tests; the current missing business/provider checks are intentional launch blockers.
- Provision production MySQL, owner credentials and HTTPS domain configuration. Use frozen installation, checked-in migrations and **`scripts/seed-store.ts` without concepts**, never the generic template demo seed.
- Transfer unique secrets privately; remove setup access after initialization. Verify actual hosting proxy hops/process count, cookies, CSP, throttling and the public origin. Rebuild if the public origin changes.
- Configure private backup storage, preserve the encryption key outside the database, and rehearse authenticated retrieval and restore following `BACKUP-RECOVERY.md`. Configure expiration/outbox and maintenance crons before accepting orders.
- Verify production sitemap, canonicals, contact links, product units and absence of concepts in indexing/feeds. Attach real business conditions and policies before enabling purchase.
- Obtain explicit authorization for production database migrations or manual hosting changes. No supplier has been contacted.
