import type { APIRoute } from 'astro';
import { renderAboutMarkdown } from '../lib/about';

// /about.md: the About page as Markdown, served to agents by the worker for
// /about/ when they send `Accept: text/markdown`.
export const GET: APIRoute = () =>
  new Response(renderAboutMarkdown(), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
