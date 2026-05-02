# Cloudflare Deployment Plan

Phase 1 targets a static Astro deploy on Cloudflare Pages.

## Platform decisions

- Hosting: Cloudflare Pages
- Build command: `yarn install && yarn build`
- Output directory: `dist`
- Production domain: `rowlandekemezie.com`
- Production analytics: Cloudflare Web Analytics
- Preview model: Git-connected preview deployments for the migration branch and PRs

## Repository wiring

- Until the Astro migration is complete, keep the long-lived migration work on `feat/astro-migration-foundation`.
- Keep `develop` untouched as the current integration branch.
- Attach the Pages project to this repository.
- Use preview deployments from `feat/astro-migration-foundation` while parity work continues.
- When the migration is complete, merge the migration branch into `develop` and switch the Pages production branch to `develop`.

## Cloudflare Pages settings

- Framework preset: `Astro`
- Build command: `yarn install && yarn build`
- Build output directory: `dist`
- Root directory: `/`
- Node.js version: `22`

The repo now includes `wrangler.jsonc` so direct `wrangler pages deploy` commands use the same build output contract.

## Headers and caching

The static response policy is defined in `public/_headers`.

- Security headers:
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - restrictive `Permissions-Policy`
- Cache policy:
  - immutable caching for `/logos/*`
  - short-lived caching for XML feeds and `robots.txt`

If a future phase adds a strict CSP, it must account for:

- Disqus embed and asset domains
- Cloudflare Web Analytics beacon domains
- remote post cover images

## Analytics

Phase 1 replaces Universal Analytics with Cloudflare Web Analytics.

- If the site is proxied through Cloudflare, enable Web Analytics auto-injection in the dashboard.
- If auto-injection is unavailable, add the manual beacon snippet in a later change once the site ID is issued.
- Do not reintroduce GA Universal Analytics.

## Cutover checklist

1. Keep the existing site live while the migration branch is in preview.
2. Verify route parity for `/`, `/posts/:slug/`, `/page/:number/`, `/pages/about/`, `/tags/*`, and `/categories/*`.
3. Confirm RSS, sitemap, `robots.txt`, image assets, and comment embeds in preview.
4. Point the production domain at the Pages project only after parity sign-off.
5. Enable Cloudflare Web Analytics after the domain is proxied.

## Rollback

If cutover fails:

1. Revert DNS or Pages production branch back to the pre-migration origin.
2. Leave the migration branch deployed only as preview.
3. Fix the regression on `feat/astro-migration-foundation` and re-run verification before another cutover.
