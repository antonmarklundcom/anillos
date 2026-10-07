# Exact-model image pilot — 7 October 2026

Preparation only. No paid generation, media-library upload, image installation, supplier contact or production change was performed. The previous three campaign comparisons were fictional and are not inputs for this pilot. Public research images are held outside the repository for private review, not copied into `public/` or product media.

## First trial: AJ440, one viewpoint, two outputs

Exact reference: Asunción Joyas **440**, [supplier page](https://asuncionjoyas.com.py/producto/anillo-de-plata-solitario-4-puntas/), [published input](https://asuncionjoyas.com.py/wp-content/uploads/2023/05/0C8E941A-48C6-4CFC-82DF-62A968C060C4.webp). Direct page HTTP 200 on 7 October. Input inspected at 1122 × 1402: one ring, clear round central stone, four visible rounded prongs, a smooth narrow band and a fabric background. The side/basket geometry is not shown. These observations do not identify a gem, alloy, purity or physical stock. Even the source image's origin as a photograph of this exact physical SKU must be confirmed.

Input SHA-256: `a826cc6c5260035e033640cfa6a1b038f2ef12e0102ccf48be0f0c4072f3d4a5`.

**Readiness: blocked on permission and original physical-model confirmation.** Anton must have an owned/authorised original of reference 440 and permission specifically allowing AI edits and publication. For this first trial retain the documented viewpoint; no new side view or hand shot. A lateral/top/interior gallery needs additional originals.

Shared A/B prompt, used with that same authorised input:

> Edit only the background and lighting of the supplied reference image for supplier model 440. Preserve the exact visible ring: one ring, one round central clear stone, four rounded prongs in their original positions, the smooth band, width-to-stone ratio, silhouette, perspective, apparent colour and every visible surface detail. Keep the same camera angle. Remove the fabric background and place the existing ring on a warm ivory studio background with a restrained natural shadow. Keep the entire visible ring inside a square frame. Do not redraw or redesign the object. Do not invent a side view, basket underside, engraving, hallmark, additional stones, prongs or hidden geometry. No text, logo, certification, hand or accessories. If the reference does not contain enough information, keep that limitation rather than completing the design from imagination.

## Current tool quote and spending scope

Read-only model constraints and cost-only estimates were checked through Higgsfield on 7 October. No `medias` were sent (URL inputs would automatically upload them), no job submitted, no project or membership purchased. Quoted credits are not a cash price, budget approval or evidence of image fidelity.

| Output | Model ID | Exact settings | Quote per single output |
| --- | --- | --- | --- |
| AJ440 A | `gpt_image_2_5` | `variant: sunburst`, `quality: medium`, `resolution: 2k`, `aspect_ratio: 1:1`, `count: 1`, `use_unlim: false` | 1 credit, 1 exact |
| AJ440 B | `nano_banana_2_1` | `thinking_level: medium`, `resolution: 2k`, `aspect_ratio: 1:1`, `count: 1`, `use_unlim: false` | 2 credits, 2 exact |

**First decision: at most 3 credits for two single-image jobs**, after inputs/rights are ready and Anton approves that spending limit. Do not infer a multi-image price from `count: 2`: the estimator returned the same figure during preparation; use separate single-output calls and requote before execution. No automatic retries or upscales. Choosing these settings does not claim one model is better; the A/B will test fidelity.

## Second reference: AJ19, held until the input improves

Asunción Joyas **19**, [supplier page](https://asuncionjoyas.com.py/producto/anillo-alianza-de-plata-liso-media-cana/), [published input](https://asuncionjoyas.com.py/wp-content/uploads/2022/05/AEA45987-6F27-450B-9B9C-34E931B8A27A-640x800.jpeg). Direct HTTP 200 on 7 October. Input 640 × 800 shows several rings on a support; the backs are occluded. A photo with two foreground bands does not establish a pair as the unit sold. The supplier describes a 5 mm media-caña band; the image alone cannot verify that width or a 925 alloy.

Input SHA-256: `10285272c953f77be57c6c3500d32377f0e02cbc066226d854b61e33daed43da`.

Do not ask an image model to isolate a complete ring from this image: it would need to invent hidden geometry. First obtain an authorised, isolated whole-ring original for SKU 19. Then the same A/B settings would be an additional **3 credits**, requoted at execution; total ceiling for both references would be **6 credits / four outputs**, only after a separate approval. This second trial is not part of an approved spend.

Prompt once that replacement input exists:

> Edit only background and lighting of the supplied complete isolated reference for supplier model 19. Preserve exactly one visible media-caña band, its documented rounded outer profile, inner profile, section, edge shape, proportions, apparent colour and reflections. Keep the input viewpoint. Use warm ivory background and a restrained natural shadow. Do not change the band width, flatten its section, add stones, engravings or hallmarks, duplicate it into a pair, or invent hidden geometry. No text, hands or accessories.

## Acceptance gate for every output

1. Put original and output side by side, same scale; inspect both full frame and 100% crops.
2. AJ440: exactly one central stone and four prongs; same positions, visible facets, band continuity, stone/band proportions and perspective. Reject any invented basket, extra stones, altered prong count or width.
3. AJ19: same rounded section, edge and inner profile, band proportions and one-ring identity. Reject a flat band, changed thickness, duplicate or completed occlusion.
4. Check colour, micro-detail, edge halos, impossible reflections and deformation on desktop and 390 px mobile. A prettier but different ring fails.
5. Record input hash, exact job/settings/cost, permission evidence, reviewer/date and pass/fail. A retry requires a new budget decision. Compare model results by preservation, then presentation.
6. Even a faithful AI edit remains `illustrative` in existing image provenance and is disclosed as an AI/illustrative image, never as a real product photograph. Do not mark it `supplier-authorized`/`owned-photo`, or fill `verifiedAt`, material, stone or dimensions from an AI output. Original authorised photos need their own physical-model verification.
7. Publication is a separate review: accurate real-model description, public image rights, explicit unknowns, unpriced enquiry/showcase mode. Keep supplier costs/references private. Concepts remain protected `concepto-*`, noindex and unpurchasable.

Until these gates pass, use the existing labelled placeholders. No new database schema, migration or environment variable is needed for this pilot; the existing image provenance/admin upload fields already support it.
