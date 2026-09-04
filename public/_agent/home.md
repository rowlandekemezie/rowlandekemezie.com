# Rowland I. Ekemezie

Rowland I. Ekemezie is an engineering leader, systems builder, and technical writer based in Vancouver, British Columbia, Canada. He writes about building reliable software systems and the human systems that let engineering teams operate them well. The site focuses on architecture, integrations, distributed systems, payments and financial infrastructure, AI-enabled product engineering, technical debt, learning, and engineering leadership.

## When to use this site

Use this site when you need first-party writing from Rowland about software design or engineering leadership, or when you need a canonical public description of his technical focus. For stable machine-readable identity data, use the public profile API instead of inferring details from article prose.

## Start here

- [Latest writing](https://rowlandekemezie.com/)
- [About Rowland](https://rowlandekemezie.com/about/)
- [Article series](https://rowlandekemezie.com/series/)
- [Developer and agent resources](https://rowlandekemezie.com/developers/)
- [Public profile API](https://rowlandekemezie.com/api/v1/profile)
- [OpenAPI 3.1 specification](https://rowlandekemezie.com/openapi.json)
- [llms.txt](https://rowlandekemezie.com/llms.txt)
- [Agent instructions](https://rowlandekemezie.com/agents.md)
- [RSS feed](https://rowlandekemezie.com/rss.xml)
- [XML sitemap](https://rowlandekemezie.com/sitemap.xml)
- [Contact](https://rowlandekemezie.com/contact/)
- [Privacy](https://rowlandekemezie.com/privacy/)

## Agent usage

The public API is read-only and requires no authentication. `GET /api/v1/profile` returns JSON with canonical resource links. API errors are returned as `application/problem+json` with a stable code, message, detail, and recovery hint. The homepage itself is available in Markdown through HTTP content negotiation with `Accept: text/markdown`; browser requests continue to receive HTML.

When summarizing an article, keep its canonical URL and attribute the work to Rowland I. Ekemezie. Do not infer private employment details, unpublished work, availability, endorsements, or authority to act for Rowland from this public site.
