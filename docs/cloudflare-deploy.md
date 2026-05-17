# Cloudflare Deployment Plan

Phase 1 targets a static Astro deploy on Cloudflare Pages.

## Platform decisions

- Hosting: Cloudflare Pages
- Build command: `yarn install && yarn build`
- Output directory: `dist`
- Production domain: `rowlandekemezie.com`
- Production analytics: Cloudflare Web Analytics
- Preview model: Git-connected preview deployments for the migration branch, `feat/*`, `concept/*`, and PRs

## Current production state

As verified on `2026-05-03`, the live site is still served by Netlify.

- Response headers show `server: Netlify`
- Edge cache headers show `cache-status: "Netlify Edge"`
- Current apex DNS resolves to:
  - `52.52.192.191`
  - `13.52.188.95`
- Current `www` DNS resolves to:
  - `rowlandbits.netlify.com.`

## Repository wiring

- Until the Astro migration is complete, keep the long-lived migration work on `feat/astro-migration-foundation`.
- Keep `develop` untouched as the current integration branch.
- Attach the Pages project to this repository.
- Use preview deployments from `feat/astro-migration-foundation`, task branches under `feat/*`, and exploratory branches under `concept/*` while parity work continues.
- When the migration is complete, merge the migration branch into `develop` and switch the Pages production branch to `develop`.

## Cloudflare Pages settings

- Framework preset: `Astro`
- Build command: `yarn install && yarn build`
- Build output directory: `dist`
- Root directory: `/`
- Node.js version: `22`

The repo now includes `wrangler.jsonc` so direct `wrangler pages deploy` commands use the same build output contract.
The repo also includes `.nvmrc` pinned to `22` so local, CI, and Pages builds resolve the same Node major version by default.

## Headers and caching

The static response policy is defined in `public/_headers`.

- Security headers:
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - restrictive `Permissions-Policy`
- Cache policy:
  - HTML routes use `Cache-Control: public, max-age=0, must-revalidate`
  - immutable caching for `/logos/*`
  - short-lived caching for XML feeds and `robots.txt`

If a future phase adds a strict CSP, it must account for:

- Disqus embed and asset domains
- Cloudflare Web Analytics beacon domains
- remote post cover images

If Cloudflare Web Analytics auto-injection is enabled, do not add `Cache-Control: no-transform` to HTML responses. Cloudflare's automatic script injection will not run through `no-transform`.

## Analytics

Phase 1 replaces Universal Analytics with Cloudflare Web Analytics.

- If the site is proxied through Cloudflare, enable Web Analytics auto-injection in the dashboard.
- If auto-injection is unavailable, set `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN` to enable the manual beacon snippet already supported by the Astro layout.
- Set `PUBLIC_KIT_FORM_UID` and `PUBLIC_KIT_EMBED_SRC` to enable the subscribe form against your Kit inline form.
- Take those values from Kit's inline JavaScript embed snippet:
  - `PUBLIC_KIT_FORM_UID` comes from the script tag's `data-uid` attribute
  - `PUBLIC_KIT_EMBED_SRC` comes from the script tag's `src` attribute
- If the token is unset, the rebuilt site ships without analytics rather than carrying forward Universal Analytics.
- Do not reintroduce GA Universal Analytics.

## Cutover checklist

1. Keep the existing site live while the migration branch is in preview.
2. Verify route parity for `/`, `/posts/:slug/`, `/page/:number/`, `/pages/about/`, `/tags/*`, and `/categories/*`.
3. Confirm RSS, sitemap, `robots.txt`, image assets, comment embeds, and analytics behavior in preview.
4. Confirm the Cloudflare Pages project is configured for the custom domain and TLS is active.
5. Change DNS only after parity sign-off:
   - move the apex from the current Netlify IPs to the Cloudflare-managed target
   - move `www` away from `rowlandbits.netlify.com.` to the Cloudflare-managed target
6. Validate the production domain after DNS propagation:
   - home, post, page, tag, and category routes
   - feed and sitemap endpoints
   - comment embed load
   - expected response-header policy from `_headers`
7. Enable Cloudflare Web Analytics after the domain is proxied, or confirm the manual beacon token is set.

## Rollback

If cutover fails:

1. Revert the apex DNS back to the Netlify IPs:
   - `52.52.192.191`
   - `13.52.188.95`
2. Revert the `www` record back to `rowlandbits.netlify.com.`
3. If the failure is branch-specific rather than DNS-specific, move the Pages production branch away from the migration target.
4. Leave the migration branch deployed only as preview.
5. Fix the regression on `feat/astro-migration-foundation` and re-run verification before another cutover.
