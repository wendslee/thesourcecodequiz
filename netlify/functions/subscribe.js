const KIT_FORM_ID = '9730729';
const KIT_API_KEY = process.env.KIT_API_KEY;
const VALID_RESULTS = new Set(['worth', 'approval', 'readiness', 'guilt']);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { Allow: 'POST' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request' })
    };
  }

  const email = String(payload.email || '').trim().toLowerCase();
  const firstName = String(payload.first_name || '').trim();
  const resultKey = String(payload.result_key || '').trim();
  const resultLabel = String(payload.quiz_result || '').trim();
  const resultLink = String(payload.quiz_result_link || '').trim();

  if (
    !firstName ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !VALID_RESULTS.has(resultKey) ||
    !resultLabel ||
    !resultLink.startsWith('https://scquiz.wendyleechu.com/')
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Please provide valid quiz details.' })
    };
  }

  if (!KIT_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Kit integration is not configured.' })
    };
  }

  try {
    const response = await fetch(
      `https://api.convertkit.com/v3/forms/${KIT_FORM_ID}/subscribe`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: KIT_API_KEY,
          email,
          first_name: firstName,
          fields: {
            quiz_result: resultLabel,
            quiz_result_link: resultLink
          }
        })
      }
    );

    const responseBody = await response.json().catch(() => null);
    const subscriber =
      responseBody?.subscription?.subscriber || responseBody?.subscriber;

    if (!response.ok || !subscriber?.id) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'Kit could not save this subscriber.' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  } catch {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Unable to reach Kit.' })
    };
  }
};
