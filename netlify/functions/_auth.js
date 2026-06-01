// Shared HMAC token helpers.
// Stateless: token = base64url(payload).base64url(hmac).  Functions can't keep
// in-memory sessions because each invocation is a cold start.

const crypto = require('crypto');

const SECRET = process.env.ADMIN_TOKEN_SECRET || 'CHANGE-ME-IN-NETLIFY-ENV-VARS';
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function signToken() {
  const payload = { exp: Date.now() + TOKEN_TTL_MS };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const [data, sig] = token.split('.');
  if (!data || !sig) return false;
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  // constant-time compare
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

function getTokenFromEvent(event) {
  const auth = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

module.exports = { signToken, verifyToken, getTokenFromEvent };
