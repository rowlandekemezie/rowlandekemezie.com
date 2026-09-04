import type { APIRoute } from 'astro';
import { site } from '../lib/site';

const agentUserAgents = [
  'ChatGPT-User',
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'PerplexityBot',
  'DeepSeekBot',
  'Applebot-Extended',
  'ora-agent',
];

export const GET: APIRoute = ({ site: contextSite }) => {
  const origin = contextSite ?? new URL(site.url);
  const agentRules = agentUserAgents.flatMap((userAgent) => [
    `User-agent: ${userAgent}`,
    'Allow: /',
    '',
  ]);
  const robots = [
    ...agentRules,
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${new URL('/sitemap.xml', origin).toString()}`,
  ].join('\n');

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
