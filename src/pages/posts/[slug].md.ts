import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublishedPosts } from '../../lib/content';
import { getPostMarkdownPath, renderPostMarkdown } from '../../lib/post-markdown';

// Emits /posts/<name>.md for every published essay. The worker serves these
// when an agent asks for an essay with `Accept: text/markdown`, and the HTML
// page advertises them with <link rel="alternate" type="text/markdown">.
export const getStaticPaths = (async () => {
  const posts = await getPublishedPosts();

  return posts.map((post) => ({
    params: { slug: getPostMarkdownPath(post).replace(/^\/posts\//, '').replace(/\.md$/, '') },
    props: { post },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  new Response(renderPostMarkdown(props.post), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
