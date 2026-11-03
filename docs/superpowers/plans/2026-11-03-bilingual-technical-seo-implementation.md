# Two-Domain Technical SEO and URL Repair — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Make every Turkish and English study-abroad page indexable at its proper domain, with reciprocal language alternatives, reliable language navigation, clean sitemaps, safe legacy redirects, and a reproducible deployment path.

**Architecture:** Retain the current static HTML source and its generated /en/ content, but stop fetching that content through the *public* Turkish domain at runtime. Deploy the English Worker with a local Cloudflare Workers static-assets binding, while using one deterministic route mapper in the repository to generate both languages' canonical metadata and sitemap documents. After English production no longer depends on public /en/, activate narrowly scoped Turkish legacy redirects and confirm parity with the prior design.

**Tech Stack:** Existing static HTML/CSS/JS, Node.js >=20 built-in node:test and fs, existing scripts/generate-en.mjs, Cloudflare Workers + HTMLRewriter + Static Assets, Wrangler >=4.20, GitHub PR, GSC verification after release.

**Spec:** docs/superpowers/specs/2026-11-03-bilingual-site-foundation-design.md

## Global Constraints

- Domains: TR https://asyadaegitim.com and EN https://educationinasia.com; do not use /en/ as a canonical English URL.
- Preserve the existing Turkish/English visual identity, approved English SVG wordmark, layout, menus, and FormSubmit behavior.
- Never modify unrelated Cloudflare Workers: asya-imza-*; sozlesme.asyadaegitim.com; studio.asyadaegitim.com; brandstudio-*.
- Site source is in asyadaegitim/website, default branch main; implementation uses a distinct feature branch, not this documentation-only branch; no production merge, deploy, DNS change, or paid feature without explicit separate approval.
- The 2026-11-03 existing English edge Worker is sourced at workers/educationinasia-en/worker.js and currently fetches upstream /en/ assets from https://www.asyadaegitim.com. Do NOT enable /en/ redirects on the Turkish domain before English production is self-contained.
- Build commands and tests must be deterministic, idempotent, dependency-light, and safe on a branch; never use real applicant details or credentials.
- Preserve genuine 404 responses; do not funnel unknown paths to home.
- An EN sitemap must NOT be derived by parsing live Turkish sitemap entries after TR sitemap becomes TR-only.
- Phase 1 is URL/technical SEO only. Security headers, substantive content, UX redesign, FormSubmit-to-HubSpot migration, and marketing consent are separate approved subsequent plans.

## Review Focus

1. **An old English-country URL with an old Turkish country query** must resolve to the *corresponding* English country and English query value, not to home; pin in Task 5.
2. **A public /en/ page must not be redirected until EN Worker has no network dependency on the Turkish public domain**, including CSS, JS and logo; pin in Task 4 integration test and Task 6 rollout gate.
3. **A missing university slug** must remain HTTP 404 on both hosts and must not receive a self-canonical or sitemap entry; pin in Task 4.
4. **Copying ?ulke=cin&alan=... during a TR→EN switch** must map to ?country=china&field=..., while irrelevant parameters are discarded; pin in Task 3.
5. **Repeated generation** must not duplicate canonical, language tags, or sitemap records, even if input has previous generated sections; pin in Task 2.

---

## File Map and Interfaces

- Create scripts/seo/routes.mjs — pure trToEnPath(path), enToTrPath(path), translateQuery(params,direction), listRoutePairs(distRoot); canonical host constants. Never infer unknown route validity from a substring.
- Modify scripts/generate-en.mjs — use routes.mjs as the source of canonical metadata and both sitemap outputs; continue generating dist/en/... as English local assets.
- Modify dist/index.html and other dist/**/index.html by the generator — generated head metadata and language switcher targets. Never hand-edit every generated page.
- Modify dist/site.js — language switch and query mapping without copying incompatible query names; keep current search/filter and form behavior.
- Generate dist/sitemap.xml (only TR canonical loc) and dist/en-sitemap.xml (only EN canonical loc); retain dist/robots.txt pointing at TR canonical sitemap.
- Modify workers/educationinasia-en/worker.js — consume env.ASSETS instead of fetching Turkish public website; serve EN sitemap from bundled dist/en-sitemap.xml; retain URL rewriting, brand SVG, /site.js adjustments as needed.
- Create wrangler.english.jsonc and wrangler.english.stage.jsonc — separate prod/stage configs, matching asset binding and expected Worker names.
- Create workers/website/worker.js; modify wrangler.jsonc minimally — add scoped Worker-first handling of /en and /en/* only; for other paths use static asset routing, avoiding an extra Worker invocation for every normal static-asset hit.
- Create tests/seo/routes.test.mjs, tests/seo/generation.test.mjs, tests/seo/navigation.test.mjs, tests/seo/worker.test.mjs and tests/seo/live-smoke.mjs.
- Update README.md with source-of-truth, both deployment commands, staging and rollback procedures.

## Task 1 — Baseline and pure route contract

**Files:** Create scripts/seo/routes.mjs; tests/seo/routes.test.mjs; tests/seo/fixtures/route-cases.json.

**Interfaces:** trToEnPath(trPath:string):string|null; enToTrPath(enPath:string):string|null; translateQuery(params:URLSearchParams,direction:'tr-en'|'en-tr'):URLSearchParams; listRoutePairs(distRoot:string):Array<{trPath:string,enPath:string}>.

- [ ] **Step 1: Write failing Node tests** from current 47 source routes. Assert '/' ↔ '/', '/okullar/' ↔ '/universities/', '/on-gorusme/' ↔ '/free-consultation/', '/programlar/' ↔ '/programs/', '/ulkeler/cin/dil-programlari/' ↔ '/destinations/china/language-programs/', '/ulkeler/guney-kore/' ↔ '/destinations/south-korea/', and university slugs ↔ '/universities/<slug>/'. Check exactly one EN counterpart for every existing TR index; reject two TR routes mapping to one EN route and unknown paths. Query cases include ulke=cin→country=china and alan→field; known UTM names may be retained but never arbitrary or malformed parameters.
- [ ] **Step 2: Run** node --test tests/seo/routes.test.mjs; expect failure because the new interface does not exist.
- [ ] **Step 3: Implement** only the exact functions above using existing source folder enumeration and the conversion tables already in workers/educationinasia-en/worker.js; do not maintain two divergent translation tables.
- [ ] **Step 4: Run** node --test tests/seo/routes.test.mjs; expect all tests green, including unknown routes and duplicate detection.
- [ ] **Step 5: Commit** source, fixtures and tests as feat(seo): define canonical route contract.

## Task 2 — Deterministic canonical, reciprocal hreflang and two clean sitemaps

**Files:** Modify scripts/generate-en.mjs and generated dist/**/index.html; generate dist/sitemap.xml and dist/en-sitemap.xml; tests/seo/generation.test.mjs.

**Interfaces:** Consume listRoutePairs, trToEnPath, translateQuery; produce reproducible HTML and 2 sitemap XML files.

- [ ] **Step 1: Write failing generation tests** asserting 47 TR and 47 EN canonical records from current source inventory (if inventory changes, count derives from listRoutePairs and an approved diff). TR href is absolute asyadaegitim.com, EN absolute educationinasia.com. Each language uses self canonical, html lang and exactly 2 reciprocal alternates. No /en/ URLs in sitemap loc or hreflang. No x-default unless a genuine default/switch page is introduced. Require meaningful page-specific title and description, and correctly localized og:title, og:description, og:url, og:type and twitter summary tags; no fabricated ratings/scholarships. Re-running generator produces byte-identical output.
- [ ] **Step 2: Run** node --test tests/seo/generation.test.mjs; expect failure against old sitemap and old /en/ canonical references.
- [ ] **Step 3: Modify** generation in scripts/generate-en.mjs, using route pairs and generated HEAD markers for idempotent rewrite. Keep dist/en/index.html and deep English files as a private deployable content source, not public canonical pages. Keep Turkish sitemap at dist/sitemap.xml, English sitemap at dist/en-sitemap.xml.
- [ ] **Step 4: Run** node scripts/generate-en.mjs && node --test tests/seo/generation.test.mjs and run the generator a second time to prove stable output.
- [ ] **Step 5: Commit** scripts, tests and generated assets as fix(seo): synchronize bilingual metadata and sitemaps.

## Task 3 — Language buttons, filtering and non-disruptive navigation

**Files:** Modify dist/site.js and (only where necessary) workers/educationinasia-en/worker.js patchSiteJS; tests/seo/navigation.test.mjs.

**Interfaces:** Consume canonical route mapping and query values; produce correct absolute EN/TR hrefs while preserving valid filters.

- [ ] **Step 1: Write failing navigation tests:** TR homepage EN button → educationinasia.com/; TR /ulkeler/cin/ EN → /destinations/china/; EN university detail TR → corresponding /universiteler/<slug>/. Convert the country and field filters in both directions; remove invalid country/field values rather than blindly copying. Validate that internal EN links, footer navigation and consultation CTAs stay on EN domain; outbound cinegitim.com unaffected; menu, search and FormSubmit submit flow unchanged.
- [ ] **Step 2: Run** node --test tests/seo/navigation.test.mjs; expect failure for current location.search pass-through and old absolute links.
- [ ] **Step 3: Implement** a shared small query mapper in dist/site.js; align the EN Worker's site.js patch with the new source without fragile contradictory search-replace. Update the generator's language switch elements where needed.
- [ ] **Step 4: Run** node --test tests/seo/navigation.test.mjs plus generation tests; then perform Chrome manual mobile and keyboard inspection in staging.
- [ ] **Step 5: Commit** navigation changes and tests as fix(i18n): preserve language and filters across domains.

## Task 4 — Make the EN Worker independent of public /en/ routes

**Files:** Modify workers/educationinasia-en/worker.js; create wrangler.english.jsonc and wrangler.english.stage.jsonc; tests/seo/worker.test.mjs.

**Interfaces:** Worker fetch(request,env) uses env.ASSETS.fetch(new Request(assetURL,request)) for assets from ./dist; HTMLRewriter preserves English layout and approved SVG logo; /sitemap.xml returns dist/en-sitemap.xml. Do not use fetch('https://www.asyadaegitim.com/...') at runtime.

- [ ] **Step 1: Write failing tests** for GET/HEAD of /, /destinations/china/, /universities/ and /free-consultation/ (200), bogus university (404), /sitemap.xml (EN-only loc), /robots.txt (EN sitemap), /assets/education-in-asia-logo.svg (unchanged approved canonical artwork), /site.js, and no Turkish public-domain runtime fetch. Verify www host redirect and old English /ulkeler/cin/ redirect with correct location.
- [ ] **Step 2: Run** node --test tests/seo/worker.test.mjs; expect worker currently depends on cross-domain fetch.
- [ ] **Step 3: Move** the classic worker entrypoint to a module-compatible fetch handler if required for env.ASSETS; change only the asset acquisition layer and sitemap source, retaining HTMLRewriter and brand behavior. Use assets.directory='./dist', binding='ASSETS', and run_worker_first=true for EN because rewriting applies to EN HTML and route handling. Stage config name educationinasia-en-stage, production config name educationinasia-en; never deploy prod during implementation.
- [ ] **Step 4: Run** node --test tests/seo/worker.test.mjs; npx wrangler dev --config wrangler.english.stage.jsonc with a local smoke test. Confirm no public Turkish fetches from EN runtime in DevTools network and a functional EN form.
- [ ] **Step 5: Commit** the self-contained English Worker + configs/tests as fix(en): package English assets with Worker.

## Task 5 — Narrow legacy URL redirects on the Turkish site

**Files:** Create workers/website/worker.js; modify wrangler.jsonc; tests/seo/routes.test.mjs and tests/seo/worker.test.mjs.

**Interfaces:** Only /en and /en/* use Worker-first code (assets.run_worker_first=['/en','/en/*']); known old English paths 301 to mapped absolute English canonical URL, never to generic home. Unmatched /en slugs 404. All normal TR static assets retain existing serving/caching/404 behavior.

- [ ] **Step 1: Write failing redirect tests** for old /en/ root, country + nested program, university detail, /en/okullar/?ulke=cin, /en/programlar/?alan=..., and an invalid /en/bogus/; www vs apex and encoded slugs must not produce an open redirect. Verify native TR routes and non-EN assets do not execute Worker-first code. Confirm unknown route 404.
- [ ] **Step 2: Run** node --test tests/seo/routes.test.mjs tests/seo/worker.test.mjs; expect legacy paths not to redirect.
- [ ] **Step 3: Implement** only the narrow route handling. In wrangler.jsonc retain assets.directory='./dist', html_handling='auto-trailing-slash', not_found_handling='none', add main and binding, set run_worker_first ['/en','/en/*'] (Cloudflare docs confirm route pattern arrays). Gate actual activation: this PR must NOT reach Turkish production until Task 4 EN production self-contained deployment is verified.
- [ ] **Step 4: Run** the tests; use npx wrangler dev --config wrangler.jsonc for representative route checks without touching production.
- [ ] **Step 5: Commit** redirects + tests as fix(seo): retire public old English paths safely.

## Task 6 — End-to-end staging, progressive rollout and rollback runbook

**Files:** Create tests/seo/live-smoke.mjs; update README.md; include results in PR description (not secrets or personal data).

**Interfaces:** TEST_BASE_TR and TEST_BASE_EN environment variables identify staged origins; live-smoke validates status, response headers, canonical/hreflang, sitemap consistency and sampled links, and exits nonzero for regressions.

- [ ] **Step 1: Write smoke tests** for all 47 paired URLs (or current manifest count), every sitemap loc (direct 200, self-canonical, indexable), 301 target check, bogus slug 404, stage header status, language switch and form markup; include no design/branding regressions and no 2nd-hop redirect loops. Run first against current production snapshots to establish expected known failures.
- [ ] **Step 2: Start local staging instances** with Wrangler and test TR and EN separately, followed by integrated test using explicitly designated stage hosts. Do not change production worker bindings, zone rules or DNS.
- [ ] **Step 3: Run** node --test tests/seo/*.test.mjs and node tests/seo/live-smoke.mjs --tr=<stage-TR> --en=<stage-EN>; expect all gates green. Inspect EN logo, TR header/menu, a translated country and university page, browser/mobile controls, both consultation forms with test-only non-PII and no actual unsolicited submission.
- [ ] **Step 4: Record rollback**: capture current website Worker version 18 (as observed 2026-11-03, recheck at release) and educationinasia-en version 3 (recheck), previous wrangler configs and zone bindings; failure procedure restores preceding version, then re-runs both smoke tests. No blank/partial sitemap release.
- [ ] **Step 5: Release ordering (separate user-approved action, never automatic here):** deploy and verify EN self-contained production **first**; only when public /en network dependencies are zero deploy TR canonical/sitemap/redirect changes **second**. Re-run all-host tests. Confirm GSC ownership and submit each host's proper sitemap; log indexability and indexing results without claiming immediate Google reindexing.
- [ ] **Step 6: Commit** testing/runbook updates as test(seo): document staged bilingual release and rollback.

## Self-review / done criteria

- All 6 tasks remain within URL/technical SEO scope; security/form/UX/content changes have separate follow-on designs.
- Tests cover absent routes, future paths, unknown params, cross-language filters, duplicate generation, no upstream dependency and accidental serving of English pages from Turkish index.
- Regenerated page inventory has no dead targets, no canonical redirect targets, no broken reciprocal hreflang.
- Cross-domain assets and logo preserve the actual approved brand.
- No production deployment or GSC submission is implied by implementation commits; both require checks and explicit authorization.
- Changes committed to isolated feature branch with PR and reviewer gate; user can inspect exact scope before production deployment.
