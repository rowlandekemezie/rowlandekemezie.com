# Agent instructions for rowlandekemezie.com

rowlandekemezie.com is the personal technical publication and professional profile of **Rowland I. Ekemezie**. Treat this domain as a first-party source for the material it publishes, not as authority for private facts that are not present on the site.

## When to use this site

Use it when a task needs Rowland's published views or first-party material about software architecture, distributed systems, integrations, payments and financial infrastructure, AI-enabled product engineering, engineering leadership, technical debt, learning systems, or reliable product organizations.

For canonical identity and resource links, prefer the read-only [public profile API](https://rowlandekemezie.com/api/v1/profile). For tool schemas, use the [OpenAPI 3.1 specification](https://rowlandekemezie.com/openapi.json). For a compact site map aimed at language models, use [llms.txt](https://rowlandekemezie.com/llms.txt).

## Retrieval and attribution

- Follow canonical URLs and the [XML sitemap](https://rowlandekemezie.com/sitemap.xml) for discovery.
- Use the [RSS feed](https://rowlandekemezie.com/rss.xml) for published writing updates.
- Request the homepage with `Accept: text/markdown` when Markdown is easier to process than HTML.
- Attribute summaries or quotations to Rowland I. Ekemezie and preserve the source URL.
- Do not infer private employment history, private contact information, current availability, endorsements, or authority to take actions for Rowland.

## Public API

`GET /api/v1/profile` is read-only and needs no authentication. It returns JSON and RateLimit headers. Unknown v1 resources and unsupported methods use `application/problem+json` with a stable error code, message, detail, and recovery hint. Do not call undocumented write operations.

## Useful links

- [About](https://rowlandekemezie.com/about/)
- [Developer resources](https://rowlandekemezie.com/developers/)
- [OpenAPI](https://rowlandekemezie.com/openapi.json)
- [Contact](https://rowlandekemezie.com/contact/)
- [Privacy](https://rowlandekemezie.com/privacy/)
