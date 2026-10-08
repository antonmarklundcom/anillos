# Anillos merge readiness and remaining work

Prepared on 7 October 2026, Asunción time, after Anton explicitly authorised preparing and merging all three open Anillos PRs. GitHub is the authoritative record of their final merge status.

Return to [the owner operating guide](OWNER-OPERATING-GUIDE.md), which links supplier research, exact-model references, administration, data, security and the route to a first sale.

## Reviewable scope

| PR                                                        | Scope                                                                                                                                 | Dependency                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| [16](https://github.com/antonmarklundcom/anillos/pull/16) | Supplier-linked catalogue preparation, twelve exact references, category/product enquiry presentation and quoted faithful-image pilot | Main includes merged PR 15 |
| [17](https://github.com/antonmarklundcom/anillos/pull/17) | Ring finder, sizing printout, clearer enquiries, explicit browser drafts and owner sales tools                                        | PR 16                      |
| [18](https://github.com/antonmarklundcom/anillos/pull/18) | Twenty-nine authorised sales/catalogue improvements, shared owner workspace, and the final walkthrough fixes                          | PR 17                      |

Preserve commits and merge in dependency order using ordinary merge commits. Retarget each remaining PR to main after its dependency is merged. Verify the reviewed head SHA and mergeability immediately before each merge; compare the final main source tree against the tested batch.

## Walkthrough fixes

All numbered findings B01–B16 and C01 in [the original review](WALKTHROUGH-REVIEW-2026-10.md) are addressed. Historical audit evidence is retained there.

- Historical quote revisions survive undo unchanged. Draft service terms are frozen in new preserved revisions; missing legacy terms remain unknown. Accepted evidence stays immutable.
- Linked quotation/enquiry ownership is validated. Invalid FAQ URLs return validation errors; numeric measurement systems reject arbitrary text.
- Shape/width category filters reach results and facets. Price filtering/sorting agrees with the catalogue card, including live holds and the enquiry fallback policy.
- Search resynchronises with URL changes, native keyboard activation works, and old suggestions cannot submit a new query.
- Favourites deduplicate and show a retry after load failure. Cart refresh preserves concurrent edits and rejects stale overlapping responses.
- Confirmed reload/import clears captured customer previews. Native print cannot deliver an unsaved quote or comparison, and hides the private workspace.
- Import review shows FAQ/publication and search-counter settings. Enquiry cart copy hides purchase, tax, old-price and shipping claims.

Meaningful regression coverage is committed beside the existing tests.

## Database and release compatibility

**No additional migration beyond the already generated 0025 is introduced. It has not been applied to production.**

The batch supports the existing 0024 schema for public catalogue browsing and ordinary image creation/editing/ordering. Missing focal columns use centred focus. Focal changes return a clear 0025-required error. Missing shared-workspace tables produce empty public projections and disable owner saving.

Migration 0025 enables the shared workspace, audit/search-gap storage and image focus controls. It requires a separately authorised production rollout, verified private backup and recovery rehearsal. Do not repeat 0023/0024 or use push/seed commands on production. Health correctly reports schema:false until the migration is current. Backup manifests remain tied to the actual applied migration and exclude uncreated tables.

Hostinger may automatically build main after a merge. This task does not change hosting, production data, DNS, credentials or saved business settings. Successful merge and local build do not prove a successful live deployment.

## Validation

| Check                            | Current result                                                                                                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frozen pnpm install              | PASS; pnpm 11.22.0, Node 24.19.0 locally                                                                                                                             |
| Typecheck and lint               | PASS                                                                                                                                                                 |
| Unit/UI                          | PASS; 1,302 passed, two existing conditional skips                                                                                                                   |
| Production webpack build         | PASS; unconfigured isolated DB uses documented fallback reads                                                                                                        |
| Schema generation                | PASS; no schema changes                                                                                                                                              |
| MySQL 8.4.11 / MariaDB 10.11.19  | PASS; 913 passed and one external Pagopar sandbox skip on each engine                                                                                                |
| Pre-0025 compatibility rehearsal | PASS on both engines, including catalogue/feed/product reads, ordinary image CRUD, explicit focal blocking, real 0024 migration metadata and completed backup stream |
| Public route crawl               | PASS: 57 pages return 200; all 24 concept pages noindex; two intentionally disabled policy routes return 404                                                         |
| Fresh browser preview            | PASS for sampled category filters, deduplicated favourites, enquiry cart, protected product/WhatsApp text and mobile paused checkout                                 |
| Isolated preflight               | EXPECTED FAIL: seven missing operational/payment-readiness checks; no production preflight claimed                                                                   |
| GitHub Actions                   | Unavailable: repository Actions disabled; no remote CI success claimed                                                                                               |

All database verification uses this task's checked disposable loopback datadirs. The public preview uses a separate synthetic fixture database. No real supplier/customer data, message sending, payments or production operations are part of these checks. Hostinger Node 22 importer/runtime and live logs remain unverified.

The earlier perf audit remains PARTIAL: desktop-home LCP exceeded its local budget, and Windows browser cleanup could not be fully confirmed. This batch does not claim a fresh passing speed audit or accessibility certification. Production preflight remains unverified; the unconfigured isolated run reports missing operational/payment setup.

## Anton's next actions

1. Verify Hostinger's automatic build/startup outcome for the final main commit, the public catalogue/contact/WhatsApp journey, owner login and complete health booleans.
2. Arrange a private verified backup and authorise/apply migration 0025 before using the shared workspace or image focus controls. Until then, the earlier browser sales tools remain available.
3. Complete owner setup closure and privately rotate DB/session/cron secrets. SESSION_SECRET also protects saved integration credentials: preserve recovery/provider material before rotating it. Remove SETUP_SECRET after confirming ordinary owner login.
4. Configure and verify the three jobs and authenticated backup/recovery process following [the operating guide](OWNER-OPERATING-GUIDE.md) and [backup recovery](BACKUP-RECOVERY.md). Never put secrets in shared documents or logs.
5. Confirm real business contact details, supplier/model availability, composition, sizes, unit, photograph/AI rights, costs, customer price and delivery/returns/resizing/engraving terms. Research and twelve unpublished supplier drafts are preparation, not agreements or stocked products.
6. Approve exact reference inputs, rights and a fresh cost quote before paid image generation. No supplier-based AI product images were generated or installed here.
7. Decide record/export/backup retention and manual follow-up practice. Populate tools with real enquiries, supported quotes and observed outcomes.

Email/Cloudflare integration, the two-ring builder, Meta/Google products and attribution remain deferred. The twenty further coding ideas are suggestions; they are not included in this merge batch. Real payment acceptance remains disabled.
