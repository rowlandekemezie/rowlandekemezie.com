const RATE_LIMIT_HEADERS = {
  'RateLimit-Limit': '120',
  'RateLimit-Policy': '120;w=60',
  'RateLimit-Remaining': '120',
  'RateLimit-Reset': '60'
};

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

async function readErrorPayload(response) {
  const payload = await response.json().catch(() => null);

  if (payload) {
    return payload;
  }

  return {
    errors: ['Unable to subscribe right now.']
  };
}

async function handleSubscribe(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405, { Allow: 'POST' });
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

  if (!email) {
    return json({ error: 'Email address is required.' }, 400);
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return json({ error: 'Enter a valid email address.' }, 400);
  }

  const createSubscriberResponse = await fetch(
    'https://api.kit.com/v4/subscribers',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kit-Api-Key': env.KIT_API_KEY
      },
      body: JSON.stringify({
        email_address: email,
        state: 'active'
      })
    }
  );

  if (!createSubscriberResponse.ok) {
    const payload = await readErrorPayload(createSubscriberResponse);

    console.error('Kit subscriber create failed', {
      status: createSubscriberResponse.status,
      payload
    });

    const firstError =
      Array.isArray(payload.errors) && typeof payload.errors[0] === 'string'
        ? payload.errors[0]
        : 'Unable to subscribe right now.';

    return json(
      {
        error: firstError,
        kit_status: createSubscriberResponse.status
      },
      createSubscriberResponse.status
    );
  }

  const subscribeResponse = await fetch(
    `https://api.kit.com/v4/forms/${env.KIT_FORM_ID}/subscribers`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kit-Api-Key': env.KIT_API_KEY
      },
      body: JSON.stringify({
        email_address: email,
        referrer
      })
    }
  );

  if (!subscribeResponse.ok) {
    const payload = await readErrorPayload(subscribeResponse);

    console.error('Kit subscribe failed', {
      status: subscribeResponse.status,
      formId: env.KIT_FORM_ID,
      payload
    });

    const firstError =
      Array.isArray(payload.errors) && typeof payload.errors[0] === 'string'
        ? payload.errors[0]
        : 'Unable to subscribe right now.';

    return json(
      {
        error: firstError,
        kit_status: subscribeResponse.status
      },
      subscribeResponse.status
    );
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

    return withNegotiationHeaders(response);
  }
};
