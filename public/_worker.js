// Advisory request budget for API clients. The worker does not count requests,
// so it publishes the policy without pretending to report live remaining quota.
const RATE_LIMIT_HEADERS = {
  'RateLimit-Limit': '120',
  'RateLimit-Policy': '120;w=60'
};

const CANONICAL_HOST = 'rowlandekemezie.com';
const SUBSCRIBE_ERROR = 'Unable to subscribe right now. Please try again later.';

const PROFILE = {
  name: 'Rowland I. Ekemezie',
  description:
    'Engineering leader, systems builder, and technical writer focused on reliable software, integrations, AI-enabled products, and engineering leadership.',
  url: 'https://rowlandekemezie.com',
  location: 'Vancouver, BC, Canada',
  topics: [
    'software architecture',
    'distributed systems',
    'payments and financial infrastructure',
    'system integrations',
    'AI-enabled product engineering',
    'engineering leadership'
  ],
  resources: {
    website: 'https://rowlandekemezie.com/',
    about: 'https://rowlandekemezie.com/about/',
    writing: 'https://rowlandekemezie.com/',
    series: 'https://rowlandekemezie.com/series/',
    developers: 'https://rowlandekemezie.com/developers/',
    openapi: 'https://rowlandekemezie.com/openapi.json',
    llms: 'https://rowlandekemezie.com/llms.txt',
    agentInstructions: 'https://rowlandekemezie.com/agents.md'
  }
};

const LEGACY_TAG_REDIRECTS = {
  ajax: 'web-development',
  'backend-systems': 'software-architecture',
  caching: 'software-architecture',
  career: 'careers',
  cdn: 'distributed-systems',
  'cloudflare-r2': 'web-development',
  code: 'web-development',
  'code-quality': 'software-quality',
  'code-review': 'software-quality',
  css: 'web-development',
  culture: 'engineering-leadership',
  'dark-theme': 'web-development',
  education: 'learning',
  'engineering-management': 'engineering-leadership',
  expertise: 'careers',
  hiring: 'engineering-leadership',
  judgment: 'careers',
  leadership: 'engineering-leadership',
  life: 'learning',
  management: 'engineering-leadership',
  'object-storage': 'distributed-systems',
  'professional-services': 'careers',
  qa: 'software-quality',
  react: 'web-development',
  'react-hooks': 'web-development',
  redux: 'web-development',
  'redux-saga': 'web-development',
  'redux-thunk': 'web-development',
  'regression-testing': 'software-quality',
  s3: 'distributed-systems',
  sass: 'web-development',
  school: 'learning',
  'software-engineering': 'software-architecture',
  'start-up': 'startups',
  'technical-debt': 'software-quality',
  technology: 'careers',
  testing: 'software-quality',
  'visual-testing': 'software-quality'
};

const AGENT_USER_AGENTS = [
  'ChatGPT-User',
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'PerplexityBot',
  'DeepSeekBot',
  'Applebot-Extended',
  'ora-agent'
];

const NOT_FOUND_MARKDOWN = `# Page not found

The requested resource does not exist on rowlandekemezie.com.

## Where to look next

- [Homepage and writing](https://rowlandekemezie.com/)
- [Sitemap](https://rowlandekemezie.com/sitemap.xml)
- [llms.txt](https://rowlandekemezie.com/llms.txt)
- [Developer resources](https://rowlandekemezie.com/developers/)
- [OpenAPI specification](https://rowlandekemezie.com/openapi.json)
- [Agent instructions](https://rowlandekemezie.com/agents.md)
`;

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders
    }
  });
}

function problem(request, status, code, title, detail, hint, extraHeaders = {}) {
  return new Response(
    JSON.stringify({
      type: `https://rowlandekemezie.com/problems/${code.toLowerCase()}`,
      title,
      status,
      code,
      detail,
      message: detail,
      hint,
      instance: new URL(request.url).pathname
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/problem+json; charset=utf-8',
        'Cache-Control': 'no-store',
        ...RATE_LIMIT_HEADERS,
        ...extraHeaders
      }
    }
  );
}

function parseAccept(accept) {
  if (!accept || !accept.trim()) {
    return [{ type: '*', subtype: '*', q: 1, index: 0 }];
  }

  return accept
    .split(',')
    .map((value, index) => {
      const [mediaRange, ...parameters] = value.trim().split(';');
      const [type = '', subtype = ''] = mediaRange.toLowerCase().split('/');
      let q = 1;

      for (const parameter of parameters) {
        const [name, rawValue] = parameter.trim().split('=');

        if (name?.toLowerCase() === 'q') {
          const parsed = Number.parseFloat(rawValue ?? '');
          q = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0;
        }
      }

      return { type, subtype, q, index };
    })
    .filter(({ type, subtype }) => type && subtype);
}

function qualityFor(entries, candidate) {
  const [candidateType, candidateSubtype] = candidate.split('/');
  const matches = entries
    .map(entry => {
      const typeMatches = entry.type === '*' || entry.type === candidateType;
      const subtypeMatches = entry.subtype === '*' || entry.subtype === candidateSubtype;

      if (!typeMatches || !subtypeMatches) {
        return null;
      }

      const specificity =
        entry.type === candidateType && entry.subtype === candidateSubtype
          ? 2
          : entry.type === candidateType && entry.subtype === '*'
            ? 1
            : 0;

      return { ...entry, specificity };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (right.specificity !== left.specificity) {
        return right.specificity - left.specificity;
      }

      return left.index - right.index;
    });

  return matches[0] ?? { q: 0, index: Number.POSITIVE_INFINITY, specificity: -1 };
}

function preferredRepresentation(accept) {
  const entries = parseAccept(accept);
  const markdown = qualityFor(entries, 'text/markdown');
  const html = qualityFor(entries, 'text/html');

  if (markdown.q === 0 && html.q === 0) {
    return 'not-acceptable';
  }

  if (markdown.q > html.q) {
    return 'markdown';
  }

  if (html.q > markdown.q) {
    return 'html';
  }

  if (markdown.specificity > html.specificity) {
    return 'markdown';
  }

  if (html.specificity > markdown.specificity) {
    return 'html';
  }

  if (markdown.index < html.index) {
    return 'markdown';
  }

  return 'html';
}

function mergeVary(current) {
  const values = new Set(
    (current ?? '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean)
  );

  values.add('Accept');
  values.add('Accept-Encoding');

  return [...values].join(', ');
}

function withNegotiationHeaders(response, contentType) {
  const headers = new Headers(response.headers);
  headers.set('Vary', mergeVary(headers.get('Vary')));

  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function isAgentRequest(request) {
  const userAgent = request.headers.get('User-Agent') ?? '';
  return AGENT_USER_AGENTS.some(agent => userAgent.toLowerCase().includes(agent.toLowerCase()));
}

function shouldServeMarkdown404(request) {
  const accept = request.headers.get('Accept');

  if (!accept || accept.trim() === '*/*') {
    return true;
  }

  if (isAgentRequest(request)) {
    return true;
  }

  return preferredRepresentation(accept) === 'markdown';
}

function markdownNotFound(request) {
  return new Response(request.method === 'HEAD' ? null : NOT_FOUND_MARKDOWN, {
    status: 404,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
      Vary: 'Accept, Accept-Encoding, User-Agent'
    }
  });
}

function isSameOriginRequest(request) {
  const origin = request.headers.get('Origin');

  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

async function kitRequest(env, path, body) {
  const response = await fetch(`https://api.kit.com/v4/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Kit-Api-Key': env.KIT_API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    console.error('Kit request failed', {
      path,
      status: response.status,
      payload: await response.json().catch(() => null)
    });
  }

  return response;
}

async function handleSubscribe(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405, { Allow: 'POST' });
  }

  if (!isSameOriginRequest(request)) {
    return json({ error: 'Forbidden' }, 403);
  }

  if (!env.KIT_API_KEY || !env.KIT_FORM_ID) {
    return json({ error: 'Newsletter signup is not configured yet.' }, 503);
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const referrer =
    typeof body?.referrer === 'string' && body.referrer.trim()
      ? body.referrer.trim()
      : null;

  // Honeypot: real visitors never see or fill this field. Report success so
  // bots get no signal, but never forward the address to Kit.
  if (typeof body?.website === 'string' && body.website.trim()) {
    return json({ message: 'Check your inbox to confirm your subscription.' });
  }

  if (!email) {
    return json({ error: 'Email address is required.' }, 400);
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email.length > 254 || !emailPattern.test(email)) {
    return json({ error: 'Enter a valid email address.' }, 400);
  }

  // Create the subscriber as inactive so Kit's double opt-in confirmation
  // email (sent when they are added to the form) is what activates them.
  const createSubscriberResponse = await kitRequest(env, 'subscribers', {
    email_address: email,
    state: 'inactive'
  });

  if (!createSubscriberResponse.ok) {
    return json({ error: SUBSCRIBE_ERROR }, 502);
  }

  const subscribeResponse = await kitRequest(env, `forms/${env.KIT_FORM_ID}/subscribers`, {
    email_address: email,
    referrer
  });

  if (!subscribeResponse.ok) {
    return json({ error: SUBSCRIBE_ERROR }, 502);
  }

  return json({
    message: 'Check your inbox to confirm your subscription.'
  });
}

function handleProfile(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return problem(
      request,
      405,
      'METHOD_NOT_ALLOWED',
      'Method not allowed',
      'The public profile endpoint is read-only.',
      'Send a GET request to /api/v1/profile.',
      { Allow: 'GET, HEAD' }
    );
  }

  const body = request.method === 'HEAD' ? null : JSON.stringify(PROFILE);

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      ...RATE_LIMIT_HEADERS
    }
  });
}

async function markdownHomepage(request, env) {
  const url = new URL(request.url);
  url.pathname = '/_agent/home.md';
  url.search = '';

  const assetRequest = new Request(url.toString(), {
    method: request.method === 'HEAD' ? 'HEAD' : 'GET',
    headers: request.headers
  });
  const response = await env.ASSETS.fetch(assetRequest);

  return withNegotiationHeaders(
    response,
    'text/markdown; charset=utf-8'
  );
}

function notAcceptable() {
  return new Response(
    'This route can be served as text/html or text/markdown. Send Accept: text/html or Accept: text/markdown.\n',
    {
      status: 406,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        Vary: 'Accept, Accept-Encoding'
      }
    }
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === `www.${CANONICAL_HOST}`) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/pages/about' || url.pathname === '/pages/about/') {
      url.pathname = '/about/';
      return Response.redirect(url.toString(), 301);
    }

    // The archive now lives on the homepage, so old paginated URLs go there.
    if (/^\/page\/\d+\/?$/.test(url.pathname)) {
      url.pathname = '/';
      return Response.redirect(url.toString(), 301);
    }

    // Legacy Gatsby taxonomy URLs: /tag/<x>/, /tag/<x>/page/<n>/ and /category/<x>/.
    const legacyTaxonomyMatch = url.pathname.match(/^\/(tag|category)\/([^/]+)(?:\/page\/\d+)?\/?$/);

    if (legacyTaxonomyMatch) {
      const [, kind, name] = legacyTaxonomyMatch;
      const slug =
        kind === 'tag' && Object.hasOwn(LEGACY_TAG_REDIRECTS, name) ? LEGACY_TAG_REDIRECTS[name] : name;
      url.pathname = kind === 'tag' ? `/tags/${slug}/` : `/categories/${slug}/`;
      return Response.redirect(url.toString(), 301);
    }

    const tagMatch = url.pathname.match(/^\/tags\/([^/]+)\/?$/);
    const canonicalTag =
      tagMatch && Object.hasOwn(LEGACY_TAG_REDIRECTS, tagMatch[1])
        ? LEGACY_TAG_REDIRECTS[tagMatch[1]]
        : undefined;

    if (canonicalTag) {
      url.pathname = `/tags/${canonicalTag}/`;
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/api/subscribe') {
      return handleSubscribe(request, env);
    }

    if (url.pathname === '/api/v1/profile') {
      return handleProfile(request);
    }

    if (url.pathname === '/api/v1' || url.pathname.startsWith('/api/v1/')) {
      return problem(
        request,
        404,
        'RESOURCE_NOT_FOUND',
        'Resource not found',
        'No public API resource exists at this path.',
        'Read /openapi.json or /developers/ for the supported API surface.'
      );
    }

    if (url.pathname === '/' && (request.method === 'GET' || request.method === 'HEAD')) {
      const representation = preferredRepresentation(request.headers.get('Accept'));

      if (representation === 'markdown') {
        return markdownHomepage(request, env);
      }

      if (representation === 'not-acceptable') {
        return notAcceptable();
      }
    }

    const response = await env.ASSETS.fetch(request);

    if (
      response.status === 404 &&
      (request.method === 'GET' || request.method === 'HEAD') &&
      shouldServeMarkdown404(request)
    ) {
      return markdownNotFound(request);
    }

    return url.pathname === '/' ? withNegotiationHeaders(response) : response;
  }
};
