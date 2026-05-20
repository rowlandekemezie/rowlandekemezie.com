function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
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
    return json({ error: 'Method Not Allowed' }, 405);
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/subscribe') {
      return handleSubscribe(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};
