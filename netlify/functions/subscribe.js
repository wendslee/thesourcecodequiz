const KIT_FORM_ID = '9730729';
const KIT_API_KEY = process.env.KIT_API_KEY;
const VALID_RESULTS = new Set(['worth', 'approval', 'readiness', 'guilt']);
const ALLOWED_RESULT_LINK_PREFIXES = [
  'https://scquiz.wendyleechu.com/',
  'https://thesourcecodequiz.netlify.app/'
];
const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 8000;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const getRetryDelay = (response, attempt) => {
  const retryAfterHeader = response.headers.get('retry-after');
  const retryAfter = Number(retryAfterHeader);
  if (
    retryAfterHeader !== null &&
    Number.isFinite(retryAfter) &&
    retryAfter >= 0
  ) {
    return Math.min(retryAfter * 1000, 3000);
  }

  return 350 * 2 ** (attempt - 1);
};

const subscribeToKit = async (subscriberDetails) => {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

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
            ...subscriberDetails
          }),
          signal: controller.signal
        }
      );

      const responseBody = await response.json().catch(() => null);

      if (response.ok) {
        return;
      }

      const kitMessage =
        responseBody?.message ||
        responseBody?.error ||
        responseBody?.errors?.join(', ') ||
        'No error details returned';

      lastError = new Error(`Kit returned ${response.status}: ${kitMessage}`);
      lastError.statusCode = response.status;

      if (!RETRYABLE_STATUS_CODES.has(response.status)) {
        throw lastError;
      }

      console.warn('Kit signup attempt will be retried', {
        attempt,
        statusCode: response.status
      });

      if (attempt < MAX_ATTEMPTS) {
        await wait(getRetryDelay(response, attempt));
      }
    } catch (error) {
      lastError = error;

      if (
        error.statusCode ||
        (error.name !== 'AbortError' && attempt === MAX_ATTEMPTS)
      ) {
        throw error;
      }

      console.warn('Kit signup request will be retried', {
        attempt,
        reason: error.name === 'AbortError' ? 'timeout' : 'network error'
      });

      if (attempt < MAX_ATTEMPTS) {
        await wait(350 * 2 ** (attempt - 1));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error('Kit signup failed');
};

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
!ALLOWED_RESULT_LINK_PREFIXES.some((prefix) => resultLink.startsWith(prefix))  ) {
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
    await subscribeToKit({
      email,
      first_name: firstName,
      fields: {
        quiz_result: resultLabel,
        quiz_result_link: resultLink
      }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    console.error('Kit signup failed after retries', {
      statusCode: error.statusCode || null,
      reason: error.name === 'AbortError' ? 'timeout' : error.message
    });

    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Unable to reach Kit.' })
    };
  }
};
