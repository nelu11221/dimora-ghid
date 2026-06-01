# Dimora Ghid — Admin Panel

Hidden admin interface for editing all page content (texts, cards, rules, recommendations). Two deployment modes:

| Mode | Storage | Use when |
|------|---------|----------|
| **Local dev** | `server/content.json` file | Editing locally on your laptop |
| **Production (Netlify)** | Netlify Blobs (cloud KV) | Live site for guests |

The frontend code is identical in both — it always fetches `/api/content`. The backend changes.

---

## Local development (laptop)

You need **2 terminals**.

```bash
# Terminal 1 — local backend (writes to server/content.json)
cd dimora-ghid
ADMIN_PASSWORD="your-password" npm run server

# Terminal 2 — React dev server
cd dimora-ghid
npm start
```

- Public guide: <http://localhost:3000>
- Admin login: <http://localhost:3000/admin-tramonto-7k9x>

(Default password if you skip `ADMIN_PASSWORD`: `dimora2024` — **change before deploying**.)

---

## Production on Netlify

Netlify is **static hosting** — it doesn't run `server/server.js`. Instead, the admin API is reimplemented as **Netlify Functions** (`netlify/functions/`) that read/write to **Netlify Blobs** (free KV storage built into Netlify).

### One-time setup

1. **Push the repo to GitHub** (or GitLab/Bitbucket).
2. On Netlify dashboard → **Add new site → Import from Git** → pick this repo.
3. Netlify auto-detects build settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Functions directory: `netlify/functions`
4. Before the first deploy, go to **Site settings → Environment variables** and add:

   | Variable | Value | Purpose |
   |----------|-------|---------|
   | `ADMIN_PASSWORD` | a strong password | Required to log into `/admin-tramonto-7k9x` |
   | `ADMIN_TOKEN_SECRET` | a long random string (64+ chars) | HMAC secret used to sign session tokens |

   Generate the secret with: `openssl rand -hex 32` (or any password manager).

5. Trigger deploy. Netlify builds the React app, deploys the static files, and registers the functions.

### What lives where after deploy

```
yourdomain.netlify.app/                     ← React app (static build)
yourdomain.netlify.app/admin-tramonto-7k9x  ← React app (admin route)
yourdomain.netlify.app/api/content          ← Function (GET/PUT)
yourdomain.netlify.app/api/login            ← Function (POST)
```

The `/api/*` URLs are rewritten to `/.netlify/functions/*` by `netlify.toml`.

### How data persists

- First time anyone visits the public guide, the function returns the bundled `server/content.json` (the seed).
- When you save changes from `/admin-tramonto-7k9x`, the function writes to **Netlify Blobs** under key `dimora-ghid:content`.
- All subsequent visitors see the saved data.
- Each save also keeps a timestamped backup under `dimora-ghid:backups/<timestamp>`.

Blobs persist across deploys and function cold starts. You don't manage any external database.

### Securing the admin

- **Change the secret URL slug**: edit `ADMIN_PATH` in `src/index.js` (default `/admin-tramonto-7k9x`). Anyone with the URL can attempt to log in.
- **Use a strong password**: 16+ chars, not used elsewhere.
- **HTTPS is automatic** on Netlify — never deploy admin over plain HTTP.
- **Tokens expire after 12h** (configurable in `netlify/functions/_auth.js`).
- **No rate limiting on `/api/login`**: if you expect attackers, add a Netlify Edge Function or use a service like Cloudflare to throttle.

---

## Local dev with Netlify Functions (optional)

If you want to test the production code path locally (functions + Blobs) instead of `server.js`:

```bash
npm install -g netlify-cli
netlify dev
```

This serves the React app + functions on the same port (default 8888), with Blobs emulated locally. Useful for catching production-only bugs before deploying.

You'll still need `ADMIN_PASSWORD` and `ADMIN_TOKEN_SECRET` set — either export them in your shell or use `netlify env:set`.

---

## File map

```
dimora-ghid/
├── netlify.toml                # Build config + /api/* redirect to functions
├── netlify/functions/
│   ├── _auth.js                # HMAC token sign/verify (stateless)
│   ├── login.js                # POST /api/login
│   └── content.js              # GET/PUT /api/content (uses Netlify Blobs)
├── server/
│   ├── server.js               # Local dev backend (writes to filesystem)
│   ├── content.json            # Seed content (also used by functions on first run)
│   └── backups/                # Local dev backups
├── src/
│   ├── index.js                # Routes between App and Admin by URL
│   ├── App.js                  # Public guide (fetches /api/content)
│   ├── Admin.js                # Login + editor
│   ├── Admin.css
│   ├── App.css
│   ├── Icon.js
│   └── defaultContent.json     # Bundled fallback (if API unreachable)
└── package.json                # `proxy: http://localhost:3001` for local dev
```

---

## What's editable from `/admin-tramonto-7k9x`

| Tab | Edits |
|-----|-------|
| **Contact** | Phone (link target), phone display, address, Wi-Fi name |
| **Page Texts** | All translation strings, grouped, ×3 languages |
| **House Info** | Add/remove/reorder cards. Icon, title, description, key/value items |
| **Outdoor** | Cards with image URL, icon, title, description |
| **Moments** | Icon + short text per language |
| **Rules** | Icon, title, full text (collapsible on the page) |
| **Local Recs** | Categories with nested place lists (name + multilingual note) |

Unsaved changes show a yellow badge. Closing the tab while dirty triggers a browser confirmation.
