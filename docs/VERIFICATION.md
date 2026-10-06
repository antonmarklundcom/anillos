# Verification — Anillos implementation

Reviewed on 5 October 2026 using disposable, loopback-only databases. No supplier or production database was used. The preview deliberately has no contact/payment configuration.

| Check                      | Actual result                                                                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Template bootstrap         | Dry-run plan inspected, then `pnpm bootstrap:repo`: 652 new files; existing `.gitignore` extended. Destination history/origin preserved.                                                                               |
| Source integrity           | Clean ecom checkout at `c5422e3c9184f0c4e4575da3db2774329d063214`; `.template-baseline` matches.                                                                                                                       |
| Installation               | `pnpm install --frozen-lockfile --offline` passed, 606 packages. Lockfile identical to the pinned template. Node 24.19.0 / pnpm 11.25.0.                                                                               |
| Migrations                 | All 23 checked-in migrations and inherited post-migration steps passed in four isolated databases. `pnpm db:generate`: no schema changes, nothing to migrate.                                                          |
| MariaDB 10.11.19           | Full suite: 172 files passed; **1,830 tests passed, 3 skipped**.                                                                                                                                                       |
| MySQL 8.4.11               | Integration suite: 864 passed, 2 transient infrastructure failures, 1 skipped. Both complete affected files were rerun unchanged: **16/16 passed**. All 866 integration cases passed across the run and recheck.       |
| Final unit/UI              | 89 files passed; **964 tests passed, 2 skipped**.                                                                                                                                                                      |
| Typecheck / lint           | Passed.                                                                                                                                                                                                                |
| Production build           | Passed with the concept-only disposable preview database and unconfigured business providers.                                                                                                                          |
| Inherited Chromium flows   | **32 passed**: admin CRUD, orders, purchase fixtures, uploads, enquiry/showcase selectors, privacy/security and JS budgets. Purchase fixtures exist only in the independent browser-test database.                     |
| Anillos Chromium           | **8 passed**, desktop and Pixel 7: keyboard skip link, paused/reduced motion, variants, pair/individual labels, no contact or purchase controls, search, all six guides, canonicals, sitemap/feed and checkout gating. |
| Additional Chromium checks | 320 px viewport: document width 320 px; data-saving mode: no motion-sequence requests; actual Open Graph response: 200 PNG, 1200×630.                                                                                  |
| Shared guarantees          | `src/domain`, `src/lib`, `src/app/actions` and `drizzle` are identical to the pinned source. Existing `data-testid` contracts pass.                                                                                    |

The unchanged compressed-JavaScript limits passed: home **214.5 KB / 247 KB**, product **225.9 KB / 252 KB**, checkout **212.0 KB / 246 KB**. The motion uses no animation dependency; its desktop/mobile WebP frame variants total 809,198 bytes together, and only the relevant variant loads. Reduced motion and data saving retain the static poster.

## Skips and infrastructure limitations

After the public-route rendering correction, the relevant CSP, proxy and SEO regressions passed: **3 files, 52 tests**. New public routes and favourites render per request; the template security policy is unchanged. The final browser checks assert visible guide headings/articles, rather than only checking their hidden streaming markup.

- Two inherited unit tests intentionally skip: the template-placeholder defaults do not apply to a branded store, and `tiendas.json` is not distributed into independent stores.
- The real Pagopar sandbox case skips because no provider credentials are confirmed. Mock protocol/idempotency tests pass; a real payment acceptance claim is not made.
- During the MySQL integration run, a Unicode-path Git fixture exceeded its unchanged 30-second limit and one backup-route setup hit a database connection timeout. Both affected files passed in isolated reruns without source or timeout changes. Shared Windows host load affected this run.
- The template `setup:doctor --skip-docker` reports pnpm missing on Windows because its plain `execFileSync("pnpm")` lookup does not resolve `pnpm.cmd`. The actual pnpm install, scripts, tests and build worked. Docker was skipped; real native MySQL and MariaDB servers were used instead.
- Node processes required execution outside the restricted Windows sandbox, whose `os.userInfo` call failed. Only authorized local verification and repository operations used that execution context.
- `pnpm preflight` correctly fails with two blockers: Cloudinary and the business WhatsApp are unset. Bank/card credentials, notifications, backup storage, delivery conditions and supplier agreements also remain unconfirmed. See `LAUNCH-CHECKLIST.md`; this branch is not ready to accept payment.

## Review artifacts and preview

The local production preview is **http://127.0.0.1:3041**. It binds only to loopback and depends on the private disposable preview database. Its canonical origin remains **https://anillos.com.py**. To reproduce elsewhere, follow the README, migrate a new local database and use the guarded store seed with `--with-concepts`.

`playwright.store.config.ts` targets the separately started preview. Run `pnpm exec playwright test --config playwright.store.config.ts`; set `STORE_SCREENSHOT_DIR` to choose a local capture directory. Screenshots and command logs are local review artifacts, not committed builds or databases. Desktop/mobile home and pair captures, a 320 px sizing guide, the social card and a motion contact sheet are in the workspace's `anillos-review` directory. Sticky motion is best reviewed live or in viewport captures; a full-page screenshot naturally shows its scroll-track space.

Generated assets are committed under `public/media`, including the 8-second 720p Seedance 2.5 source video, optimized photographs, motion frames and byte/hash manifests. `MEDIA-PROVENANCE.json` records prompts, generation IDs and visual inspection. The lifestyle portrait uses a fictional, slim adult Paraguayan model specified as age 24. All media and products remain illustrative; no material, stock, certification or customer endorsement is implied.

No merge, deployment or supplier contact occurred.

## 6 October 2026 — owner setup and welcome

The owner form now requires email, password and repeated password, with visibility controls for both passwords and the setup key. It never requests generic demo seeding. After a confirmed owner write, it clears the fields, authenticates through the same credential/rate-limit/session helper as normal admin login and opens `/admin/bienvenida`. A failed sign-in keeps the account-success message and a normal-login fallback. Migration-only API calls remain available to authorized tooling; this browser form is for owner accounts.

The owner-only welcome and basic guide are dynamic and noindex. Public shop navigation, footer and WhatsApp FAB are hidden inside the authenticated panel so its sticky header and success message remain accessible. A browser hit test caught the old desktop overlap before the fix and passes afterward; returning home restores the shop chrome.

| Check                        | Result                                                                                                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frozen installation          | Passed; lockfile unchanged.                                                                                                                                                                                                                       |
| Schema/migrations            | `db:generate`: 33 tables, no schema changes, no new migration.                                                                                                                                                                                    |
| Typecheck and lint           | Passed on the final source.                                                                                                                                                                                                                       |
| Unit/UI                      | 94 files, **1,011 passed, 2 inherited skips**. Includes 19 password-form cases and 11 focused login-handoff security cases.                                                                                                                       |
| MySQL 8.4.11                 | Setup route, authentication, admin users and hardening: 4 files, **54 passed** in the separate loopback auth test schema.                                                                                                                         |
| MariaDB 10.11.19             | The same 4 files and **54 passed**, using a different disposable schema.                                                                                                                                                                          |
| Production build             | Passed after the admin layout correction.                                                                                                                                                                                                         |
| Chromium desktop and Pixel 7 | **8 passed**: login controls, confirmation/mismatch prevention, preserved account success on sign-in transport failure, unauthenticated welcome/guide protection, and real fixture-owner creation followed by signed-in welcome/guide navigation. |
| Review                       | Independent read-only security review and formatting/whitespace checks passed.                                                                                                                                                                    |

The real creation browser cases ran only on `127.0.0.1:3044` against `anillos_welcome_browser_test`, with synthetic credentials. The existing preview and all production accounts were left untouched. They require `STORE_SETUP_E2E=1` and the exact fixture database-name assertion; ordinary store browser runs skip those two cases. Other browser cases run against the concept preview on port 3042 and intercept setup writes.

GitHub Actions is disabled in this repository, so these are local verification results, not CI results. No email, DNS, bank, payment or real product configuration was changed. `docs/CLAUDE-EMAIL-INVESTIGATION.md` contains the requested current-source plan and prompt; email recovery remains unimplemented. `docs/AI-CATALOGUE-WORKFLOW.md` lists the 24 generic demo products and explains the separate five ring concepts and verified-product workflow.
