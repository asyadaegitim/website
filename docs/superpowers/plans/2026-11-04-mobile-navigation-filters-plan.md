# Mobile Navigation and University Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate mobile country-page navigation from submenu toggles and make bilingual university filters shareable, reversible and accessible without touching consultation forms.

**Architecture:** Enhance the existing static HTML with a small shared `dist/site.js` behavior layer, styled by `dist/site.css`. Preserve TR-to-EN static generation, English Worker routing, shared 47-pair canonical mapping and existing form submission.

**Tech Stack:** Vanilla ES JavaScript, CSS, Node `node:test`/VM harness, Cloudflare Workers Static Assets, GitHub PR.

**Spec:** `docs/superpowers/specs/2026-11-04-mobile-navigation-filters-design.md`

## Global Constraints
- Keep all 94 existing pages, canonical/hreflang, brand logos, FormSubmit, security headers, CRM and pricing untouched.
- Mobile breakpoint is currently 980px, desktop dropdown uses hover/focus.
- EN public URL country/field values are translated from native TR option values.
- No dependencies, cookies, analytics, API calls or new data storage.
- Feature branch only until test and preview audit.

## Review Focus
1. Legacy HTML has anchors with `aria-expanded` but no submenu button: new UI must not stop links from navigating.
2. EN Worker injects runtime JS rewrites: avoid relying on brittle string replacement for newly implemented filter behavior.
3. Browser back after two filter selections must render the previous state, not merely rewrite the URL.
4. Empty results and free search may coexist with selected filters; clearing chips must preserve other selections.
5. Keyboard Escape, mobile 320px width and desk 1024px hover must not regress.

---

### Task 1: Accessible mobile menu

**Files:** Modify `dist/site.js`, `dist/site.css`; create `tests/navigation/mobile-nav.test.mjs`.

**Interfaces:** `setupCountryNavigation(menu,nav)` sets up `.nav-expand` buttons, toggles `.nav-item.open`, and keeps anchors navigable.

- [ ] Write RED tests proving submenu toggles are inserted with controls/labels while anchors remain unmodified; one-open-at-a-time, close/escape behaviors.
- [ ] Run `node --test tests/navigation/mobile-nav.test.mjs` (expect failures).
- [ ] Implement the smallest menu enhancement, with mobile CSS.
- [ ] Re-run same tests (expect green) and commit.

### Task 2: Shareable university filters and reset UI

**Files:** Modify `dist/site.js`, `dist/site.css`; create `tests/navigation/university-filters.test.mjs`.

**Interfaces:** `initUniversityFilters(search,country,theme)` reads canonical URL state, filters rows, renders chips, updates history only for country/field, handles `popstate`.

- [ ] Write RED behavior tests for native TR and EN URL mapping, URL history, popstate, chips, zero-result state and search privacy.
- [ ] Run focused tests (expect failures), implement and re-run (expect green).
- [ ] Run all `npm test` (expect full suite passing) and commit.

### Task 3: Preview, regression, release gate

**Files:** Modify `package.json` (test glob); `docs/superpowers/plans/2026-11-04-mobile-navigation-filters-plan.md` for outcomes; create PR.

- [ ] Include new tests in default build gate and run Cloudflare GitHub preview.
- [ ] Verify TR and EN staging at 320, 390, 768, 1024 px and filter queries/history/language switch with actual browser.
- [ ] Verify 47 TR + 47 EN canonical pages, no index leaks from staging, 404, security headers, preserved form and logo.
- [ ] Prepare PR with failure modes, before/after and rollback instructions. Leave production builds on `main` pending user release approval.
