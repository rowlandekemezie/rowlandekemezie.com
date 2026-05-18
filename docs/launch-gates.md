# Launch Gates

The migration branch is ready to merge into `develop` only when all of these are true.

## Automated gates

- `yarn install` succeeds without `--ignore-scripts`
- `yarn verify:all` passes
- GitHub Actions `Astro CI` passes on the latest branch head

## Build-artifact thresholds

These thresholds are enforced by `yarn verify:launch-gates` against representative built routes.

- `/` raw HTML must stay at or below `18 KB`
- `/pages/about/` raw HTML must stay at or below `12 KB`
- representative post pages must stay at or below `35 KB` raw HTML
- representative post pages must emit canonical, Open Graph, Twitter image, and `BlogPosting` metadata

## Route and content parity

- Home feed renders at `/`
- Archive pagination renders at `/page/:number/`
- Posts render at `/posts/:slug/`
- About page renders at `/pages/about/`
- Tag and category indexes and detail pages render
- RSS, sitemap, and `robots.txt` are present and correct

## SEO and metadata

- Post pages emit canonical URLs under `/posts/:slug/`
- Post pages emit `og:type=article`
- Post pages emit `BlogPosting` JSON-LD
- Post pages emit social image metadata that resolves to generated site assets
- Sitemap includes home, posts, taxonomies, pagination, and `/pages/about/`
- The build output contains no Universal Analytics identifiers or Google Analytics embed assets

## Comments

- Generated post pages include the Disqus thread container
- Generated post pages emit the expected `page.url` and `page.identifier`
- One known legacy post with comments is checked manually in a Cloudflare Pages preview

## Cloudflare readiness

- `wrangler whoami` succeeds for the target account
- Cloudflare Pages project is configured with the settings in `docs/cloudflare-deploy.md`
- Preview deployment from `feat/astro-migration-foundation` renders correctly
- Cloudflare Web Analytics is enabled through dashboard auto-injection or `PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`, or is explicitly deferred pending domain proxy cutover

## Cutover approval

- The migration branch has been reviewed
- Remaining open issues are either resolved or explicitly deferred
- Rollback steps in `docs/cloudflare-deploy.md` are still valid
