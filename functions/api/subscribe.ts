export interface Env {
  KIT_API_KEY?: string;
  KIT_FORM_ID?: string;
}

interface PagesContext {
  env: Env;
  request: Request;
}

type JsonRecord = Record<string, unknown>;

function json(body: JsonRecord, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

async function readErrorPayload(response: Response) {
  const payload = (await response
    .json()
    .catch(() => null)) as JsonRecord | null;

  if (payload) {
    return payload;
  }

  return {
    errors: ['Unable to subscribe right now.']
  } as JsonRecord;
}

export const onRequestPost = async ({ env, request }: PagesContext) => {
  if (!env.KIT_API_KEY || !env.KIT_FORM_ID) {
    return json({ error: 'Newsletter signup is not configured yet.' }, 503);
  }

  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    referrer?: unknown;
  } | null;

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

  const addToFormResponse = await fetch(
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

  if (!addToFormResponse.ok) {
    const payload = await readErrorPayload(addToFormResponse);

    console.error('Kit subscribe failed', {
      status: addToFormResponse.status,
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
        kit_status: addToFormResponse.status
      },
      addToFormResponse.status
    );
  }

  return json({
    message: 'Check your inbox to confirm your subscription.'
  });
};
