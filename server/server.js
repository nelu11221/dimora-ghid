/**
 * Dimora del Tramonto — Guest Guide Admin Backend
 *
 * Usage:
 *   ADMIN_PASSWORD=your_password PORT=3001 node server/server.js
 *
 * Endpoints:
 *   GET  /api/content          → returns current content.json
 *   POST /api/login            → body { password }; returns { token } if valid
 *   PUT  /api/content          → header Authorization: Bearer <token>, body = new content; saves to content.json
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');

const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dimora2024';
const CONTENT_PATH = path.join(__dirname, 'content.json');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Active tokens (in-memory; restart invalidates all sessions)
const validTokens = new Set();

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function readContent() {
  return JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf8'));
}

function writeContent(data) {
  // Backup current file before overwriting
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `content-${stamp}.json`);
  if (fs.existsSync(CONTENT_PATH)) {
    fs.copyFileSync(CONTENT_PATH, backupPath);
  }
  fs.writeFileSync(CONTENT_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (err) { reject(err); }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function getToken(req) {
  const auth = req.headers['authorization'] || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /api/content
  if (req.method === 'GET' && req.url === '/api/content') {
    try {
      const content = readContent();
      sendJson(res, 200, content);
    } catch (err) {
      sendJson(res, 500, { error: 'Failed to read content', detail: err.message });
    }
    return;
  }

  // POST /api/login
  if (req.method === 'POST' && req.url === '/api/login') {
    try {
      const body = await readBody(req);
      if (!body.password || body.password !== ADMIN_PASSWORD) {
        sendJson(res, 401, { error: 'Invalid password' });
        return;
      }
      const token = crypto.randomBytes(32).toString('hex');
      validTokens.add(token);
      // Expire tokens after 12h
      setTimeout(() => validTokens.delete(token), 12 * 60 * 60 * 1000);
      sendJson(res, 200, { token });
    } catch (err) {
      sendJson(res, 400, { error: 'Invalid request', detail: err.message });
    }
    return;
  }

  // PUT /api/content (requires auth)
  if (req.method === 'PUT' && req.url === '/api/content') {
    const token = getToken(req);
    if (!token || !validTokens.has(token)) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }
    try {
      const body = await readBody(req);
      if (!body || typeof body !== 'object') {
        sendJson(res, 400, { error: 'Invalid content body' });
        return;
      }
      writeContent(body);
      sendJson(res, 200, { ok: true, savedAt: new Date().toISOString() });
    } catch (err) {
      sendJson(res, 500, { error: 'Failed to save content', detail: err.message });
    }
    return;
  }

  // POST /api/logout
  if (req.method === 'POST' && req.url === '/api/logout') {
    const token = getToken(req);
    if (token) validTokens.delete(token);
    sendJson(res, 200, { ok: true });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`✓ Dimora Ghid admin backend listening on http://localhost:${PORT}`);
  console.log(`  Content file: ${CONTENT_PATH}`);
  console.log(`  Admin password: ${ADMIN_PASSWORD === 'dimora2024' ? '(default — change via ADMIN_PASSWORD env var!)' : '(custom)'}`);
});
