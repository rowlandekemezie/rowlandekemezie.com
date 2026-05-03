# Comment Thread Continuity

## Preview used for verification

- Cloudflare Pages preview: `https://bb8bf325.rowlandekemezie-com.pages.dev`
- Verification date: `2026-05-03`

## Expected Disqus contract

Phase 1 keeps Disqus and preserves the legacy canonical production URL in the embed configuration.

- `page.url` must continue to point at `https://rowlandekemezie.com/...`
- `page.identifier` must remain the legacy slug-style identifier from the existing site

## Representative preview checks

### `Top 30 Things I learnt working at GitStart Over 3 years`

- Preview route:
  - `/posts/top-30-things-i-learnt-at-gitstart/`
- Verified values in deployed preview HTML:
  - `this.page.url = "https://rowlandekemezie.com/posts/top-30-things-i-learnt-at-gitstart/";`
  - `this.page.identifier = "/posts/top-30-things-i-learnt-at-gitstart/";`
- Result:
  - canonical URL and Disqus identifier match the legacy route contract

### `Improving your Visual Review with Percy`

- Preview route:
  - `/posts/improving-your-visual-review-with-percy/`
- Verified values in deployed preview HTML:
  - `this.page.url = "https://rowlandekemezie.com/posts/improving-your-visual-review-with-percy/";`
  - `this.page.identifier = "/posts/improving-your-visual-review-with-percy/";`
- Result:
  - canonical URL and Disqus identifier match the legacy route contract

## Notes

- The Cloudflare preview uses `x-robots-tag: noindex`, which is appropriate for staging and does not affect the embedded canonical production URL.
- If a legacy thread is missing after cutover, the first fallback check should be whether the production canonical URL or slug identifier drifted from these values.
