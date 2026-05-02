import type { APIRoute } from 'astro';
import { site } from '../lib/site';

export const GET: APIRoute = ({ site: contextSite }) => {
  const origin = contextSite ?? new URL(site.url);
  const robots = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${new URL('/sitemap.xml', origin).toString()}`,
  ].join('\n');

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
