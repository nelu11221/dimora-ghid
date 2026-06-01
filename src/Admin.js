import React, { useState, useEffect, useCallback } from 'react';
import Icon from './Icon';
import defaultContent from './defaultContent.json';
import './Admin.css';

const LANGS = ['en', 'it', 'de'];

const ICON_SUGGESTIONS = [
  'clock', 'wifi', 'car', 'snowflake', 'utensils', 'washer', 'bed',
  'wine', 'wheat', 'waves', 'sunset', 'croissant', 'moon', 'coffee',
  'volumeOff', 'shield', 'bug', 'baby', 'flame', 'sparkles', 'paw', 'noSmoking',
  'utensilsCrossed', 'cart', 'pill', 'landmark', 'phone', 'mapPin', 'zap', 'chevronDown'
];

// ─── Small reusable inputs ─────────────────────────────────────

function MultilangInput({ label, value, onChange, multiline = false }) {
  const safeValue = value || {};
  return (
    <div className="ml-input">
      {label && <label className="ml-label">{label}</label>}
      <div className="ml-grid">
        {LANGS.map(lang => (
          <div className="ml-field" key={lang}>
            <span className="ml-lang">{lang.toUpperCase()}</span>
            {multiline ? (
              <textarea
                value={safeValue[lang] || ''}
                onChange={e => onChange({ ...safeValue, [lang]: e.target.value })}
                rows={3}
              />
            ) : (
              <input
                type="text"
                value={safeValue[lang] || ''}
                onChange={e => onChange({ ...safeValue, [lang]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function IconInput({ value, onChange }) {
  return (
    <div className="icon-input">
      <label className="ml-label">Icon</label>
      <div className="icon-row">
        <div className="icon-preview"><Icon name={value || 'wine'} size={22} strokeWidth={1.5} /></div>
        <input
          list="icon-suggestions"
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. wine"
        />
      </div>
      <datalist id="icon-suggestions">
        {ICON_SUGGESTIONS.map(name => <option key={name} value={name} />)}
      </datalist>
    </div>
  );
}

function CardActions({ onDelete, onMoveUp, onMoveDown, idx, total }) {
  return (
    <div className="card-actions">
      <button type="button" onClick={onMoveUp} disabled={idx === 0} title="Move up">↑</button>
      <button type="button" onClick={onMoveDown} disabled={idx === total - 1} title="Move down">↓</button>
      <button type="button" className="danger" onClick={onDelete} title="Delete">✕</button>
    </div>
  );
}

// ─── Login screen ──────────────────────────────────────────────

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        setError('Wrong password');
        setLoading(false);
        return;
      }
      const data = await res.json();
      localStorage.setItem('dimora_admin_token', data.token);
      onLogin(data.token);
    } catch (err) {
      setError('Connection error. Is the backend running on :3001?');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form onSubmit={submit} className="admin-login-card">
        <h1>Dimora del Tramonto</h1>
        <p className="admin-login-sub">Admin Access</p>
        <input
          type="password"
          autoFocus
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="admin-error">{error}</div>}
        <button type="submit" disabled={loading || !password}>
          {loading ? 'Signing in…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}

// ─── Editor screen ─────────────────────────────────────────────

function Editor({ token, onLogout }) {
  const [content, setContent] = useState(null);
  const [tab, setTab] = useState('contact');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  // Load
  useEffect(() => {
    fetch('/api/content')
      .then(r => r.ok ? r.json() : defaultContent)
      .then(setContent)
      .catch(() => setContent(defaultContent));
  }, []);

  // Warn on unload if dirty
  useEffect(() => {
    const handler = (e) => {
      if (dirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const update = useCallback((updater) => {
    setContent(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return next;
    });
    setDirty(true);
  }, []);

  const save = async () => {
    if (!content) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(content)
      });
      if (res.status === 401) {
        localStorage.removeItem('dimora_admin_token');
        onLogout();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.detail ? `${data.error || 'Save failed'} — ${data.detail}` : (data.error || `Save failed (HTTP ${res.status})`);
        setError(msg);
        setSaving(false);
        return;
      }
      const data = await res.json();
      setSavedAt(new Date(data.savedAt));
      setDirty(false);
    } catch (err) {
      setError('Connection error');
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('dimora_admin_token');
    onLogout();
  };

  if (!content) return <div className="admin-loading">Loading…</div>;

  const tabs = [
    { id: 'contact', label: 'Contact' },
    { id: 'texts', label: 'Page Texts' },
    { id: 'house', label: 'House Info' },
    { id: 'outdoor', label: 'Outdoor' },
    { id: 'moments', label: 'Moments' },
    { id: 'rules', label: 'Rules' },
    { id: 'local', label: 'Local Recs' }
  ];

  return (
    <div className="admin">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div>
            <h1>Admin Panel</h1>
            <span className="admin-subtitle">Dimora del Tramonto Toscano</span>
          </div>
          <div className="admin-header-actions">
            {dirty && <span className="dirty-badge">Unsaved changes</span>}
            {savedAt && !dirty && <span className="saved-badge">Saved {savedAt.toLocaleTimeString()}</span>}
            <button className="btn-save" onClick={save} disabled={saving || !dirty}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button className="btn-secondary" onClick={logout}>Logout</button>
          </div>
        </div>
        {error && <div className="admin-error-bar">{error}</div>}
      </header>

      <nav className="admin-tabs">
        {tabs.map(tb => (
          <button
            key={tb.id}
            className={`admin-tab ${tab === tb.id ? 'active' : ''}`}
            onClick={() => setTab(tb.id)}
          >
            {tb.label}
          </button>
        ))}
      </nav>

      <main className="admin-content">
        {tab === 'contact' && <ContactTab content={content} update={update} />}
        {tab === 'texts' && <TextsTab content={content} update={update} />}
        {tab === 'house' && <CardListTab field="houseInfo" content={content} update={update} type="houseInfo" />}
        {tab === 'outdoor' && <CardListTab field="outdoor" content={content} update={update} type="outdoor" />}
        {tab === 'moments' && <CardListTab field="favoriteMoments" content={content} update={update} type="moments" />}
        {tab === 'rules' && <CardListTab field="rules" content={content} update={update} type="rules" />}
        {tab === 'local' && <CardListTab field="localRecs" content={content} update={update} type="local" />}
      </main>
    </div>
  );
}

// ─── Contact tab ───────────────────────────────────────────────

function ContactTab({ content, update }) {
  const c = content.contact || {};
  const set = (k, v) => update(prev => ({ ...prev, contact: { ...prev.contact, [k]: v } }));
  return (
    <section className="admin-section">
      <h2>Contact Information</h2>
      <div className="admin-form-grid">
        <div className="form-row">
          <label>Phone (E.164 — used in tel: link)</label>
          <input type="text" value={c.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+393280661800" />
        </div>
        <div className="form-row">
          <label>Phone (display)</label>
          <input type="text" value={c.phoneDisplay || ''} onChange={e => set('phoneDisplay', e.target.value)} placeholder="+39 328 066 1800" />
        </div>
        <div className="form-row">
          <label>Address</label>
          <input type="text" value={c.address || ''} onChange={e => set('address', e.target.value)} />
        </div>
        <div className="form-row">
          <label>Wi-Fi Network name</label>
          <input type="text" value={c.wifiNetwork || ''} onChange={e => set('wifiNetwork', e.target.value)} />
          <small>This is informational. To update the Wi-Fi shown on the page, edit the Wi-Fi card under <strong>House Info</strong>.</small>
        </div>
      </div>
    </section>
  );
}

// ─── Texts tab ─────────────────────────────────────────────────

function TextsTab({ content, update }) {
  const trans = content.translations || {};
  const keys = Object.keys(trans);

  const setKey = (key, value) => update(prev => ({
    ...prev,
    translations: { ...prev.translations, [key]: value }
  }));

  // Group keys for readability
  const groups = [
    { label: 'Navigation', match: k => k.startsWith('nav') || k === 'assistance' },
    { label: 'Hero', match: k => k.startsWith('hero') },
    { label: 'Arrival', match: k => k.startsWith('arrival') },
    { label: 'House Info section', match: k => k.startsWith('houseInfo') },
    { label: 'Outdoor section', match: k => k.startsWith('outdoor') },
    { label: 'Moments section', match: k => k.startsWith('moments') },
    { label: 'Rules section', match: k => k.startsWith('rules') },
    { label: 'Local Recs section', match: k => k.startsWith('local') },
    { label: 'Electricity', match: k => k.startsWith('electricity') },
    { label: 'Assistance card', match: k => k.startsWith('assistance') || k === 'callUs' },
    { label: 'Footer', match: k => k.startsWith('footer') }
  ];
  const assigned = new Set();
  const grouped = groups.map(g => {
    const matched = keys.filter(k => !assigned.has(k) && g.match(k));
    matched.forEach(k => assigned.add(k));
    return { ...g, keys: matched };
  });
  const remaining = keys.filter(k => !assigned.has(k));
  if (remaining.length) grouped.push({ label: 'Other', keys: remaining });

  return (
    <section className="admin-section">
      <h2>Page Texts</h2>
      <p className="admin-section-hint">Edit translations across all three languages. The key name is shown for reference.</p>
      {grouped.filter(g => g.keys.length).map(g => (
        <details key={g.label} className="text-group" open>
          <summary>{g.label} <span className="count">({g.keys.length})</span></summary>
          <div className="text-group-body">
            {g.keys.map(k => (
              <MultilangInput key={k} label={k} value={trans[k]} onChange={v => setKey(k, v)} multiline={isLongText(trans[k])} />
            ))}
          </div>
        </details>
      ))}
    </section>
  );
}

function isLongText(value) {
  if (!value) return false;
  return Object.values(value).some(v => v && v.length > 80);
}

// ─── Card list tab (generic) ───────────────────────────────────

function CardListTab({ field, content, update, type }) {
  const list = content[field] || [];

  const setList = (next) => update(prev => ({ ...prev, [field]: next }));

  const addCard = () => {
    const blank = blankCard(type);
    setList([...list, blank]);
  };

  const updateCard = (idx, patch) => {
    const next = [...list];
    next[idx] = typeof patch === 'function' ? patch(next[idx]) : { ...next[idx], ...patch };
    setList(next);
  };

  const deleteCard = (idx) => {
    if (!window.confirm('Delete this card?')) return;
    setList(list.filter((_, i) => i !== idx));
  };

  const move = (idx, dir) => {
    const next = [...list];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setList(next);
  };

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h2>{labelFor(type)}</h2>
        <button className="btn-add" onClick={addCard}>+ Add card</button>
      </div>
      {list.length === 0 && <p className="admin-empty">No items yet — click "Add card".</p>}
      <div className="cards-list">
        {list.map((card, idx) => (
          <CardEditor
            key={idx}
            card={card}
            idx={idx}
            total={list.length}
            type={type}
            onUpdate={(patch) => updateCard(idx, patch)}
            onDelete={() => deleteCard(idx)}
            onMoveUp={() => move(idx, -1)}
            onMoveDown={() => move(idx, 1)}
          />
        ))}
      </div>
    </section>
  );
}

function labelFor(type) {
  return ({
    houseInfo: 'House Info Cards',
    outdoor: 'Outdoor Areas',
    moments: 'Favorite Moments',
    rules: 'House Rules',
    local: 'Local Recommendations'
  })[type] || type;
}

function blankCard(type) {
  const emptyTrans = { en: '', it: '', de: '' };
  switch (type) {
    case 'houseInfo':
      return { icon: 'wine', title: { ...emptyTrans }, description: { ...emptyTrans } };
    case 'outdoor':
      return { icon: 'wine', image: '/images/slide1.jpg', title: { ...emptyTrans }, description: { ...emptyTrans } };
    case 'moments':
      return { icon: 'sunset', text: { ...emptyTrans } };
    case 'rules':
      return { icon: 'shield', title: { ...emptyTrans }, text: { ...emptyTrans } };
    case 'local':
      return { icon: 'wine', title: { ...emptyTrans }, places: [] };
    default:
      return {};
  }
}

function CardEditor({ card, idx, total, type, onUpdate, onDelete, onMoveUp, onMoveDown }) {
  const titleStr = (card.title && (card.title.en || card.title.it || card.title.de)) || (card.text && card.text.en) || `Card ${idx + 1}`;

  return (
    <div className="card-editor">
      <div className="card-editor-head">
        <span className="card-num">#{idx + 1}</span>
        <strong className="card-title-preview">{titleStr || `Card ${idx + 1}`}</strong>
        <CardActions onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown} idx={idx} total={total} />
      </div>
      <div className="card-editor-body">
        <IconInput value={card.icon} onChange={v => onUpdate({ icon: v })} />

        {type === 'outdoor' && (
          <div className="form-row">
            <label>Image URL (relative to /public, e.g. /images/slide1.jpg)</label>
            <input type="text" value={card.image || ''} onChange={e => onUpdate({ image: e.target.value })} />
          </div>
        )}

        {card.title !== undefined && (
          <MultilangInput label="Title" value={card.title} onChange={v => onUpdate({ title: v })} />
        )}

        {card.description !== undefined && (
          <MultilangInput label="Description" value={card.description} onChange={v => onUpdate({ description: v })} multiline />
        )}

        {card.text !== undefined && type === 'rules' && (
          <MultilangInput label="Text" value={card.text} onChange={v => onUpdate({ text: v })} multiline />
        )}

        {card.text !== undefined && type === 'moments' && (
          <MultilangInput label="Text" value={card.text} onChange={v => onUpdate({ text: v })} />
        )}

        {type === 'houseInfo' && (
          <ItemsEditor card={card} onUpdate={onUpdate} />
        )}

        {type === 'local' && (
          <PlacesEditor card={card} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  );
}

// House info — optional list of key/value items
function ItemsEditor({ card, onUpdate }) {
  const items = card.items || [];
  const setItems = (next) => onUpdate({ items: next });

  const addItem = () => setItems([...items, { label: { en: '', it: '', de: '' }, value: { en: '', it: '', de: '' } }]);
  const removeItem = (i) => setItems(items.filter((_, j) => j !== i));
  const updateItem = (i, patch) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    setItems(next);
  };

  return (
    <div className="subitems">
      <div className="subitems-head">
        <label>Items (key / value pairs, e.g. Check-in → From 16:00)</label>
        <button type="button" className="btn-add-sm" onClick={addItem}>+ Add item</button>
      </div>
      {items.length === 0 && <small className="hint">No items. This card will show only the description.</small>}
      {items.map((item, i) => (
        <div className="subitem" key={i}>
          <div className="subitem-head">
            <span>Item {i + 1}</span>
            <button type="button" className="danger" onClick={() => removeItem(i)}>✕</button>
          </div>
          <MultilangInput label="Label" value={item.label} onChange={v => updateItem(i, { label: v })} />
          <MultilangInput label="Value" value={item.value} onChange={v => updateItem(i, { value: v })} />
        </div>
      ))}
    </div>
  );
}

// Local recs — list of places per category
function PlacesEditor({ card, onUpdate }) {
  const places = card.places || [];
  const setPlaces = (next) => onUpdate({ places: next });

  const addPlace = () => setPlaces([...places, { name: '', note: { en: '', it: '', de: '' } }]);
  const removePlace = (i) => setPlaces(places.filter((_, j) => j !== i));
  const updatePlace = (i, patch) => {
    const next = [...places];
    next[i] = { ...next[i], ...patch };
    setPlaces(next);
  };
  const movePlace = (i, dir) => {
    const next = [...places];
    const target = i + dir;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    setPlaces(next);
  };

  return (
    <div className="subitems">
      <div className="subitems-head">
        <label>Places in this category</label>
        <button type="button" className="btn-add-sm" onClick={addPlace}>+ Add place</button>
      </div>
      {places.length === 0 && <small className="hint">No places yet.</small>}
      {places.map((place, i) => (
        <div className="subitem" key={i}>
          <div className="subitem-head">
            <span>Place {i + 1}</span>
            <div className="card-actions">
              <button type="button" onClick={() => movePlace(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" onClick={() => movePlace(i, 1)} disabled={i === places.length - 1}>↓</button>
              <button type="button" className="danger" onClick={() => removePlace(i)}>✕</button>
            </div>
          </div>
          <div className="form-row">
            <label>Name (single language — proper noun)</label>
            <input type="text" value={place.name || ''} onChange={e => updatePlace(i, { name: e.target.value })} />
          </div>
          <MultilangInput label="Note / description" value={place.note} onChange={v => updatePlace(i, { note: v })} />
        </div>
      ))}
    </div>
  );
}

// ─── Top-level Admin component ────────────────────────────────

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('dimora_admin_token'));

  if (!token) {
    return <Login onLogin={setToken} />;
  }
  return <Editor token={token} onLogout={() => setToken(null)} />;
}
