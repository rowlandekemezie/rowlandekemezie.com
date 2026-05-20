# Markdown Compatibility Matrix

This file tracks the Gatsby markdown pipeline features that matter for the Astro migration and how they are handled in phase 1.

## Current Gatsby pipeline

- `gatsby-remark-images`: no current post uses local markdown-linked images, so there is no in-repo responsive-image transform to preserve for phase 1.
- `gatsby-remark-responsive-iframe`: no current post contains iframe embeds.
- `gatsby-remark-prismjs`: legacy syntax highlighting support.
- `gatsby-remark-copy-linked-files`: no current post links local downloadable files.
- `gatsby-remark-autolink-headers`: adds heading self-links.
- `gatsby-remark-katex`: installed in Gatsby, but no current post uses KaTeX delimiters.
- `gatsby-remark-smartypants`: installed in Gatsby; Astro enables smart punctuation by default.
- `@weknow/gatsby-remark-codepen`: installed in Gatsby, but no current post contains CodePen embeds.

## Astro phase-1 mapping

- Heading IDs and self-links: preserved with `rehype-slug` and `rehype-autolink-headings`.
- Smart punctuation and GFM tables: preserved by Astro defaults.
- Syntax highlighting: handled by Astro's built-in markdown highlighter for now.
- Raw HTML blocks and inline HTML: preserved by Astro markdown rendering and verified against the big sample post.
- Remote markdown images: rendered as standard remote `<img>` tags, matching the current content model.

## Intentional phase-1 decisions

- No responsive local-image transform is added yet because the current content corpus does not use local markdown-linked images.
- No iframe-specific wrapper is added yet because there are no iframe embeds in the current posts.
- KaTeX and CodePen are treated as explicitly unused in the current content set. If posts using either feature are added or restored, phase 1 must expand before issue `#88` closes.

## Representative content validation

The legacy sample markdown files used during migration were removed once the Astro content model stabilized.

Repo-wide content audit found:

- no KaTeX usage
- no CodePen usage
- no local markdown-linked image assets
- no iframe embeds
