/**
 * GET  /api/content  → returns current content from Netlify Blobs
 *                      (falls back to bundled server/content.json on first run)
 * PUT  /api/content  → saves new content (requires Authorization: Bearer <token>)
 */

const fs = require('fs');
const path = require('path');
const { getStore } = require('@netlify/blobs');
const { verifyToken, getTokenFromEvent } = require('./_auth');

const STORE_NAME = 'dimora-ghid';
const BLOB_KEY = 'content';
// Path is resolved relative to the bundled function. Netlify includes the file
// via netlify.toml [functions].included_files.
const SEED_PATH = path.join(__dirname, '..', '..', 'server', 'content.json');

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

function readSeed() {
  try {
    return JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  } catch {
    return null;
  }
}

async function getContent() {
  const store = getStore(STORE_NAME);
  const blob = await store.get(BLOB_KEY, { type: 'json' });
  if (blob) return blob;
  // First run — return seed without persisting yet (admin save will persist)
  return readSeed() || {};
}

async function saveContent(data) {
  const store = getStore(STORE_NAME);
  // Optional: keep a timestamped backup
  const existing = await store.get(BLOB_KEY, { type: 'json' });
  if (existing) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await store.setJSON(`backups/${stamp}`, existing);
  }
  await store.setJSON(BLOB_KEY, data);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  if (event.httpMethod === 'GET') {
    try {
      const content = await getContent();
      return {
        statusCode: 200,
        headers: { ...cors, 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: cors,
        body: JSON.stringify({ error: 'Failed to read content', detail: err.message })
      };
    }
  }

  if (event.httpMethod === 'PUT') {
    const token = getTokenFromEvent(event);
    if (!verifyToken(token)) {
      return { statusCode: 401, headers: cors, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }
    if (!body || typeof body !== 'object') {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Invalid content body' }) };
    }
    try {
      await saveContent(body);
      return {
        statusCode: 200,
        headers: { ...cors, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, savedAt: new Date().toISOString() })
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: cors,
        body: JSON.stringify({ error: 'Failed to save', detail: err.message })
      };
    }
  }

  return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method not allowed' }) };
};
