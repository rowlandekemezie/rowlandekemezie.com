import type { APIRoute } from 'astro';
import {
  formatPostMonthYear,
  getPostExcerpt,
  getPostPath,
  getPublishedPosts,
} from '../lib/content';
import type { PostSearchCatalog } from '../lib/post-search';

export const GET: APIRoute = async () => {
  const catalog = {
    posts: (await getPublishedPosts()).map((post) => ({
      date: formatPostMonthYear(post.data.date),
      href: getPostPath(post),
      text: [
        post.data.title,
        post.data.description ?? getPostExcerpt(post),
        post.data.category,
        ...post.data.tags,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
      title: post.data.title,
    })),
  } satisfies PostSearchCatalog;

  return new Response(JSON.stringify(catalog), {
    headers: {
      'Cache-Control': 'public, max-age=0, must-revalidate',
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
