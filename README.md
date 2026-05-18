# Rowland I. Ekemezie

Personal site and writing archive built with Astro and deployed to Cloudflare Pages.

## Stack

- Astro
- TypeScript
- Markdown/MDX content collections
- Cloudflare Pages
- Disqus comments

## Local development

```sh
yarn install
yarn dev
```

Primary scripts:

```sh
yarn build
yarn preview
yarn astro:check
yarn verify:all
yarn lighthouse:preview
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

## Deployment

Cloudflare Pages builds the site from `dist` using:

```sh
yarn install && yarn build
```

Preview deployments are enabled for `feat/*`, `concept/*`, and pull requests.

## Verification

Before merging branch work, run:

```sh
yarn verify:all
```

For preview performance checks:

```sh
yarn lighthouse:preview
```
