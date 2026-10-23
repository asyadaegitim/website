# Foundation checkpoint — 2026-10-23

Production: https://asyadaegitim.com/ (Cloudflare Worker `website`). **Production was not changed.**

Development branch: `develop/site-foundation-20261023`.

## Completed
- Created separate development branch from `main`.
- Added `docs/SITE_CONTRACT.md` specifying the exact slogan, locked logo, editorial design quality, country order, data sourcing and no-regression rules.
- Added dependency-free `scripts/audit_site.py` and GitHub Actions preflight for 48 static HTML pages, local links and assets.
- Preflight detected a pre-existing broken link to `/assets/flags/LICENSE.txt`; added the official upstream MIT license from `lipis/flag-icons` to the branch without changing page design.
- GitHub Actions run `39946640184`: **success**.
- Added `preview/worker.js` as a read-only Worker proxy for the public development branch with noindex headers. This preview is a stopgap and must not be represented as a production build.

## Pending — infrastructure
- Cloudflare account resolves production Worker and custom domains, but repository has only a static export from 2026-10-17; original ChatGPT Sites Python source and structured university data are absent.
- Cloudflare Workers Build triggers are not present for `website`. Do not assume GitHub pushes deploy automatically.
- Attempt to create **separate** `asyadaegitim-preview` Worker using the current Cloudflare connection failed with HTTP 403: missing OAuth permission `workers-scripts.write` / `workers-scripts.edit` / `workers-scripts.admin`.
- Preview Worker was **not** created. Do not claim preview URL is live.
- Obtain appropriate connection scope (or publish through an explicitly approved alternative) before setting up preview.
- Verify actual production vs snapshot visually on desktop/mobile before content work.

## Next stage, only after real preview and parity checks
- Pilot homepage update: make **Üniversite için başka bir dünya var.** the main hero slogan.
- Preserve existing aesthetic; selectively increase information depth, not homepage clutter.
- Then pilot China country page and fact-checked scholarship/fees content.

## Release guard
**Do not merge to main or modify the production Worker until visual review and explicit approval.**
