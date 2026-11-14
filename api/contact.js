const { createHmac } = require('node:crypto');

const MAX_BYTES = 32768;
const EMAIL = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
const LIMIT_SCRIPT = `
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], 600) end
-- An exhausted IP must not spend another global attempt. Keep this inside EVAL.
if n > 5 then return {n, 1} end
local total = redis.call('INCR', KEYS[2])
if total == 1 then redis.call('EXPIRE', KEYS[2], 86400) end
return {n, total}`;

// Shared Redis counters, not instance-local memory: five attempts per IP/10 min,
// plus 40 globally/day. No raw IP address or message is stored in Redis.
async function checkRateLimit({ fetchImpl, env, ip, now }) {
  const digest = createHmac('sha256', env.CONTACT_RATE_LIMIT_SALT).update(ip).digest('hex');
  const day = new Date(now()).toISOString().slice(0, 10);
  const response = await fetchImpl(env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['EVAL', LIMIT_SCRIPT, '2', `portfolio:ip:${digest}`, `portfolio:day:${day}`]),
    signal: AbortSignal.timeout(3000)
  });
  if (!response.ok) throw new Error('Rate limiter unavailable');
  const data = await response.json();
  if (data.error || !Array.isArray(data.result) || data.result.length !== 2 ||
      !data.result.every(n => Number.isInteger(n) && n > 0)) throw new Error('Invalid rate response');
  return data.result[0] <= 5 && data.result[1] <= 40;
}

function validConfig(env) {
  try {
    const redis = new URL(env.UPSTASH_REDIS_REST_URL);
    return env.CONTACT_ENABLED === 'true' && !!env.RESEND_API_KEY &&
      EMAIL.test(env.CONTACT_FROM_EMAIL || '') &&
      !/(?:\.example|@resend\.dev)$/i.test(env.CONTACT_FROM_EMAIL) &&
      redis.protocol === 'https:' && !redis.username && !redis.password &&
      !!env.UPSTASH_REDIS_REST_TOKEN && (env.CONTACT_RATE_LIMIT_SALT || '').length >= 32;
  } catch { return false; }
}

function createHandler({ env = process.env, fetchImpl = globalThis.fetch, now = Date.now } = {}) {
  return async function contact(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const reply = (code, error) => res.status(code).json({ ok: false, error });
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return reply(405, 'Use POST to submit a message.');
    }
    const allowed = (env.CONTACT_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    // VERCEL_URL is supplied by Vercel, not by the requester; preview origin is exact.
    if (env.VERCEL_URL) allowed.push(`https://${env.VERCEL_URL}`);
    const origin = req.headers.origin;
    if (!origin || !allowed.includes(origin)) return reply(403, 'This origin is not permitted.');
    if ((req.headers['content-type'] || '').split(';')[0].trim() !== 'application/json') {
      return reply(415, 'Send a JSON message.');
    }
    if (Number(req.headers['content-length']) > MAX_BYTES) return reply(413, 'Your message is too large.');
    let raw, values;
    try {
      raw = req.body;
      if (Buffer.isBuffer(raw)) raw = raw.toString('utf8');
      if (typeof raw === 'string') {
        if (Buffer.byteLength(raw) > MAX_BYTES) return reply(413, 'Your message is too large.');
        raw = JSON.parse(raw);
      }
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return reply(400, 'Invalid message format.');
      if (Buffer.byteLength(JSON.stringify(raw)) > MAX_BYTES) return reply(413, 'Your message is too large.');
      if (Object.keys(raw).some(key => !['name','email','subject','message','bot-field'].includes(key))) {
        return reply(400, 'Unexpected message fields.');
      }
      if (raw['bot-field'] !== undefined && typeof raw['bot-field'] !== 'string') return reply(400, 'Invalid message format.');
      if (raw['bot-field']?.trim()) return reply(400, 'Your message could not be submitted.');
      values = {};
      for (const [key, max] of Object.entries({ name: 100, email: 254, subject: 200, message: 5000 })) {
        if (typeof raw[key] !== 'string') return reply(400, `Please enter your ${key}.`);
        const value = raw[key].trim();
        if (!value || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) ||
            (key !== 'message' && /[\r\n]/.test(value))) return reply(400, `Please check your ${key}.`);
        values[key] = value;
      }
      const localPart = values.email.split('@')[0];
      if (!EMAIL.test(values.email) || localPart.length > 64 || localPart.startsWith('.') ||
          localPart.endsWith('.') || localPart.includes('..')) return reply(400, 'Please enter a valid email address.');
    } catch { return reply(400, 'Invalid JSON message.'); }
    const requestId = req.headers['idempotency-key'];
    if (typeof requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
      return reply(400, 'Please reload the page and try again.');
    }
    if (!validConfig(env)) return reply(503, 'Contact email is not configured yet. Please email sathvidhu@gmail.com.');
    try {
      const ip = String(req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
      if (!await checkRateLimit({ fetchImpl, env, ip, now })) {
        res.setHeader('Retry-After', '600');
        return reply(429, 'Too many attempts. Please try later or email sathvidhu@gmail.com.');
      }
    } catch { return reply(503, 'Contact email is temporarily unavailable. Please try later.'); }
    const payload = {
      from: env.CONTACT_FROM_EMAIL,
      to: ['sathvidhu@gmail.com'],
      reply_to: values.email,
      subject: `Portfolio: ${values.subject}`,
      // Plain text avoids interpreting any visitor input as HTML.
      text: `Name: ${values.name}\nEmail: ${values.email}\nSubject: ${values.subject}\n\n${values.message}`
    };
    const key = createHmac('sha256', env.CONTACT_RATE_LIMIT_SALT)
      .update(requestId + JSON.stringify(payload)).digest('hex');
    try {
      const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `portfolio/${key}` },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });
      const result = await response.json();
      if (!response.ok || typeof result.id !== 'string' || !result.id) {
        return reply(502, 'The email service could not accept your message. Please try later.');
      }
      return res.status(200).json({ ok: true });
    } catch (error) {
      return reply(error.name === 'TimeoutError' || error.name === 'AbortError' ? 504 : 502,
        'We could not confirm acceptance. Please retry without editing the message, or email sathvidhu@gmail.com.');
    }
  };
}

module.exports = createHandler();
module.exports.createHandler = createHandler;
