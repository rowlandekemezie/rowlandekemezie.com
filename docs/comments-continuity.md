# Comments Continuity Notes

Phase 1 keeps the existing Disqus provider.

## Continuity contract

- Comment embeds stay on post detail pages only.
- The Disqus page URL follows the public post canonical:
  - `https://rowlandekemezie.com/posts/:slug/`
- The Disqus identifier remains title-driven in the same shape the legacy Gatsby site used:
  - explicit frontmatter `slug` when present
  - otherwise the post title

## Verified output

- `scripts/verify-static-output.mjs` now checks that a generated post page includes:
  - the `#disqus_thread` container
  - the canonical `this.page.url` value
  - the expected `this.page.identifier` value

## Remaining manual check before cutover

- Confirm in a Pages preview deployment that an existing post with known comments still resolves to the same thread in the browser.
- If the historical Disqus shortname on production differs from `rowlandekemezie`, update `src/components/DisqusComments.astro` before cutover.
