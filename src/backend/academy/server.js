const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'integrat_dev_secret_change_me';
const SESSION_COOKIE = 'integrat_session';
const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const GRANTS_FILE = path.join(DATA_DIR, 'grants.json');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');

const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@integrat.local').toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function base64urlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(input) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  return Buffer.from(base64 + pad, 'base64').toString('utf8');
}

function signToken(payload, expiresInSeconds = 60 * 60 * 24 * 7) {
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const headerEncoded = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadEncoded = base64urlEncode(JSON.stringify(body));
  const data = `${headerEncoded}.${payloadEncoded}`;
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerEncoded, payloadEncoded, signature] = parts;
  const data = `${headerEncoded}.${payloadEncoded}`;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length) return null;

  const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  if (!isValid) return null;

  try {
    const payload = JSON.parse(base64urlDecode(payloadEncoded));
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

function randomId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashPassword(password, saltHex) {
  const salt = saltHex || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, encoded) {
  const [salt, originalHash] = String(encoded || '').split(':');
  if (!salt || !originalHash) return false;

  const testHash = crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  const originalBuffer = Buffer.from(originalHash);
  const testBuffer = Buffer.from(testHash);
  if (originalBuffer.length !== testBuffer.length) return false;
  return crypto.timingSafeEqual(originalBuffer, testBuffer);
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(COURSES_FILE)) {
    writeJson(COURSES_FILE, [
      {
        id: 'endo-faq',
        title: 'FAQ in Endodontics - Part I',
        description: 'Effective root canal treatment fundamentals.'
      },
      {
        id: 'implant-lab',
        title: 'Precision Implant Lab',
        description: 'Hands-on implant workflows and case planning.'
      }
    ]);
  }

  if (!fs.existsSync(USERS_FILE)) {
    writeJson(USERS_FILE, []);
  }

  if (!fs.existsSync(GRANTS_FILE)) {
    writeJson(GRANTS_FILE, []);
  }

  const users = readJson(USERS_FILE, []);
  const adminExists = users.some((user) => user.role === 'admin');

  if (!adminExists) {
    users.push({
      id: randomId('usr'),
      name: 'Admin',
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    writeJson(USERS_FILE, users);
  }
}

function getUsers() {
  return readJson(USERS_FILE, []);
}

function saveUsers(users) {
  writeJson(USERS_FILE, users);
}

function getCourses() {
  return readJson(COURSES_FILE, []);
}

function getGrants() {
  return readJson(GRANTS_FILE, []);
}

function saveGrants(grants) {
  writeJson(GRANTS_FILE, grants);
}

function currentUser(req) {
  const token = req.cookies[SESSION_COOKIE];
  const payload = verifyToken(token);
  if (!payload?.userId) return null;

  const users = getUsers();
  return users.find((user) => user.id === payload.userId) || null;
}

function setSession(res, user) {
  const token = signToken({ userId: user.id, role: user.role });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
}

function clearSession(res) {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

function authRequired(req, res, next) {
  const user = currentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = user;
  next();
}

function adminRequired(req, res, next) {
  const user = currentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  req.user = user;
  next();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/signup', (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const users = getUsers();
  const exists = users.some((user) => user.email === email);
  if (exists) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const user = {
    id: randomId('usr'),
    name,
    email,
    passwordHash: hashPassword(password),
    role: 'student',
    createdAt: new Date().toISOString()
  };

  users.push(user);
  saveUsers(users);
  setSession(res, user);

  res.status(201).json({ user: sanitizeUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const users = getUsers();
  const user = users.find((item) => item.email === email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  setSession(res, user);
  res.json({ user: sanitizeUser(user) });
});

app.post('/api/auth/logout', (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const user = currentUser(req);
  res.json({ user: user ? sanitizeUser(user) : null });
});

app.get('/api/courses', (_req, res) => {
  res.json({ courses: getCourses() });
});

app.get('/api/courses/:courseId/access', authRequired, (req, res) => {
  const courseId = req.params.courseId;
  const courses = getCourses();
  const course = courses.find((item) => item.id === courseId);

  if (!course) {
    return res.status(404).json({ error: 'Course not found.' });
  }

  if (req.user.role === 'admin') {
    return res.json({ hasAccess: true, course });
  }

  const grants = getGrants();
  const grant = grants.find((item) => item.userId === req.user.id && item.courseId === courseId);

  return res.json({
    hasAccess: Boolean(grant),
    course,
    grantedAt: grant?.grantedAt || null
  });
});

app.get('/api/admin/users', adminRequired, (req, res) => {
  const query = String(req.query.query || '').trim().toLowerCase();
  const users = getUsers().map(sanitizeUser);

  if (!query) {
    return res.json({ users });
  }

  const filtered = users.filter((user) => {
    return user.email.includes(query) || user.name.toLowerCase().includes(query);
  });

  res.json({ users: filtered });
});

app.get('/api/admin/grants', adminRequired, (_req, res) => {
  const grants = getGrants();
  const users = getUsers();
  const courses = getCourses();

  const expanded = grants.map((grant) => {
    const user = users.find((item) => item.id === grant.userId);
    const course = courses.find((item) => item.id === grant.courseId);

    return {
      ...grant,
      userEmail: user?.email || null,
      userName: user?.name || null,
      courseTitle: course?.title || grant.courseId
    };
  });

  res.json({ grants: expanded });
});

app.post('/api/admin/grants', adminRequired, (req, res) => {
  const email = normalizeEmail(req.body.email);
  const courseId = String(req.body.courseId || '').trim();
  const note = String(req.body.note || '').trim();

  if (!email || !courseId) {
    return res.status(400).json({ error: 'Email and courseId are required.' });
  }

  const users = getUsers();
  const user = users.find((item) => item.email === email);
  if (!user) {
    return res.status(404).json({ error: 'User not found for this email.' });
  }

  const courses = getCourses();
  const course = courses.find((item) => item.id === courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found.' });
  }

  const grants = getGrants();
  const exists = grants.find((item) => item.userId === user.id && item.courseId === courseId);

  if (exists) {
    return res.status(409).json({ error: 'Permission already exists for this user/course.' });
  }

  const grant = {
    id: randomId('grt'),
    userId: user.id,
    courseId,
    note,
    grantedBy: req.user.id,
    grantedAt: new Date().toISOString()
  };

  grants.push(grant);
  saveGrants(grants);

  res.status(201).json({ grant });
});

app.delete('/api/admin/grants/:grantId', adminRequired, (req, res) => {
  const grantId = req.params.grantId;
  const grants = getGrants();
  const next = grants.filter((item) => item.id !== grantId);

  if (next.length === grants.length) {
    return res.status(404).json({ error: 'Grant not found.' });
  }

  saveGrants(next);
  res.json({ ok: true });
});

app.use('/assets', express.static(ASSETS_DIR));
app.use('/src', express.static(SRC_DIR));

app.get('/', (_req, res) => {
  res.redirect('/src/pages/index.html');
});

ensureData();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Integrat backend running on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Default admin: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
});
