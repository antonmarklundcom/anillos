# WhatsApp operations implementation plan

Updated 7 October 2026 after Anton authorised the remaining coding priorities without email. This is the scope for the batch based on PR #17; the implemented workflows and fresh local checks are in the [workspace manual](WHATSAPP-SALES-WORKSPACE.md) and [verification record](WHATSAPP-OPERATIONS-VERIFICATION-2026-10.md). Nothing in this plan authorises production migrations, merge, deployment, supplier contact or payment acceptance.

## Decisions

Build twenty-nine priorities: nineteen of the original twenty and the ten additional ideas. See the [owner guide](OWNER-OPERATING-GUIDE.md) for the original list. Defer the two-ring builder. Prepare customer-facing text for manual WhatsApp sharing and printable quotations; owner reminders appear in the dashboard. Do not require an email address or mailbox for these workflows.

Keep the existing two-measure enquiry form. A **two-ring builder** would be an additional shopping interface where each person chooses an independent model, size and optional specification, followed by one combined enquiry. It is useful when a genuine assortment exists, but Anton has deferred it. It is not necessary to collect two measurements today.

The demand test remains enquiries/showcase, no payment acceptance, automatic messages or claimed supply. Prices, commercial quotes, delivery options and extras require actual supporting facts entered by the owner. New private records do not create orders, reservations, payment confirmations or inventory. Reserved concepts remain unpurchasable, price-hidden and noindex.

## The original twenty

| Number | Priority                              | Decision and channel                                                                            |
| ------ | ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1      | Shared enquiry CRM                    | Build persistent owner records; anonymous aliases, no required email                            |
| 2      | Supplier quotation history/comparison | Build private, dated model/unit/cost records                                                    |
| 3      | Customer quote builder                | Build reviewed printable/PDF output and manual copy; no email delivery                          |
| 4      | Owner follow-up inbox                 | Build dashboard tasks and manual reply drafts                                                   |
| 5      | Actual sale contribution report       | Build explicitly owner-reported outcomes and costs; no payment/order mutation                   |
| 6      | Reasons for lost enquiries            | Build structured reasons and summaries                                                          |
| 7      | Two-ring builder                      | **Defer**; retain existing two-measure enquiry                                                  |
| 8      | Supplier confirmation freshness       | Build dated confirmation/expiry indicators; never imply store stock                             |
| 9      | Price floor warnings                  | Build owner warnings from supported private costs; no automatic price changes                   |
| 10     | Better search intent/typos            | Improve bounded matching and helpful suggestions                                                |
| 11     | Search gaps dashboard                 | Build optional counts of known intent buckets, without storing raw searches or visitor identity |
| 12     | Verified shape/width filters          | Extend filters using verified attributes only                                                   |
| 13     | Product preview drawer                | Add public-data-only preview and enquiry/full-page links                                        |
| 14     | Campaign landing page editor          | Build owner-reviewed editorial pages referencing existing public destinations                   |
| 15     | Gallery controls                      | Improve real-image presentation/zoom without changing product geometry                          |
| 16     | Confirmed add-on quote options        | Build configurable options; remain unavailable until actual services/costs/terms are supplied   |
| 17     | Gift enquiry journey                  | Collect optional wishes; do not promise packaging or timing                                     |
| 18     | Delivery cost capture                 | Build dated private quote details; buyer wishes remain separate from confirmed terms            |
| 19     | After-sales case tracking             | Build private owner case/resolution records; actual policies still need Anton                   |
| 20     | Opt-in occasion reminders             | Build recorded consent, deletion and manual drafts; no automatic messages                       |

Persistent shared records require a generated migration and backup/restore coverage. Generate, commit and rehearse the migration only on disposable loopback databases containing `test` in their names. Do not apply it to production. Existing migrations 0023/0024 are already applied according to Anton and must not be repeated.

## Email later

Cloudflare is a reasonable proposed provider for the later email channel. [Email Routing](https://developers.cloudflare.com/email-service/get-started/route-emails/) forwards incoming addresses to verified destinations or Workers; a usable destination inbox is still needed. [Email Sending](https://developers.cloudflare.com/email-service/) is beta, supports REST from another host and requires Workers Paid for general outbound sending. Routing alone is not outbound delivery or a mailbox interface.

For now, defer mailbox/DNS setup, sending credentials, email notifications and email password recovery. Existing owner login does not need a working mailbox, but recovery remains manual as described in [admin access](ADMIN-SETUP.md). Do not expose an email-recovery button that cannot deliver.

When Anton confirms the Cloudflare account and destination inbox are ready, the next email batch can inventory actual plan/eligibility, routing destinations, verified sender, reply address, DNS conflicts and account limits without displaying credentials. Prepare the concrete changes before any separately authorised DNS/hosting action. Follow the repository integration layer for server-only secret storage and keep sending disabled until configuration and controlled delivery are verified.

Keep the WhatsApp/manual workflows operational if email is absent or fails. Later email can deliver a reviewed quote or notification after the business operation has committed, using an outbox with idempotency, retries and delivery/bounce status. It must never create a duplicate sale/order or mark payment. Secure admin recovery is a separate implementation, with expiring single-use hashed tokens and session revocation. Marketing email is a later consent-based decision.

Detailed existing research: [Cloudflare email investigation](CLAUDE-EMAIL-INVESTIGATION.md) and [email handoff](CLOUDFLARE-EMAIL-HANDOFF.md). Their earlier audit-only instructions are historical; Anton's current request authorises the non-email batch, not email/DNS changes now.

## Ten additional ideas

Anton authorised all ten on 7 October 2026. These are now part of the twenty-nine-item implementation scope. All work without email; actual supplier facts and sales outcomes must still be entered and confirmed by Anton.

1. **Quote revisions and comparison.** Preserve the previous customer quote, highlight changes in models/units/terms and record manual customer confirmation.
2. **Sample inspection register.** Track actual sample dimensions, fit, finish, defects and evidence before sourcing decisions.
3. **Supplier performance dashboard.** Compare observed quote response times, actual fulfilment and issue resolution without invented ratings.
4. **Demand by size and model.** Aggregate genuine measurement/size requests and completed sales to guide the assortment.
5. **Purchasing and replenishment planner.** Plan quantities from real demand and available capital, with owner-reviewed supplier order drafts; never place orders automatically.
6. **Customer quote comparison sheet.** Present two or three supported alternatives side by side with consistent units and confirmed differences.
7. **Audit history and undo for sales records.** Show who changed a record and recover a previous version without losing newer work.
8. **Private data export and deletion tools.** Export or remove an enquiry's connected records while preserving required business records under the owner's actual retention policy.
9. **Product-specific question editor.** Turn genuine repeated questions into owner-reviewed answers tied to exact model evidence.
10. **Mobile performance and accessibility checks.** Add repeatable local budgets for page weight, image loading and basic keyboard/DOM accessibility, with a written manual review of contrast, focus order and touch targets.

Return to the [owner operating guide](OWNER-OPERATING-GUIDE.md) for suppliers, administration, data locations, security and the complete document index.
