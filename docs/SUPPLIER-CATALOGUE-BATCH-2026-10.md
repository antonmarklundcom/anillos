# Supplier catalogue preparation batch — 7 October 2026

This batch branches from PR #15 (`e6ffc163`) and preserves its paused payment defaults and concept safeguards. It is separate catalogue work, intended as a stacked PR targeting `codex/demand-test-enquiry-copy` while #15 remains open. No merge, deployment, production database access or supplier contact is authorised here.

## What this batch implements

- Two distinct, practical style comparisons for each of the ten existing category pages, with working links to the existing guides. No new spelling/location landing pages or unverified supplier offers.
- A product enquiry brief on concept, enquiry and showcase pages. It asks for desired quantity, measures and city/date. Pair-oriented categories ask about two independent measures without asserting a pair is sold. The WhatsApp message requests real photos and confirmation of the model, composition, price and delivery; it creates no order, reservation or payment. Showcase pages retain their informational flow without a WhatsApp CTA.
- Twelve exact research references in `supplier-models-2026-10.json`, expanded from the three-row historical draft CSV. `pnpm catalogue:prepare` is a pure file generator: it accesses no DB, secret environment, source-image upload or publication API. The existing importer can read its unpriced enquiry CSV. All rows have zero stock, hidden price, no images, no verified specifications and only private reference/source fields. New imported products remain unpublished under the existing importer. The file is preparation, not an instruction to apply it to production.
- `supplier-catalogue-coverage.csv` records the current category title/H1/meta, KWP intent, model destinations, content quality, indexability/schema and remaining evidence. This is a focused operational register for this batch, not a replacement for the broader historical 166-label disposition register.
- A specific image pilot with exact inputs, hashes, prompts, rejection checks and fresh per-output quotes in [SUPPLIER-IMAGE-PILOT-2026-10.md](SUPPLIER-IMAGE-PILOT-2026-10.md). No product-specific AI output was generated or installed.

## Evidence refreshed and limits

The twelve-source shortlist remains research. Only sources used in the first pilot received a direct image/input check in this batch; historical entries explicitly say they need rechecking. Agreements, sample quality, stock, costs and fulfilment remain unknown.

- AJ440 and AJ19 pages returned HTTP 200 directly on 7 October and their published image inputs were inspected. Source originals/physical SKU and edit/publication rights are still unconfirmed. AJ19's support occludes the ring backs; it is not a usable isolated whole-ring generation input.
- [GA5025P's historical page](https://joyeriagya.com/par-de-alianzas-de-plata-nacional-modelo-cinta-5mm/) returned HTTP 404 directly despite a cached old product page. It is held, outside the pilot.
- GA6220 has two primary indexed descriptions: [circón](https://joyeriagya.com/solitario-de-oro-amarillo-modelo-clasico-con-circon-central/) and [moissanita](https://joyeriagya.com/solitario-clasico-de-oro-amarillo-18k-con-moissanita-redonda-0-5-ct/), with different widths. Resolve model/version identity before writing a verified gemstone fact or using its photo.
- Gold pair width discrepancies remain 2 versus 1.9 mm and 2 versus 2.3 mm. Majestic CR279's announced plating is not solid gold or steel. Hub catalogue names are specific references but not obtained supplier SKUs.
- None of these twelve references supports a verified steel SKU or a confirmed 925 SKU. Keep `acero` and `plata-925` educational until exact evidence exists. “Plata nacional” is not silently upgraded to 925. Source retail prices are never copied into our drafts.

## KWP reconciliation

Read the owner's original export in order: Summary, Meaning groups, then relevant Group details, including wedding/alliance, silver, gold, promise, solitaire, commitment, men and heart rows. The automated summary falsely says no brand phrases while the details contain competitor names; exclude them. Cluster totals include off-topic/material/brand queries and are not demand estimates for a purchasable assortment.

The coverage CSV stores a **single main-row monthly count**, not a summed market total. Folded spelling/plural variants count once and share one destination. Separate relevant rows are explained as context; no separate thin pages are made. General silver demand does not establish a 925-specific count. Heart style stays within `/categoria/promesa` (30 for the main `anillo de corazon` row) with CR279/Hub research, not a new commercial heart page. No imaginary showroom, pickup point or location promise is created.

Public categories/guides provide useful information. A private research draft is not an indexable commercial offering. Protected `concepto-*` URLs stay noindex, out of sitemap/feed, price-hidden and unpurchasable. Genuine real-model enquiry pages can later be reviewed for publication using accurate facts and authorised imagery; enquiry schema still omits Offers, and no rich-result/ranking eligibility is promised.

## Safe owner sequence

1. Review #15 and this dependent batch; do not deploy either automatically. Continue with no enabled payment methods saved in admin for the demand test.
2. Review the private twelve-reference manifest and coverage CSV. Choose real models to pursue; do not approve historical or conflicting facts just because a draft exists.
3. For AJ440, obtain/confirm an original of the exact physical model and the right to edit/publish it with AI. For AJ19, additionally obtain an isolated complete reference. Additional views are required before a gallery/hand shot.
4. Once those inputs are ready, decide whether to approve the 3-credit AJ440 A/B. Requote immediately before generation. Reject an attractive but altered ring; do not spend on a catalogue batch until this pilot passes.
5. Before any real-model page becomes public, approve its exact identity/description and image rights. Leave unknown price, supply and delivery explicitly unknown in enquiry/showcase mode. Confirm composition only from physical/source evidence; never infer it from the generated picture.
6. Supplier agreements, samples, margins, fulfilment and returns remain Anton's business decisions. No supplier was contacted in this batch.

## Database, deployment and template boundary

No schema change, migration, production data change or new environment variable is required. Existing private supplier fields, draft import, sale modes and image provenance are sufficient. Do not rerun production migrations 0023/0024. Later applying an import or publishing approved models is a separate data action. Existing drafts should be reviewed before reimporting: the importer reconciles by identity and may update matching rows, so preparation is not a safe unattended production update.

The ecom template is untouched. A pure catalogue-preparation pattern or enquiry brief could be proposed upstream later, separately from this store's ring copy/KWP/source research.

## Fresh validation

Results will be recorded after this batch's frozen install, typecheck, lint, unit/UI, disposable MySQL/MariaDB integration suites, Webpack build and Chromium preview checks. Historical #15 results are not substituted for these checks. GitHub Actions was disabled at reconciliation; local checks must be reported as local.
