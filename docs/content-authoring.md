# Content Authoring

## Phase 1 default

- Posts and pages are Markdown-first.
- Existing legacy content remains in `.md` files and is loaded through Astro content collections.

## MDX policy

- MDX is enabled as an opt-in for future posts or pages that need embedded components.
- There is no requirement to rewrite legacy Markdown content into MDX.
- New MDX content should live beside the existing content model:
  - posts: `content/posts/**/index.mdx`
  - pages: `content/pages/**/*.mdx`

## Frontmatter expectations

- Posts support `title`, `slug`, `draft`, `date`, `description`, `category`, `tags`, and `image`.
- `slug` should preserve the canonical public route, including existing `/posts/.../` values where legacy content already defines them.
- `image` is resolved through Astro's content image pipeline, so local relative image paths should stay next to the content file.

## Phase 1 editing workflow

- Git is the only supported editorial workflow in phase 1.
- Content changes should pass `pnpm verify:all` before they are merged into the migration branch.
