# WhatsApp operations verification

Verified locally on 7 October 2026, Asunción time. [Draft PR #18](https://github.com/antonmarklundcom/anillos/pull/18) is based on PR #17 (`6ef1f6d`), which depends on #16; #15 is already merged and is preserved. This report concerns code and disposable local fixtures, not production availability or real supplier agreements.

## Completed scope

All ten additional ideas are implemented alongside nineteen of the original twenty: quote revision snapshots and differences, actual sample inspections, observed supplier performance, demand by model/measurement/system/unit, capital-aware purchasing drafts, customer alternatives, audited saves and safe undo, linked private export/deletion, evidence-backed model questions, and repeatable local storefront checks.

The original two-ring builder and email remain deferred. The existing two-measure enquiry still works. Cloudflare readiness and the later email sequence are documented in the [scope plan](WHATSAPP-OPERATIONS-PLAN-2026-10.md). Meta/Google products, attribution and new publication-check tooling are outside this batch.

The [workspace manual](WHATSAPP-SALES-WORKSPACE.md) explains every owner workflow. The [owner operating guide](OWNER-OPERATING-GUIDE.md) links suppliers, exact references, policies, administration, data, recovery and the other documents.

## Validation

Checks used a source-only isolated copy: no production environment, database, credentials, build or Git directory was copied. Runtime: Node 24.19.0, pinned pnpm 11.22.0, local Chrome. Both database servers were forced onto loopback, with their data directories verified inside the named disposable test workspace.

| Check                                | Result and evidence                                                                                                                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`     | PASS; lockfile unchanged, existing dependency versions installed in the isolated copy                                                                                                                                                       |
| `pnpm typecheck`, `pnpm lint`        | PASS after running sequentially with the finished build                                                                                                                                                                                     |
| Unit/UI suite                        | PASS: 1,274 passed, 2 existing skips, 144 files                                                                                                                                                                                             |
| MySQL 8.4.11 integration             | PASS: 905 passed, 1 existing sandbox skip, 92 files; final historical-service undo regression file additionally passed all 5 tests                                                                                                          |
| MariaDB 10.11.19 integration         | PASS: 905 passed, 1 existing sandbox skip, 92 files; final historical-service undo regression file additionally passed all 5 tests                                                                                                          |
| Gallery and audit-policy regressions | PASS: 12 tests, including full 390px panning at 3×, reset at 1×, letterboxing bounds and safe diagnostic classification                                                                                                                     |
| Header regression                    | PASS: 3 focused tests for both layouts in server markup and unique mobile/desktop category test selectors                                                                                                                                   |
| Production-mode webpack build        | PASS in the isolated environment; expected unavailable-database/configuration warnings did not prevent completion                                                                                                                           |
| Generated migration consistency      | PASS: `db:generate` reported no schema changes; migration 0025 was rehearsed only on disposable local databases                                                                                                                             |
| Chromium storefront                  | PASS at 1440px and 390px: quick preview, finder, gift wishes, encoded WhatsApp details, explicit draft save/recovery/deletion, multi-favourite enquiries, sticky comparison, campaign canonical/private-field exclusion and paused checkout |
| Owner/staff browser checks           | PASS: owner workspace saves persist after reload; staff redirects to orders; all new operational tabs render without page overflow                                                                                                          |
| Purchase-state invariant             | PASS: browser fixture orders, payments and reservations stayed at zero                                                                                                                                                                      |
| Sizing printout                      | PASS: A4, one page and 50mm CSS calibration; physical printer/ruler verification remains an owner step                                                                                                                                      |
| Concepts and SEO                     | PASS: hidden price, no purchase action or offer schema, noindex and sitemap exclusion; enabled editorial campaign canonical checked                                                                                                         |
| `pnpm preflight`                     | EXPECTED FAIL: 7 missing payment-readiness checks in the isolated unconfigured environment; payments remain paused. This is not a production preflight result                                                                               |

The two unit skips are existing template-only/default and absent-template-registry checks. The integration skip on each engine needs Pagopar sandbox credentials, which were neither obtained nor used. GitHub Actions is disabled; these are local results. Local Husky hooks invoke typecheck/lint but `sh` is absent from PATH; only the Git commit/push commands bypass those hooks through a command-scoped setting. Both required checks passed directly, with no persistent Git configuration change.

Earlier failures were corrected before delivery: a print CSS module selector, the final header test’s strict undefined-value assertion, save comparison of non-canonical object ordering, audit script top-level await/callback serialization, and test-only gift selectors and the owner tab after reload. A temporary browser diagnostic in the isolated copy caused a lint failure; it was moved outside the checked source tree and the complete lint passed with unchanged rules. Typecheck also briefly overlapped a build deleting generated `.next/types`; it passed when rerun after that build. Browser logs contain expected cancelled-prefetch stream messages from route changes; no client page errors remained in the completed workflow checks.

## Local performance and accessibility

The new [audit command](LOCAL-STOREFRONT-AUDIT.md) checks six routes at both desktop and mobile sizes, with fresh Chromium contexts, reduced motion and no network/CPU throttle. Timing/weight checks are synthetic local results, not field metrics or a WCAG certification. It detected and fixed the shared mobile header layout shifts. The measured result is **PARTIAL**: eleven of twelve page/viewport checks passed. The first desktop home load measured 2,720ms LCP against the 2,500ms budget (previous full measurements ranged from 2,580ms to 3,952ms). This remains a recorded performance concern, not a passing budget or a production speed measurement.

The complete saved twelve-page report is `test-results/local-storefront-audit/2026-10-08T01-18-40-069Z/report.json` in the isolated copy. Across that measurement, maximum CLS was zero, total transfer 855,744 bytes, JavaScript 232,430 bytes and largest image 143,848 bytes. All twelve passed the layout/weight/DOM checks with no page JavaScript errors; the eleven passing pages had LCP from 200ms to 412ms. Screenshots accompany the report. Report completion describes recorded page measurements, not a successful process exit or completed manual review.

The local database launcher initially exited with its detached child, interrupting a browser/audit run. Keeping the verified disposable server in its own running session fixed that local lifecycle issue; the complete storefront and owner/staff workflows passed again. An audit cleanup hang initially prevented its report being written. The command now checkpoints every measured page before cleanup, removes request handlers, bounds shutdown of its own browser and exits after the completed writes. The final command returned **exit 1**: the speed finding remains, and this Windows environment could not confirm automatic browser termination/child-close observation. That cleanup limitation remains recorded rather than claimed fixed. An independent browser-only smoke test confirmed the CLI can exit after a bounded attempt; it does not prove every browser descendant terminated. No failed/interrupted run is counted as a passing result.

Manual checks still include contrast, screen-reader behavior, text enlargement, keyboard focus through every interaction, modal/menu behavior and touch-target usability. Do not claim those have been certified by the DOM heuristics.

## Migration and release dependency

**New database work is required: generated migration 0025. It has not been applied to production.** It adds three private sales tables and nullable image focal columns, with backup allowlist/cursor coverage. No seeds, order/payment migrations or inventory operations are introduced.

Apply and verify 0025 **before releasing this new code**, during a separately authorised rollout with a verified private backup/recovery plan. Catalogue image queries require the new columns; an installation still on 0024 can fail catalogue/product reads with the new release. The additive migration allows the older release to remain active during schema preparation. Check the full health booleans and real catalogue afterwards; HTTP 200 alone does not prove readiness. Do not repeat migrations 0023/0024 or use push/seed recipes on production.

The private workspace is bounded to 750KB canonical JSON and thirty recent audit recovery points. Stale saves retain drafts; latest-only undo cannot erase accepted quote evidence. Undo preserves historical service prices even after a service is repriced or disabled. Deliberate linked deletion invalidates every old recovery payload, while exported files and backups require separate retention management.

## Anton's remaining decisions

1. Review the stacked draft PRs and the migration-first release plan; no merge, deployment, production migration or hosting change was performed here.
2. Supply genuine supplier quotations, photograph permissions, exact model/material/size/unit facts and actual sample evidence. The research register is not a supply agreement.
3. Enter confirmed selling prices, complete variable costs, service and delivery conditions, policies and real sales outcomes. Tools do not invent those facts or turn enquiries into revenue.
4. Set an actual retention policy for private records, local exports and backups; secure owner access and devices. Reminders require recorded consent and are manual drafts.
5. Confirm a working destination inbox and Cloudflare account readiness when email work is resumed. No mailbox, DNS, sender credentials or automated email was configured.

No payment was accepted, supplier contacted, paid image generated, real secret printed/written, production database touched, PR merged or deployment performed.
