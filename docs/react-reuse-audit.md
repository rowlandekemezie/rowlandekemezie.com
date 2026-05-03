# React Reuse Audit

This document records the phase-1 decision on whether to carry Gatsby-era React components into Astro.

## Decision

Phase 1 keeps **no React islands**.

The current Astro rebuild does not require `@astrojs/react`, and adding it now would increase runtime and maintenance cost without preserving any behavior that Astro cannot already cover with static templates or light client scripts.

## Component inventory

- `src/components/Disqus/Disqus.js`

  - Gatsby-specific wrapper around `react-disqus-comments`.
  - Replaced by `src/components/DisqusComments.astro`.
  - Keep as Astro, not React.

- `src/components/SEO/SEO.js`

  - React Helmet wrapper for metadata and JSON-LD.
  - Better expressed directly in Astro layouts.
  - Keep as Astro, not React.

- `src/components/PostListing/PostListing.js`

  - Static list rendering with Gatsby `Link`.
  - Better expressed as Astro markup.
  - Keep as Astro, not React.

- `src/components/PostTags/PostTags.js`

  - Static tag link rendering.
  - Better expressed as Astro markup.
  - Keep as Astro, not React.

- `src/components/UserInfo/UserInfo.js`

  - Twitter follow widget wrapper.
  - Not required for parity-first launch.
  - If restored later, prefer a direct embed or native Astro wrapper before React.

- `src/components/SocialLinks/SocialLinks.js`

  - Share button bundle with third-party React dependencies, including deprecated Google+ support.
  - Not required for parity-first launch.
  - If restored later, redesign the feature instead of carrying this React component forward.

- `src/components/Footer/Footer.js`
- `src/components/UserLinks/UserLinks.js`
- `src/components/SocialLinks/SocialLinks.css`
- `src/components/UserLinks/UserLinks.css`
- `src/components/Footer/Footer.css`
  - Presentation-only legacy pieces.
  - Better rebuilt or retired in native Astro/CSS.

## Hydration strategy

- No hydrated React components are approved for phase 1.
- If a future feature genuinely needs client interactivity, evaluate that feature independently instead of defaulting to React reuse.

## Phase-1 conclusion

- Do not add `@astrojs/react`.
- Prefer native Astro templates for static UI.
- Prefer small script-based enhancements for isolated client behavior.
- Re-evaluate only if a later ticket introduces a concrete interactive requirement that Astro components cannot cover cleanly.
