const KIT_FORM_ID = '9730729';
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

  const formData = new URLSearchParams({
    email_address: email,
    'fields[first_name]': firstName,
    'fields[quiz_result]': resultLabel,
    'fields[quiz_result_link]': resultLink
  });

  try {
    const response = await fetch(
      `https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formData.toString()
      }
    );

    if (!response.ok) {
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
