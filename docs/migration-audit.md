## Astro Migration Audit

This document captures the current Gatsby site behavior that phase 1 of the Astro migration must preserve or intentionally replace.

### Snapshot

- Repository: `rowlandekemezie/rowlandekemezie.com`
- Current integration branch for migration work: `feat/astro-migration-foundation`
- Remote HEAD at audit time: `b7057e2e68ceeac1cb58797f5c2f3478a6246709`
- Current stack: Gatsby 2, React 16, GraphQL, SCSS, Netlify-oriented deploy config
- Current deployment hints:
  - `netlify.toml` publishes `public/` and builds with `yarn build`
  - `package.json` also contains a `gh-pages` deploy path
- Current editing model:
  - Git-based content changes
  - Netlify CMS config present in `static/admin/config.yml`, but phase 1 migration assumes Git-only editing

### Public Route Families

#### Core routes

- `/`
  - post feed root
- `/posts/:slug/`
  - post detail pages based on frontmatter `slug` or title-derived fallback slug
- `/page/:number/`
  - paginated archive pages, with `/` as the first page
- `/pages/about/`
  - standalone about page
- `/tags/`
  - tag list
- `/tags/:slug/`
  - tag detail pages
- `/categories/`
  - category list
- `/categories/:slug/`
  - category detail pages
- `/series/`
  - series list
- `/series/:slug/`
  - ordered series detail pages
- `/404.html`
  - custom 404 page

#### Machine-readable routes

- `/rss.xml`
- `/sitemap.xml`

### Content Model

#### Posts

- Source directory: `content/**/index.md`
- Current post count in repo: `8`
- Common frontmatter fields:
  - `title`
  - `date`
- `category`
- `tags`
- optional `series`
- `cover`
  - optional `slug`
- Current slug behavior:
  - explicit `frontmatter.slug` is kebab-cased when present
  - fallback is a kebab-cased `frontmatter.title`
- Post assets:
  - current sample content mostly uses remote cover images and markdown body content
  - these paths must be preserved or mapped cleanly during migration

### Taxonomy and Pagination

- Posts are rendered on `/` and the `/page/:number/` archive family
- Tag route generation uses kebab-case and `/tags/:slug/`
- Category route generation uses kebab-case and `/categories/:slug/`
- Series route generation uses explicit series slugs when present and `/series/:slug/`

### Site Metadata and Navigation

Current global config lives in `data/siteConfig.js`.

- Site URL in the Gatsby repo is currently misconfigured to a GitHub URL and `rowlandbits` path prefix
- Site title: `Rowlandbits- Blog by Rowland Ekemezie`
- Author bio and social links are driven from `data/siteConfig.js`
- Menu items:
  - the current Gatsby home page is the only primary route
- Author metadata:
  - name
  - contacts for Twitter, GitHub, email

### SEO and Metadata Behavior

Current SEO behavior is implemented with `react-helmet` in `src/components/SEO/SEO.js`.

- Uses canonical page URL derived from `siteMetadata.url + slug`
- Uses `titleTemplate` of `%s — Rowland I. Ekemezie`
- Emits:
  - `description`
  - `og:url`
  - `og:title`
  - `og:description`
  - `twitter:card`
  - `twitter:creator`
  - `twitter:title`
  - `twitter:description`
- Emits `og:image` and `twitter:image` when a page image exists
- Post pages derive share image from frontmatter `cover` through Gatsby image handling

### Markdown Rendering Features

Current Gatsby markdown pipeline includes:

- `gatsby-remark-katex`
- `gatsby-remark-images`
- `gatsby-remark-responsive-iframe`
- `@weknow/gatsby-remark-codepen`
- `gatsby-remark-autolink-headers`
- `gatsby-remark-prismjs`
- `gatsby-remark-copy-linked-files`
- `gatsby-remark-smartypants`
- `gatsby-remark-relative-images`

Migration implications:

- phase 1 must explicitly preserve or intentionally retire:
  - syntax highlighting
  - KaTeX math rendering
  - heading autolinks
  - smart punctuation
  - responsive embeds/iframes
  - CodePen embedding
  - relative image handling

### Comments

- Current provider: Disqus
- Source: `src/components/Post/Comments/Comments.js`
- Current thread configuration:
  - `shortname` from `config.js`
  - `identifier` = `postTitle`
  - `title` = `postTitle`
  - `url` = `siteMetadata.url + postSlug`

Migration implications:

- phase 1 keeps the existing provider
- legacy thread continuity depends on keeping post URLs stable and confirming the title-based identifier behavior still maps correctly

### Analytics

- Current provider: Google Analytics Universal Analytics
- Current identifier: `UA-134985180-1`
- Migration implication:
  - UA must not be carried forward
  - phase 1 needs a supported analytics decision or an explicit no-analytics launch decision

### Assets and Branding

- `static/`
- `src/layout/index.css`
- frontmatter `cover` images and markdown body content

Migration implications:

- Astro `public/` strategy must account for current `static/` assets
- legacy content image references must be validated against the new output structure

### Legacy Integrations and Behaviors

Present in repo:

- Netlify deploy config via `netlify.toml`
- Netlify CMS config via `static/admin/config.yml`
- Gatsby offline/PWA plugin
- Gatsby feed and sitemap plugins
- Gatsby image pipeline
- Disqus comments
- Google Analytics UA

Phase 1 migration decisions:

- keep:
  - Git-based content editing
  - existing comments provider
  - route/content/SEO parity focus
- replace:
  - Gatsby build/runtime with Astro
  - Universal Analytics with a supported provider or explicit removal
  - Netlify deployment path with Cloudflare deployment
- defer or retire from phase 1:
  - broad redesign
  - CMS migration
  - SSR unless a concrete runtime need emerges

### Risks to Watch

- title-based Disqus identifiers may be brittle if titles change
- Gatsby image-derived Open Graph images need an Astro replacement strategy
- taxonomy slugs must stay consistent with the live site
- markdown rendering regressions are likely if remark compatibility is not tested against representative posts

### Phase 1 Implementation Reference

This audit should be used as the source of truth for:

- route parity work
- content collection schema
- markdown rendering parity
- comment continuity validation
- asset-path preservation
- redirect planning
- Cloudflare cutover verification
