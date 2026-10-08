# Anillos owner operating guide

This is Anton's starting point for running Anillos.com.py: finding demand, choosing suppliers, preparing real products, handling enquiries, protecting data and deciding what to build next. It links the existing documents instead of replacing their detailed instructions.

Updated **7 October 2026**. Supplier research is dated evidence, not a current quotation or supply agreement. Keep passwords, credentials, customer conversations and private financial records outside this guide and Git.

## Start here

| What you need | Open this |
| --- | --- |
| What to do toward a first sale | [First sale sequence](#first-sale-sequence) |
| Suppliers and exact ring references | [Supplier research and catalogue](#supplier-research-and-catalogue) |
| Website settings and owner tools | [Manage the website](#manage-the-website) |
| Daily work and useful numbers | [Operating routine and measurement](#operating-routine-and-measurement) |
| Where data lives and how to protect it | [Data and recovery](#data-and-recovery) |
| Hosting jobs and private security work | [Technical operations for Anton](#technical-operations-for-anton) |
| Twenty further coding ideas | [Further coding priorities](#further-coding-priorities) |
| Every repository document | [Complete document index](#complete-document-index) |
| Original keyword research and session handoffs | [Local source documents](#local-source-documents) |

## Current position

The business is testing demand through **WhatsApp enquiries and showcase pages**. It is not accepting payments, confirming reservations or promising stock, material, prices or delivery that have not been established. Opening WhatsApp prepares a message; the buyer still has to send it. An enquiry is not a sale.

The temporary illustrations help explain styles. Their titles no longer repeat `· concepto` in the new sales batch; images retain the minimal **Imagen ilustrativa** label. Reserved `concepto-*` pages stay price-hidden, unpurchasable, noindex and excluded from sitemap/feed. Create a new real-product slug when a genuine model replaces an illustration.

| Work | Verified review state on 7 October | What this means |
| --- | --- | --- |
| [PR #14](https://github.com/antonmarklundcom/anillos/pull/14) and migrations 0023/0024 | Anton reported them merged/live and applied | Do not repeat setup, migrations or seeds. Production was not inspected in this session. |
| [PR #15](https://github.com/antonmarklundcom/anillos/pull/15) | Merged, verified through GitHub | Contains the demand-test safeguards. Merge status alone does not establish the running production version or saved admin settings. |
| [PR #16](https://github.com/antonmarklundcom/anillos/pull/16) | Open draft, targets `main` | Supplier catalogue preparation and improved category/product enquiries; not released here. |
| [PR #17](https://github.com/antonmarklundcom/anillos/pull/17) | Open draft, based on #16 | Finder, better enquiry forms, sizing printout and owner sales tools; includes this guide. Review after #16. |

The actual local preview is [the ring finder](http://127.0.0.1:54643/elegir). Its synthetic catalogue and accounts are not production data; the URL works only while that local server is running. #16 and #17 need **no new database migration**. Applying catalogue drafts to a real database or releasing code would be separate actions. A future shared CRM would need its own data design.

Older documents sometimes describe transfer-first launch, new-store setup or already completed migration work. Use the current demand-test scope above and the dated status notices before following a historical recipe. No agent is authorised here to merge, deploy, change production/hosting/secrets, spend on images or contact suppliers.

## First sale sequence

1. **Make contact work.** Verify the public name and WhatsApp on a real phone. Set actual email, address and hours only where you have them. In `/admin/ajustes#checkout`, explicitly save no enabled payment methods; saved settings can override code defaults. Check the live checkout yourself. See [demand-test owner steps](DEMAND-TEST-REVIEW-2026-10.md#what-code-can-do-and-what-anton-must-do).
2. **Bring people to a useful destination.** Use the existing collections, choosing guide and sizing guide in your own posts. Read messages for occasion, design, quantity, measurements, city, desired date and budget preference. These are buyer wishes, not your offer. Preview tools in #17 produce copy for you to review and publish manually.
3. **Record genuine enquiries.** Once #17 is released, use and regularly export the owner ledger. Use anonymous aliases and a follow-up date. Count messages actually received, not WhatsApp clicks, as enquiries. Keep the correspondence in your business messaging account; the ledger does not import it. For now, practise with synthetic examples in the local preview.
4. **Choose a small real assortment from demonstrated interest.** Start with two or three exact references worth checking, rather than filling every category. When traffic justifies sourcing, Anton can seek written trade terms and samples himself. The shortlist is a starting point; it proves neither wholesale access nor that a supplier can reproduce every illustration.
5. **Prepare a supported quote.** Confirm the exact model, one-ring versus two-ring unit, composition, stone, dimensions, sizes, cost, photo rights, availability and fulfilment. Resolve contradictory source facts before using them. Calculate contribution with the same unit and actual costs. During the current trial, continue enquiries without taking deposits or payments.
6. **Decide separately when to start commercial sales.** Establish the actual fulfilment, returns, resizing/engraving and payment process first, with appropriate business/tax facts confirmed by Anton. Then provide a supported customer quote and handle a genuine sale under those conditions. The current code batch does not make that business decision or enable payment acceptance.
7. **Measure the result.** Record an actual sale only when it has happened, and distinguish collected revenue, fulfilled sales, refunds and contribution. Use feedback and actual contribution to decide which models deserve better pages, more marketing or inventory.

Income requires a real transaction or an agreed commission/service arrangement; traffic and interest alone are not revenue. Possible later paths are curated resale, confirmed made-to-order sourcing, agreed referral commissions or genuine packaging/personalisation extras. Each needs its own terms, costs and responsibility. None is an active Anillos supplier agreement today.

## Supplier research and catalogue

Read these in order:

1. [Supplier shortlist](SUPPLIER-SHORTLIST-2026-10.md) explains candidate businesses and commercial limitations in Paraguay, Brazil and China. Program prices, minimums and discounts are research snapshots to reconfirm.
2. [Exact product briefs](SUPPLIER-PRODUCT-BRIEFS.md) list twelve concrete references and their missing facts.
3. [Current catalogue batch](SUPPLIER-CATALOGUE-BATCH-2026-10.md) reconciles those references with category/KWP intent and records more recent source problems.
4. [Reference manifest](supplier-models-2026-10.json), [category coverage](supplier-catalogue-coverage.csv) and [draft import CSV](supplier-candidates-draft.csv) are the working data. The CSV has twelve rows after #16 preparation, superseding the older three-row description in the shortlist. Drafts are unpriced, zero-stock and unpublished; imports can update matching existing rows and must be reviewed.
5. [Image pilot](SUPPLIER-IMAGE-PILOT-2026-10.md) gives the exact AJ440 input, prompts, fidelity rejection criteria and dated cost quote. No supplier-specific output has been generated or installed.

The twelve research references comprise four Asunción Joyas models, five G&A references, one Majestic model and two Hub catalogue references. These are not twelve contracted products. GA5025P's source returned 404; GA6220 has conflicting stone/version descriptions. AJ19 needs an unobstructed reference. The researched set does not establish an exact verified steel or 925 SKU. Do not turn generic silver, plated metal or an AI picture into a material claim.

**There is no confirmed supplier for each temporary website illustration.** The research register connects actual source models to intended categories. Its purpose is to replace fictional imagery with faithful presentations of genuine models, not to guarantee that every imagined ring is available.

For each model Anton pursues, keep a private record of:

| Field | Evidence to obtain |
| --- | --- |
| Identity and unit | Supplier name/contact, exact model/SKU, source and date; single ring or pair and what is included |
| Product facts | Written material/purity, plating, stone, width, dimensions, sizes and manufacturing tolerances |
| Commercial terms | Dated quotation, currency, minimum, unit/quantity, taxes, freight, payment terms and validity |
| Fulfilment | Actual stock or manufacturing capacity, responsibility, dispatch/delivery conditions and defective/incorrect-item handling |
| Extras | Whether resizing, engraving and packaging exist, costs, limitations and responsibility |
| Images | Original source, exact physical-model confirmation, permission to publish and, separately, permission for AI editing |
| Economics | Total landed cost per saleable unit, all variable costs, supported customer price and contribution |

Do not publish private costs or supplier negotiations in product copy or this repository. Existing product admin has private supplier reference fields; it is not yet a quotation history or procurement system.

The pilot's 7 October quote was **3 credits total for two single outputs**. Credits are not a cash-price guarantee. Inputs, exact-model confirmation and AI/publication rights must be ready; requote and obtain Anton's spending approval before any generation. Do not invent hidden geometry to create additional angles.

## Manage the website

Production owner access starts at [admin login](https://anillos.com.py/admin/login). Use your existing account; routine management does not require setup or a migration. The full role/page inventory is in [admin workspace](ADMIN-WORKSPACE.md); the newer sales route is documented separately in [sales tools](SALES-ENQUIRY-TOOLS-2026-10.md).

| Destination | Use it for | Boundary |
| --- | --- | --- |
| [Settings](https://anillos.com.py/admin/ajustes) | Name, branding, hero, WhatsApp/email/address/hours/social links, policy text/visibility, checkout and optional customer accounts | Publish actual identity. Review saved text; defaults do not erase old saved promises. Leave payments paused. |
| [Products](https://anillos.com.py/admin/productos) | Product drafts, modes, variants, images and private supplier references | Keep unknowns unknown. Supplier availability is not your physical stock. Reserve concept slugs. |
| [Categories](https://anillos.com.py/admin/categorias) | Existing category names/content and activation | Make useful category pages; avoid thin duplicate keyword pages or unsupported assortments. |
| [SEO and catalogue](https://anillos.com.py/admin/seo) | Existing catalogue/keyword coverage view | Keyword search volume is not visits, sales or guaranteed rankings. Concepts stay noindex. |
| [Sales tools preview](http://127.0.0.1:54643/admin/herramientas-ventas) | Anonymous enquiry ledger, contribution scenarios and marketing copy | **New in #17**, future public route `/admin/herramientas-ventas`, owner-only, local browser storage. No shared CRM or automatic sending. |
| [Users](https://anillos.com.py/admin/usuarios) | Individual users, roles and owner-managed password changes | Owner has all capabilities. Staff has operational access; vendedor has restricted order operations without monetary values. Do not share an owner account. |
| [Integrations](https://anillos.com.py/admin/integraciones) | Actual storage, WhatsApp and optional integration settings | Public WhatsApp links and automated WhatsApp Cloud messages are different features. Optional Meta/Google setup is deferred. |
| [Bank](https://anillos.com.py/admin/banco) | Bank, holder, RUC, account number/type and optional QR | Future payment configuration. Real bank fields do not authorise accepting payments during the trial. |
| [Delivery](https://anillos.com.py/admin/envios) | Actual zones, costs and methods | Configure only confirmed arrangements; current demand copy promises no delivery date. |
| [Orders](https://anillos.com.py/admin/pedidos), [customers](https://anillos.com.py/admin/clientes), [activity](https://anillos.com.py/admin/actividad) | Genuine orders/customer records and operational events | WhatsApp enquiries do not automatically appear as orders or customers. |
| [Reviews](https://anillos.com.py/admin/resenas), [returns](https://anillos.com.py/admin/devoluciones), [coupons](https://anillos.com.py/admin/cupones) | Real review moderation, existing returns and promotions | Do not manufacture reviews or use a coupon to imply an unconfirmed price. Inventory returns and monetary refunds are separate actions. |
| [Welcome](https://anillos.com.py/admin/bienvenida), [admin guide](https://anillos.com.py/admin/guia) | Owner onboarding and operating guidance | Access success does not prove commercial readiness. |

Blank email/address/hours are omitted from the public UI. Confirm an actual operator identity independently: the bank-holder RUC is not a public legal-business identity editor.

For buyers, #17 adds `/elegir`; existing destinations include `/colecciones`, `/categoria/solitarios`, `/guias`, `/guias/talles`, `/comparar`, `/favoritos`, `/contacto` and `/como-funciona`. Review both mobile and desktop when changing content. The sizing printout requires printing at 100% and checking its 50 mm line with a ruler; it is not a guarantee of supplier fit.

Delivery, returns, terms and engraving facts remain to be decided. Some policy routes are disabled and legitimately return 404; do not enable them just to fill the navigation. There is no separate engraving-policy route. Use [launch checklist](LAUNCH-CHECKLIST.md) and [demand-test review](DEMAND-TEST-REVIEW-2026-10.md) to review the actual saved conditions before sales.

Bank-transfer receipt upload uses Cloudinary when configured. The order page offers a WhatsApp receipt fallback if storage is unavailable; it never automatically verifies a payment. This is a future order workflow, not part of enquiry checkout.

## Operating routine and measurement

**Daily:** read real enquiries, clarify missing measurements/unit/city, record an anonymous alias, set the next action and follow-up date, and update the status when something actually changes. Review overdue follow-ups; the current ledger does not remind you automatically. Explicitly save the local ledger before closing it.

**Weekly:** export the ledger, count genuine enquiries by category, identify why prospects stopped, review which supplier facts are needed and inspect costs before supporting any quote. Review public contact links and the pages used in your posts. Check jobs/backup evidence separately from marketing numbers.

**After each genuine sale:** record the agreed unit, collected amount, actual supplier/delivery/packaging/fees and any refund, then reconcile fulfilment and contribution. The current local ledger can record a manually reported sale; it does not maintain a financial book or verify the transaction.

| Number | Definition and current collection method |
| --- | --- |
| Enquiries received | Actual incoming conversations; manual count/anonymous ledger. A click is not a received message. |
| Qualified enquiries | Conversations with enough design, quantity, size/city and timing information to pursue; classify manually. |
| Quote rate | Supported quotes issued divided by qualified enquiries for a defined period |
| Quote conversion | Genuine sales divided by quotes, with the period and treatment of still-open quotes stated |
| Loss reasons | Price, unavailable model/size, timing, fit uncertainty or no response; aggregate manually until a structured feature exists |
| Contribution per sale | Supported sale revenue minus landed product cost and all applicable variable costs on a consistent tax basis |
| Marketing cost per new buyer | Actual campaign spend divided by genuinely acquired buyers, when those links are known; no guess from clicks |
| Net result | Contribution minus fixed/other costs; the current contribution calculator does not compute it |

Use integer PYG and a consistent **one-ring or two-ring pair** unit. In the calculator, blank means unknown; enter zero only for a confirmed zero cost. Recalculate price-dependent commissions/taxes when trying a new price. Costs stay in memory and are not saved/exported by the tool.

No new Meta/Google product setup or advertising attribution is included. Manual enquiry/source notes and controlled comparisons of your own posts are enough to start learning; the site does not currently give you a complete traffic-to-profit dashboard. The Keyword Planner export is keyword research, not Anillos visitor analytics or a sales forecast.

## Data and recovery

| Data | Where it lives | Protection and limitation |
| --- | --- | --- |
| Products, variants, settings, users, real orders/payments and activity | Application MySQL database | Private database backups plus a verified restore; never use test/reset/seed tools on it |
| Product/brand media and private receipts | Cloudinary when configured; some initial media is in `public/media` | Retain authorised originals/rights and provider recovery access. A database dump is not a separate backup of every media asset. |
| Automatic database backups | Private authenticated raw Cloudinary assets when enabled | Need actual uploaded success, authenticated retrieval and restore proof; not a public URL |
| Enquiry ledger in #17 | Owner-scoped localStorage in that browser and origin | Starts empty until explicitly opened; explicit save/export/import. Max 200 entries. No cross-device sync or automatic database backup. |
| Buyer enquiry drafts and favourites | Buyer's browser | Local preferences, not incoming leads or a shared customer database. Buyer controls draft saving/removal. |
| Contribution inputs and marketing draft | Current sales-tool screen memory | Not persisted; record your real costs privately elsewhere if needed |
| Supplier research and KWP dispositions | Linked JSON/CSV and documents | Versioned research snapshots, not live supplier inventory. Keep negotiated costs and personal data separate. |
| WhatsApp correspondence | Business messaging account/devices | Not imported or backed up by this application's database backup; manage account/device recovery privately |
| Passwords, API credentials and encryption recovery keys | Private password manager/protected recovery vault | Never Git, this handbook, public URLs or screenshots. Retain the key corresponding to each recoverable encrypted backup. |

Export the owner ledger after meaningful updates and before clearing browser data, changing devices or changing origin. Import shows a review before replacing the current list; preserve an export before replacement. Store files privately. Do not add customer names/phones to the anonymous aliases. The ledger is not an accounting or tax system.

For incidents, start with [backup recovery](BACKUP-RECOVERY.md). Rehearse only on an empty isolated database; this session's stricter rule is disposable loopback with `test` in its name. `backup:verify --restore` additionally requires `_restore_check` at the end. Keep notification services isolated during a rehearsal. Do not restore over the live store or publish a signed backup download URL.

## Technical operations for Anton

These are owner tasks to arrange privately, not actions performed by this guide. [Demand-test steps](DEMAND-TEST-REVIEW-2026-10.md#hostinger-scheduling-steps-for-anton), [deployment reference](../DEPLOY.md) and [backup recovery](BACKUP-RECOVERY.md) give the detail.

1. Verify ordinary owner login before closing initial setup. Then remove `SETUP_SECRET` privately in hPanel and redeploy; check `/setup` is unavailable. If an owner already exists, do not rerun setup for routine login. Email password recovery is not implemented; see [admin setup/recovery](ADMIN-SETUP.md).
2. Rotate exposed DB/session/cron credentials privately and coordinate app/job updates. **`SESSION_SECRET` also encrypts stored integration credentials**: preserve original recovery keys and provider credentials before changing it; rotation invalidates sessions and requires re-entering saved encrypted integration secrets. Do not put values in a document or command output.
3. Configure and verify the three scheduled jobs below in the actual hPanel. Confirm its timezone/control labels; schedules below use the documented UTC fields. Use a private Bearer header/curl config outside the public web root. The app's environment is not proof that the cron shell inherits its variables. Avoid secrets in query URLs or verbose logs.
4. Verify successful jobs and actual authenticated backup retrieval. A backup skipped for missing Cloudinary can return HTTP 200 without creating a copy. Rehearse restoration and retain the evidence privately.
5. For a separately authorised release, check Node/package-manager compatibility in both install and build logs, run the appropriate checks and review the actual released pages. Do not infer release success from a merged PR or local preview.

| Exact URL | UTC cron fields | Intended work |
| --- | --- | --- |
| `https://anillos.com.py/api/cron/vencer-pedidos` | `*/15 * * * *` | Expiry, reservations/maintenance and notification outbox; optional configured payment reminders |
| `https://anillos.com.py/api/cron/resumen-diario` | `0 11 * * *` | Daily maintenance and optional configured owner digest; intended 08:00 Asunción |
| `https://anillos.com.py/api/cron/backup` | `0 6 * * *` | Private database backup when Cloudinary is ready; intended 03:00 Asunción |

There is no fourth outbox job to schedule. These URLs **write operational state**; do not open them casually to see what happens. Job schedules do not authorise enabling payments or automated messaging. Actual scheduler and provider configuration remain unverified here.

Use `/api/health` to inspect `db`, `catalog`, `schema`, `cron` and enabled-backup freshness. HTTP 200/`ok:true` alone is insufficient. `cron:false` means expiry has no recent successful run within two hours. Enabled backups need a successful run within 26 hours; `backup:true` with backups disabled does not prove a recoverable copy exists.

`pnpm preflight` checks payment readiness, including effective database settings. Paused payments intentionally prevent payment readiness; do not fabricate settings to make it green. Existing #17 code validation passed frozen install, typecheck, lint, unit/UI, both isolated database suites, build and desktop/mobile preview checks, with documented skips. Read [the precise evidence](SALES-ENQUIRY-TOOLS-2026-10.md#validación). This documentation addition does not claim fresh production checks or rerun those suites.

Never run `db:push`, `db:seed`, `demo`, reset helpers or `seed-store --with-concepts` against anything except a disposable loopback test database. Do not repeat production migrations 0023/0024. Generic new-store/template recipes in older documents are not operating instructions for this existing live shop.

## Further coding priorities

These are **twenty proposals beyond the completed #17 batch**, not implemented features or an instruction to build all twenty. Focus the next small batch on enquiries and quotes. Buyer-facing commercial options must use confirmed facts; payment acceptance remains off. Meta/Google product setup, ad attribution, new publication-check tooling and temporary-illustration detection are excluded.

| Rank | Coding idea | Useful result and dependency |
| --- | --- | --- |
| 1 | Shared enquiry CRM | Extend the local anonymous ledger into persistent, cross-device enquiries linked to designs, assigned owner and status. Requires access/data/retention design and likely a migration. |
| 2 | Supplier quotation history and comparison | Save dated private model/size/unit quotations and compare total landed costs, validity and fulfilment. Requires real quotes and private data storage. |
| 3 | Customer quote builder | Generate a reviewed branded PDF/private quote from confirmed lines and delivery costs, without checkout/payment acceptance. Needs quote records and exact commercial facts. |
| 4 | Owner follow-up inbox | Turn due dates into assignable tasks with an owner dashboard reminder and copyable reply. Extend the current overdue counts; no automatic customer messages. |
| 5 | Actual sale contribution report | Link a manually confirmed sale to actual costs/refunds and show contribution by model, supplier and period. Extend the scenario calculator without presenting it as net profit. |
| 6 | Structured reasons for lost enquiries | Add specific reasons and aggregate them so you can distinguish expensive quotes, unavailable sizes and slow follow-up. Extends the current basic closed/lost state. |
| 7 | Two-ring enquiry builder | Let couples select two genuine models and two independent sizes in one brief, with explicit single/pair semantics and a combined request. Builds on the current two-measure enquiry. |
| 8 | Supplier confirmation freshness | Track dates for model/size/availability confirmations and flag stale private records. Never convert supplier stock into Anillos stock. |
| 9 | Price floor warnings in admin | Connect supported variable costs to bulk-price previews and flag prices below contribution targets. Requires stored costs; owner reviews any price change. |
| 10 | Better search intent and typo handling | Match common ring terms and spelling mistakes to relevant existing designs/categories while preserving verified-fact filters. Improve the existing search rather than duplicating it. |
| 11 | Search gaps dashboard | Aggregate safe, redacted zero-result searches and unmet style/size requests to guide sourcing/content. Requires minimal first-party data design; no Meta/Google integration. |
| 12 | Real-model shape and width filters | Add useful stone-shape/band-width filters where those attributes are actually verified. Extend the current catalogue filters without guessing from images. |
| 13 | Fast product preview drawer | Show a larger authorised image, confirmed essentials and enquiry action within a collection, without losing the buyer's browsing position. No new database necessarily required. |
| 14 | Campaign landing page editor | Assemble reusable occasion/style pages from existing categories, guides and approved real models. No fake stock, promises or automatically published campaigns. |
| 15 | Better product gallery controls | Add focal-point/crop presets, mobile zoom and image ordering for authorised real-model images. Keep product geometry intact and originals available. |
| 16 | Confirmed add-on quote options | Add genuine packaging, engraving or resizing options to a quote only after cost/terms are established. Requires real services and accurate limitations. |
| 17 | Gift enquiry journey | Collect discreet packaging, recipient timing and fit uncertainty in a short optional gift brief. Requests preferences instead of promising services. |
| 18 | Delivery cost capture for quotes | Extend existing shipping zones with a dated delivery quote per enquiry, separating buyer preference from confirmed courier cost/time. Needs actual fulfilment terms. |
| 19 | After-sales case tracking | Manage actual fit/defect/engraving issues with evidence, responsible person and resolution, building on existing inventory returns. Requires private records and agreed policies. |
| 20 | Opt-in occasion reminders | Store customer-approved gift/anniversary reminders and prepare manual follow-up drafts. Requires consent/deletion controls and customer-data design; no automatic sending. |

Build #1–3 first if enquiry volume justifies shared storage. Their quote/cost records enable #4–6 and #9. Prefer #13 or focused search/gallery improvements if there is not yet enough enquiry volume to justify a CRM. Confirm the schema impact when designing a selected batch; this list itself requires no database work.

## Complete document index

This index covers every tracked root/documentation Markdown file at the time of writing, plus the catalogue data. Technical/audit records are useful evidence, but their old counts, PR states and rollout steps must be read with the current status above. Ignored environment files, private runtime data and dependency documentation are intentionally outside the index.

### Suppliers and catalogue data

| Document | What it is for |
| --- | --- |
| [SUPPLIER-SHORTLIST-2026-10](SUPPLIER-SHORTLIST-2026-10.md) | Candidate supplier businesses, programme snapshots and cost cautions |
| [SUPPLIER-PRODUCT-BRIEFS](SUPPLIER-PRODUCT-BRIEFS.md) | Twelve exact ring references and unresolved facts |
| [SUPPLIER-CATALOGUE-BATCH-2026-10](SUPPLIER-CATALOGUE-BATCH-2026-10.md) | Current preparation, KWP destinations, source conflicts and validation |
| [SUPPLIER-READY-IMPLEMENTATION](SUPPLIER-READY-IMPLEMENTATION.md) | Existing private supplier fields, units, imports and sale modes; transfer-first history is superseded for this trial |
| [SUPPLIER-IMAGE-PILOT-2026-10](SUPPLIER-IMAGE-PILOT-2026-10.md) | Exact-input pilot, permissions, prompts, fidelity criteria and dated quote |
| [AI-CATALOGUE-WORKFLOW](AI-CATALOGUE-WORKFLOW.md) | Safe AI-assisted catalogue drafting and minimum real-product evidence |
| [supplier-models JSON](supplier-models-2026-10.json) | Twelve researched source records; private preparation input |
| [supplier candidates CSV](supplier-candidates-draft.csv) | Generated unpriced/unpublished draft import; not a production import instruction |
| [supplier coverage CSV](supplier-catalogue-coverage.csv) | Category/KWP intent, researched destinations and remaining evidence |
| [catalogue intents JSON](catalogue-intents-2026-10.json) | Broader keyword-group disposition register |
| [media provenance JSON](MEDIA-PROVENANCE.json) | Origin/limitations of initial media; not supplier availability |

### Sales and administration

| Document | What it is for |
| --- | --- |
| [SALES-ENQUIRY-TOOLS-2026-10](SALES-ENQUIRY-TOOLS-2026-10.md) | #17 buyer tools, local ledger, contribution/copy tools and complete validation |
| [ADMIN-SETUP](ADMIN-SETUP.md) | Login, initial setup closure and manual recovery |
| [ADMIN-WORKSPACE](ADMIN-WORKSPACE.md) | Page/role inventory, menu settings and operating boundaries |
| [LAUNCH-CHECKLIST](LAUNCH-CHECKLIST.md) | Business/operational prerequisites before real sales; new-store steps are historical for this shop |
| [DEMAND-TEST-REVIEW-2026-10](DEMAND-TEST-REVIEW-2026-10.md) | Eight checks, current enquiry policy, private rotation and scheduling steps |

### Content and marketing research

| Document | What it is for |
| --- | --- |
| [COMPETITOR-RESEARCH](COMPETITOR-RESEARCH.md) | Dated public competitor/catalogue/marketing observations |
| [SEO-CATALOGUE-COVERAGE](SEO-CATALOGUE-COVERAGE.md) | Keyword scope, assortment gaps and exclusions |
| [SEO-CONTENT-IMPLEMENTATION](SEO-CONTENT-IMPLEMENTATION.md) | KWP-backed category/guide implementation and limitations |
| [CATALOGUE-SEO-REVIEW](CATALOGUE-SEO-REVIEW.md) | Category/product SEO review evidence |
| [PRODUCT-SEO-SCHEMA-AUDIT](PRODUCT-SEO-SCHEMA-AUDIT.md) | Product metadata/schema and indexability findings |
| [HOMEPAGE-REVIEW](HOMEPAGE-REVIEW.md) | Homepage review and validation history |
| [RING-SCROLL-AUDIT](RING-SCROLL-AUDIT.md) | Ring animation/media/layout diagnosis |

### Operations and recovery

| Document | What it is for |
| --- | --- |
| [DEPLOY](../DEPLOY.md) | Hostinger technical reference; do not repeat initialisation or production schema steps |
| [BACKUP-RECOVERY](BACKUP-RECOVERY.md) | Private retrieval, integrity, encryption keys and isolated restore |
| [REVIEW-FIXES-ROLLOUT](REVIEW-FIXES-ROLLOUT.md) | Historical #14 migration/release procedure with applied-status notice |
| [ENV-OPCIONAL](ENV-OPCIONAL.md) | Optional integration names/contracts; not a place for secret values |
| [CLAUDE-EMAIL-INVESTIGATION](CLAUDE-EMAIL-INVESTIGATION.md) | Proposed email work; not an implemented recovery service |
| [CLOUDFLARE-EMAIL-HANDOFF](CLOUDFLARE-EMAIL-HANDOFF.md) | Email research context and questions; no ready integration claim |

### Implementation and review history

| Document | What it is for |
| --- | --- |
| [STORE-IMPLEMENTATION](STORE-IMPLEMENTATION.md) | Store layout/configuration and template boundary |
| [VERIFICATION](VERIFICATION.md) | Earlier checks and preview evidence; latest sales results are in the sales-batch document |
| [CODING-HANDOFF-2026-10](CODING-HANDOFF-2026-10.md) | Earlier coding/PR handoff; use current PR states above |
| [SITE-IMPROVEMENTS](SITE-IMPROVEMENTS.md) | Previous improvement priorities and disposition |
| [IMPROVEMENT-PLAN-2026-10](IMPROVEMENT-PLAN-2026-10.md) | Dated implementation plan and discovered issues |
| [TEMPLATE-HARDENING](TEMPLATE-HARDENING.md) | Payment/security/operational foundations and verification |
| [ECOM-TEMPLATE-UPSTREAM](ECOM-TEMPLATE-UPSTREAM.md) | Candidates for a separate template change; no template work authorised here |
| [ECOM-BUG-AUDIT-PROMPT](ECOM-BUG-AUDIT-PROMPT.md) | Historical template audit prompt, not work to repeat |

### Repository and developer references

| Document | What it is for |
| --- | --- |
| [README](../README.md) | Repository introduction and local-development entry point |
| [AGENTS](../AGENTS.md) | Repository instructions for coding agents |
| [CLAUDE](../CLAUDE.md) | Additional repository working instructions |
| [ARCH](../ARCH.md) | Application architecture and invariants |
| [NEW-STORE](../NEW-STORE.md) | Generic template/new-store setup; not routine operations for this existing store |
| [KNOWN-ISSUES](../KNOWN-ISSUES.md) | Recorded issues and limitations |
| [TASKS](../TASKS.md) | Existing task register; reconcile old entries before repeating work |
| [PLAN](../PLAN.md) | Template/application implementation plan |
| [CHANGELOG](../CHANGELOG.md) | Recorded change history |

## Local source documents

These links point to Anton's local files outside the repository. They are available on this computer and will not travel with a GitHub checkout. Dates or instructions in historical handoffs do not override the current scope.

| Source | Use |
| --- | --- |
| [Consolidated handoff](<C:/Users/anton/OneDrive/Documents/ChatGPT/Websites Oct26- and beyond/anillos-review/CONSOLIDATED-HANDOFF-2026-10-07.md>) | Complete cross-session history, artefacts and current boundaries |
| [Supplier catalogue handoff](<C:/Users/anton/OneDrive/Documents/ChatGPT/Websites Oct26- and beyond/anillos-review/SUPPLIER-CATALOGUE-HANDOFF-2026-10-07.md>) | Supplier batch, pilot and subsequent sales implementation evidence |
| [Original Keyword Planner export](<C:/Users/anton/Downloads/anillos.com.py-keywords-for-ai.md>) | Owner's original keyword rows; read Summary, Meaning groups and relevant Group details |
| [Earlier Claude handoff](<C:/Users/anton/Downloads/anillos-claude-handoff-2026-10-08.md>) | Earlier research/context to reconcile with actual code |
| [Earlier indexed review prompt](<C:/Users/anton/Downloads/prompt-3-codex-review-with-file-index.txt>) | Historical file map and review request |

Maintain this guide when the business stage, public release, supplier agreement, tool storage or recovery process changes. Keep dated evidence in its source document and update the relevant link/status here.
