import type { APIRoute } from 'astro';
import {
  getPaginatedPosts,
  getPostPath,
  getPublishedPosts,
  groupPostsByCategory,
  groupPostsByTag,
  parsePostDate,
} from '../lib/content';
import { aboutRoute, categoryRoute, pageRoute, site, tagRoute } from '../lib/site';

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function toIsoDate(value: Date) {
  return value.toISOString();
}

export const GET: APIRoute = async ({ site: contextSite }) => {
  const origin = contextSite ?? new URL(site.url);
  const posts = await getPublishedPosts();
  const latestPostDate = posts[0] ? parsePostDate(posts[0].data.date) : new Date();
  const tags = groupPostsByTag(posts);
  const categories = groupPostsByCategory(posts);
  const pagination = getPaginatedPosts(posts, 1, 4);

  const entries = [
    { path: '/', lastmod: latestPostDate },
    { path: aboutRoute(), lastmod: latestPostDate },
    { path: '/tags/', lastmod: latestPostDate },
    { path: '/categories/', lastmod: latestPostDate },
    ...Array.from({ length: pagination.totalPages }, (_, index) => ({
      path: pageRoute(index + 1),
      lastmod: latestPostDate,
    })),
    ...posts.map((post) => ({
      path: getPostPath(post),
      lastmod: parsePostDate(post.data.date),
    })),
    ...tags.map(([tag]) => ({
      path: tagRoute(tag),
      lastmod: latestPostDate,
    })),
    ...categories.map(([category]) => ({
      path: categoryRoute(category),
      lastmod: latestPostDate,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map(({ path, lastmod }) => {
      const loc = new URL(path, origin).toString();
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${toIsoDate(lastmod)}</lastmod>\n  </url>`;
    })
    .join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
