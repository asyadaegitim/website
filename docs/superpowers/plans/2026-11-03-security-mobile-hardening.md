# Site security, mobile accessibility and consultation transparency

**Date:** 2026-11-03  **Scope:** `asyadaegitim.com` / `educationinasia.com` only; no contracts, studio, DNS, CRM or payment changes.

## Measured baseline

- Both live consultation pages lacked explicit HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy response headers in inspected requests.
- A single Fast 4G, 4x CPU, 390×844 mobile Chrome lab navigation on the Turkish consultation page measured LCP **681 ms**, CLS **0.00**, observed INP **62 ms**. This is **not** real-user CrUX data or a representative field performance claim.
- Render-blocking Google Fonts CSS (~412 ms) and `site.css` (~215 ms) were present; these resources were intentionally **not** refactored in this safety release.
- Mobile language tap areas ~19–20 ×36 px; footer links ~22 px high; horizontal overflow absent.
- Visible data-transfer notice absent on the two FormSubmit contact forms.

## Implementation and boundaries

- A shared policy `workers/shared/security.mjs` is used by both Worker scripts and generates `dist/_headers` for Cloudflare Workers Static Assets. Worker-generated responses require explicit wrapping because `_headers` only modifies asset responses.
- Header policy: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` disables unused device permissions, `X-Frame-Options: DENY`, `Strict-Transport-Security: max-age=86400` **without includeSubDomains or preload**.
- CSP is **Content-Security-Policy-Report-Only**, including Google Fonts and the existing FormSubmit endpoint. An enforced CSP awaits violation monitoring and cross-browser/form evidence. No reporting endpoint was configured; reporting currently relies on browser console/DevTools, not centralized telemetry.
- TR and EN consultation forms display factual FormSubmit transfer notices and explicitly state that submitting does not constitute marketing opt-in. **Not a substitute for a reviewed KVKK/GDPR privacy and consent notice**. No new consent checkbox, lead automation or third-party destination was added.
- Mobile language links now have 32×44 px boxes; footer navigation 44px height; breadcrumbs 28px height, with 320px layout guard. The protected logo SVG is unchanged.

## Tests and safe publication

- TDD red gate: 24 tests, 19 passing, 5 new failing checks before implementation.
- Staging Cloudflare build: 24/24 passing; EN stage and GitHub PR preview provide isolated validation without production changes.
- EN staging (47/47 pages) and TR preview (47/47 pages): status, canonical, security headers, nonblocking CSP verified; 320px layout without overflow; FormSubmit success/failure **mocked**, no live email sent.
- Production release requires review/explicit approval, then EN first, TR second, with 47-page smoke on each. Previous live Workers versions: EN v4 and TR v20 for rollback.

## Open work

- A formal legal privacy notice for consultation data, vendor details, retention, lawful basis, contact rights, separate optional marketing opt-in, and link to published policy needs business/legal signoff before release.
- Profile render-blocking Google Fonts, inspect image dimensions/alt text and autocomplete warnings, test keyboard focus/contrast across more pages, implement accessible analytics/lead measurement without introducing trackers absent consent.
