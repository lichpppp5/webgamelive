// ════════════════════════════════════════════════════════════════
// ADMIN AUTH — server-side login for the admin panel
//
// - Password is never stored in plain text: only a scrypt hash, read from
//   (1) env ADMIN_PASSWORD_HASH, or (2) server/admin-auth.json (created by
//   `node server/set-admin-password.js`).
// - Login returns a short-lived token signed with a secret that is generated
//   on the server and kept in the database (never in git).
// - requireAdminFor(app) protects /api/admin/* and every write route of the
//   content API. Public routes (games' license verify/ping, site browsing,
//   visit/download counters) are left untouched.
// ════════════════════════════════════════════════════════════════
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'admin-auth.json');
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const SCRYPT = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function hashPassword(password, saltHex = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 64, SCRYPT).toString('hex');
  return `scrypt$${SCRYPT.N}$${saltHex}$${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [algo, n, saltHex, hashHex] = String(stored).split('$');
    if (algo !== 'scrypt' || !saltHex || !hashHex) return false;
    const actual = crypto.scryptSync(String(password), Buffer.from(saltHex, 'hex'), 64, { ...SCRYPT, N: parseInt(n, 10) || SCRYPT.N });
    const expected = Buffer.from(hashHex, 'hex');
    return expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function loadCredentials() {
  if (process.env.ADMIN_PASSWORD_HASH) {
    return { username: process.env.ADMIN_USERNAME || 'admin', passwordHash: process.env.ADMIN_PASSWORD_HASH };
  }
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    if (cfg.username && cfg.passwordHash) return cfg;
  } catch { /* not configured */ }
  return null;
}

// ── Routes that need an admin token ──
const PUBLIC_WRITE = /^\/api\/(products|articles|software)\/[^/]+\/(download|view)$/;
function needsAdmin(req) {
  const p = req.path;
  if (p === '/api/admin/login') return false;
  if (p.startsWith('/api/admin/')) return true;
  if (p === '/api/upload') return true;
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return false;
  if (p === '/api/settings') return true;
  if (/^\/api\/(products|articles|software)(\/|$)/.test(p)) return !PUBLIC_WRITE.test(p);
  return false;
}

// getDb: () => sqlite db. A getter, because the guard must be registered before every
// route in index.js — including ones declared above the `const db = ...` line.
function setupAdminAuth(app, getDb) {
  // Session-signing secret: generated once, stored in the DB settings table
  let secret = null;
  function loadSecret() {
    const db = getDb();
    db.get("SELECT value FROM settings WHERE key = 'admin_session_secret'", (err, row) => {
      if (err) return setTimeout(loadSecret, 1000); // settings table not created yet (fresh DB)
      if (row && row.value) { secret = row.value; return; }
      const fresh = crypto.randomBytes(32).toString('hex');
      db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_session_secret', ?)", [fresh], (e) => {
        if (e) return setTimeout(loadSecret, 1000);
        secret = fresh;
      });
    });
  }
  setImmediate(loadSecret); // after index.js has finished creating the db

  const sign = (payload) => crypto.createHmac('sha256', secret).update(payload).digest('base64url');

  function issueToken(username) {
    const payload = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
    return `${payload}.${sign(payload)}`;
  }

  function checkToken(token) {
    if (!secret || !token) return null;
    const [payload, sig] = String(token).split('.');
    if (!payload || !sig) return null;
    const expected = sign(payload);
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    try {
      const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      return data.exp > Date.now() ? data : null;
    } catch {
      return null;
    }
  }

  // Simple per-IP brute-force limit: 8 failed logins per 15 minutes
  const failures = new Map();
  const WINDOW = 15 * 60 * 1000, MAX_FAILS = 8;
  const clientIp = (req) => (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';

  app.post('/api/admin/login', (req, res) => {
    const ip = clientIp(req);
    const now = Date.now();
    const f = failures.get(ip);
    if (f && now - f.first < WINDOW && f.count >= MAX_FAILS) {
      return res.status(429).json({ success: false, error: 'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.' });
    }
    const creds = loadCredentials();
    if (!creds) {
      return res.status(503).json({ success: false, error: 'Chưa cấu hình mật khẩu admin trên server (chạy: node server/set-admin-password.js).' });
    }
    const { username, password } = req.body || {};
    const ok = typeof username === 'string' && typeof password === 'string' &&
      username === creds.username && verifyPassword(password, creds.passwordHash);
    if (!ok) {
      const rec = f && now - f.first < WINDOW ? f : { first: now, count: 0 };
      rec.count++;
      failures.set(ip, rec);
      return res.status(401).json({ success: false, error: 'Sai tên đăng nhập hoặc mật khẩu!' });
    }
    failures.delete(ip);
    res.json({ success: true, token: issueToken(creds.username), expiresIn: TOKEN_TTL_MS });
  });

  // Guard: must be registered before the API routes
  app.use((req, res, next) => {
    if (!needsAdmin(req)) return next();
    const auth = req.headers.authorization || '';
    const session = checkToken(auth.startsWith('Bearer ') ? auth.slice(7) : '');
    if (!session) {
      return res.status(401).json({ success: false, error: 'Phiên đăng nhập admin không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.' });
    }
    req.admin = session;
    next();
  });

  app.get('/api/admin/session', (req, res) => res.json({ success: true, username: req.admin.u, exp: req.admin.exp }));
}

module.exports = { setupAdminAuth, hashPassword, verifyPassword, needsAdmin };
