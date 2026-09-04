import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const distDir = resolve(process.cwd(), 'dist');

function assert(description, passed) {
  if (!passed) {
    throw new Error(`Agent readiness verification failed: ${description}`);
  }
}

function read(relativePath) {
  const absolutePath = resolve(distDir, relativePath);
  assert(`build contains ${relativePath}`, existsSync(absolutePath));
  return readFileSync(absolutePath, 'utf8');
}

function visibleText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const home = read('index.html');
const about = read('about/index.html');
const contact = read('contact/index.html');
const privacy = read('privacy/index.html');
const developers = read('developers/index.html');
const openapiText = read('openapi.json');
const llms = read('llms.txt');
const agents = read('agents.md');
const markdownHome = read('_agent/home.md');
const robots = read('robots.txt');
const sitemap = read('sitemap.xml');
const workerSource = read('_worker.js');
const headers = read('_headers');

assert('homepage contains at least 500 visible characters', visibleText(home).length >= 500);
assert('homepage has one clear H1', (home.match(/<h1\b/gi) ?? []).length === 1);
assert('homepage H1 identifies Rowland', home.includes('<h1>Rowland I. Ekemezie</h1>'));
assert('homepage declares lang=en', home.includes('<html lang="en">'));
assert(
  'homepage has canonical metadata',
  home.includes('<link rel="canonical" href="https://rowlandekemezie.com/">')
);
assert('homepage has Open Graph type', home.includes('<meta property="og:type" content="website">'));
assert(
  'homepage has Open Graph image',
  home.includes('<meta property="og:image" content="https://rowlandekemezie.com/logos/logo-1024.png">')
);
assert('homepage exposes Organization JSON-LD', home.includes('"@type":"Organization"'));
assert('Organization schema has contactPoint', home.includes('"contactPoint"'));
assert('Organization schema has PostalAddress', home.includes('"@type":"PostalAddress"'));
assert('homepage links developer resources', home.includes('href="/developers/"'));
assert('homepage links canonical about page', home.includes('href="/about/"'));
assert('homepage links contact page', home.includes('href="/contact/"'));
assert('homepage links privacy page', home.includes('href="/privacy/"'));

for (const [name, html] of [
  ['about', about],
  ['contact', contact],
  ['privacy', privacy]
]) {
  assert(`${name} trust page has at least 500 visible characters`, visibleText(html).length >= 500);
}

assert('developer page names Rowland', developers.includes('Rowland I. Ekemezie developer resources'));
assert('developer page links OpenAPI', developers.includes('href="/openapi.json"'));
assert('developer page links llms.txt', developers.includes('href="/llms.txt"'));
assert('developer page documents profile API', developers.includes('/api/v1/profile'));
assert('developer page documents Markdown negotiation', developers.includes('Accept: text/markdown'));

const openapi = JSON.parse(openapiText);
const profileOperation = openapi.paths?.['/api/v1/profile']?.get;
const successResponse = profileOperation?.responses?.['200'];
assert('OpenAPI uses version 3.1.0', openapi.openapi === '3.1.0');
assert('OpenAPI publishes getPublicProfile operation', profileOperation?.operationId === 'getPublicProfile');
assert('OpenAPI operation has a description', profileOperation?.description?.length > 40);
assert(
  'OpenAPI success response has a typed schema',
  successResponse?.content?.['application/json']?.schema?.$ref === '#/components/schemas/PublicProfile'
);
assert('OpenAPI documents RateLimit-Limit', Boolean(successResponse?.headers?.['RateLimit-Limit']));
assert('OpenAPI documents RateLimit-Policy', Boolean(successResponse?.headers?.['RateLimit-Policy']));
assert(
  'OpenAPI defines a typed problem response',
  openapi.components?.responses?.ProblemResponse?.content?.['application/problem+json']?.schema?.$ref ===
    '#/components/schemas/ProblemDetails'
);
assert('OpenAPI error schema includes code', Boolean(openapi.components?.schemas?.ProblemDetails?.properties?.code));
assert('OpenAPI error schema includes message', Boolean(openapi.components?.schemas?.ProblemDetails?.properties?.message));
assert('OpenAPI error schema includes hint', Boolean(openapi.components?.schemas?.ProblemDetails?.properties?.hint));

assert('llms.txt identifies the site', llms.startsWith('# Rowland I. Ekemezie'));
assert('llms.txt includes when-to-use guidance', llms.includes('## When to use this site'));
assert('llms.txt links OpenAPI', llms.includes('https://rowlandekemezie.com/openapi.json'));
assert('llms.txt links developer resources', llms.includes('https://rowlandekemezie.com/developers/'));
assert('agent instructions use Markdown heading', agents.startsWith('# Agent instructions'));
assert('agent instructions describe public API', agents.includes('GET /api/v1/profile'));
assert('Markdown homepage has meaningful content', markdownHome.length >= 500);
assert('Markdown homepage starts with a clear H1', markdownHome.startsWith('# Rowland I. Ekemezie'));

for (const userAgent of [
  'ChatGPT-User',
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'PerplexityBot',
  'DeepSeekBot',
  'Applebot-Extended',
  'ora-agent'
]) {
  assert(`robots.txt explicitly allows ${userAgent}`, robots.includes(`User-agent: ${userAgent}\nAllow: /`));
}

for (const path of ['/about/', '/contact/', '/privacy/', '/developers/']) {
  assert(
    `sitemap contains ${path}`,
    sitemap.includes(`<loc>https://rowlandekemezie.com${path}</loc>`)
  );
}

assert('static headers vary on Accept', headers.includes('Vary: Accept, Accept-Encoding'));
assert('worker exposes text/markdown', workerSource.includes('text/markdown; charset=utf-8'));
assert('worker exposes problem+json', workerSource.includes('application/problem+json; charset=utf-8'));
assert('worker exposes the versioned profile API', workerSource.includes("'/api/v1/profile'"));
assert('worker exposes RateLimit-Limit', workerSource.includes("'RateLimit-Limit'"));

const workerFactory = new Function(
  `${workerSource.replace('export default', 'const worker =')}\nreturn worker;`
);
const worker = workerFactory();
const fakeEnv = {
  ASSETS: {
    async fetch(request) {
      const path = new URL(request.url).pathname;
      const isHead = request.method === 'HEAD';

      if (path === '/_agent/home.md') {
        return new Response(isHead ? null : markdownHome, {
          status: 200,
          headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
        });
      }

      return new Response(isHead ? null : home, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
  }
};

const markdownResponse = await worker.fetch(
  new Request('https://rowlandekemezie.com/', {
    headers: { Accept: 'text/markdown' }
  }),
  fakeEnv
);
assert('Accept: text/markdown returns 200', markdownResponse.status === 200);
assert(
  'Accept: text/markdown returns Markdown content type',
  markdownResponse.headers.get('Content-Type') === 'text/markdown; charset=utf-8'
);
assert('negotiated response Vary includes Accept', markdownResponse.headers.get('Vary')?.includes('Accept'));
assert(
  'negotiated response Vary includes Accept-Encoding',
  markdownResponse.headers.get('Vary')?.includes('Accept-Encoding')
);
assert('negotiated Markdown contains homepage H1', (await markdownResponse.text()).startsWith('# Rowland I. Ekemezie'));

const browserResponse = await worker.fetch(
  new Request('https://rowlandekemezie.com/', {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  }),
  fakeEnv
);
assert('normal browser Accept receives HTML', browserResponse.headers.get('Content-Type')?.startsWith('text/html'));

const weightedHtmlResponse = await worker.fetch(
  new Request('https://rowlandekemezie.com/', {
    headers: { Accept: 'text/markdown;q=0.2, text/html;q=1' }
  }),
  fakeEnv
);
assert('Accept q-values prefer HTML when requested', weightedHtmlResponse.headers.get('Content-Type')?.startsWith('text/html'));

const unacceptableResponse = await worker.fetch(
  new Request('https://rowlandekemezie.com/', {
    headers: { Accept: 'application/json' }
  }),
  fakeEnv
);
assert('unsupported homepage representation returns 406', unacceptableResponse.status === 406);

const profileResponse = await worker.fetch(
  new Request('https://rowlandekemezie.com/api/v1/profile', {
    headers: { Accept: 'application/json' }
  }),
  fakeEnv
);
const profile = await profileResponse.json();
assert('profile API returns 200 JSON', profileResponse.status === 200 && profile.name === 'Rowland I. Ekemezie');
assert('profile API returns RateLimit-Limit', profileResponse.headers.get('RateLimit-Limit') === '120');
assert('profile API returns RateLimit-Policy', profileResponse.headers.get('RateLimit-Policy') === '120;w=60');

const methodErrorResponse = await worker.fetch(
  new Request('https://rowlandekemezie.com/api/v1/profile', { method: 'POST' }),
  fakeEnv
);
const methodError = await methodErrorResponse.json();
assert('profile API rejects writes with 405', methodErrorResponse.status === 405);
assert(
  'profile API errors are problem+json',
  methodErrorResponse.headers.get('Content-Type') === 'application/problem+json; charset=utf-8'
);
assert('profile API errors expose code', methodError.code === 'METHOD_NOT_ALLOWED');
assert('profile API errors expose message', typeof methodError.message === 'string' && methodError.message.length > 0);
assert('profile API errors expose hint', typeof methodError.hint === 'string' && methodError.hint.length > 0);

const missingApiResponse = await worker.fetch(
  new Request('https://rowlandekemezie.com/api/v1/missing'),
  fakeEnv
);
const missingApi = await missingApiResponse.json();
assert('unknown API resource returns JSON 404', missingApiResponse.status === 404);
assert('unknown API resource exposes stable code', missingApi.code === 'RESOURCE_NOT_FOUND');

const subscribeCompatibilityResponse = await worker.fetch(
  new Request('https://rowlandekemezie.com/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'person@example.com' })
  }),
  fakeEnv
);
const subscribeCompatibility = await subscribeCompatibilityResponse.json();
assert(
  'newsletter API keeps the existing error property for the frontend',
  typeof subscribeCompatibility.error === 'string'
);

console.log('Agent readiness verification passed.');
