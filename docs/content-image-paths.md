# Content Image Path Strategy

Phase 1 does not currently need redirect rules for legacy inline post images.

## Findings

- Repo-wide content audit found no local markdown image references inside `content/**/index.md`.
- Existing post covers are remote URLs stored in frontmatter `cover`.
- The only committed static image assets currently required by the Astro build are the logo files now carried in `public/logos/`.

## Phase-1 rule

- Remote image URLs continue to render as-is.
- If a future post introduces a local markdown image path, that file must resolve either:
  - relative to the markdown file, or
  - from the Astro `public/` tree with a leading `/`.

## Verification

- `scripts/verify-content-image-paths.mjs` scans markdown image references and fails if a referenced local file cannot be resolved.
- Current content passes because there are no local markdown image references to preserve.
