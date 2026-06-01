/**
 * GET  /api/content  → returns current content from Netlify Blobs
 *                      (falls back to bundled server/content.json on first run)
 * PUT  /api/content  → saves new content (requires Authorization: Bearer <token>)
 */

const fs = require('fs');
const path = require('path');
const { getStore, connectLambda } = require('@netlify/blobs');
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
  // Optional: keep a timestamped backup. Wrapped in try/catch so a backup
  // failure (e.g. nested-key restrictions) doesn't block the actual save.
  try {
    const existing = await store.get(BLOB_KEY, { type: 'json' });
    if (existing) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      await store.setJSON(`backup-${stamp}`, existing);
    }
  } catch (backupErr) {
    console.warn('Backup failed (continuing with save):', backupErr.message);
  }
  await store.setJSON(BLOB_KEY, data);
}

exports.handler = async (event) => {
  // Required for @netlify/blobs to work in classic Lambda handler mode.
  // Wires the per-request Netlify context (siteID, token) into the SDK.
  connectLambda(event);

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
      console.error('SAVE FAILED:', err);
      console.error('Stack:', err.stack);
      return {
        statusCode: 500,
        headers: cors,
        body: JSON.stringify({
          error: 'Failed to save',
          detail: err.message,
          code: err.code || err.name,
          hint: 'Check Netlify Functions logs for stack trace'
        })
      };
    }
  }

  return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method not allowed' }) };
};
