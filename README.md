# Rowland I. Ekemezie

Personal site and writing archive built with Astro and deployed to Cloudflare Pages.

## Stack

- Astro
- TypeScript
- Markdown/MDX content collections
- Cloudflare Pages

## Local development

```sh
pnpm install
pnpm dev
```

Primary scripts:

```sh
pnpm build
pnpm preview
pnpm astro:check
pnpm verify:all
pnpm lighthouse:preview
```

## Project structure

- `src/pages/`: routes
- `src/layouts/`: site layout
- `src/components/`: Astro components
- `src/lib/`: content and site helpers
- `content/`: authored pages and posts
- `public/`: static assets shipped as-is
- `scripts/`: verification and audit scripts
- `docs/`: migration and deployment notes

## Local secrets

The newsletter endpoint in `public/_worker.js` needs `KIT_API_KEY` and `KIT_FORM_ID`. Put them in
`.dev.vars` for local Wrangler runs and in the Cloudflare Pages dashboard for deployments. Never commit
them; `.env*` and `.dev.vars` are git-ignored.

## Deployment

Cloudflare Pages builds the site from `dist` using:

```sh
pnpm install --frozen-lockfile && pnpm build
```

Preview deployments are enabled for `feat/*`, `concept/*`, and pull requests.

## Verification

Before merging branch work, run:

```sh
pnpm verify:all
```

For preview performance checks:

```sh
pnpm lighthouse:preview
```
