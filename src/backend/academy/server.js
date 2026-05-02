const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const raw = fs.readFileSync(filePath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) return;

    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith('\'') && value.endsWith('\''))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  });
}

loadEnvFile(path.join(ROOT_DIR, '.env'));

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'integrat_dev_secret_change_me';
const SESSION_COOKIE = 'integrat_session';
const SRC_DIR = path.join(ROOT_DIR, 'src');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const SITE_DATA = require(path.join(SRC_DIR, 'scripts', 'shared', 'site-data.js'));

const configuredDataDir = String(process.env.INTEGRAT_DATA_DIR || '').trim();
const defaultRuntimeDataDir = process.env.VERCEL ? path.join('/tmp', 'integrat-data') : path.join(__dirname, 'data');
const DATA_DIR = configuredDataDir
  ? (path.isAbsolute(configuredDataDir) ? configuredDataDir : path.join(ROOT_DIR, configuredDataDir))
  : defaultRuntimeDataDir;
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const GRANTS_FILE = path.join(DATA_DIR, 'grants.json');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const PURCHASES_FILE = path.join(DATA_DIR, 'purchases.json');
const DOCTORS_FILE = path.join(DATA_DIR, 'doctors.json');

const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@integrat.local').toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

const TELEGRAM_BOT_TOKEN = String(process.env.TELEGRAM_BOT_TOKEN || '').trim();
const TELEGRAM_CHAT_ID = String(process.env.TELEGRAM_CHAT_ID || '').trim();
const TELEGRAM_THREAD_ID = String(process.env.TELEGRAM_THREAD_ID || '').trim();
const TELEGRAM_STARTUP_NOTIFY = String(process.env.TELEGRAM_STARTUP_NOTIFY || '').trim() === '1';
const SUPABASE_URL = String(process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const SUPABASE_SYNC_ENABLED = String(process.env.SUPABASE_SYNC_ENABLED || '').trim() === '1';
const SUPABASE_PROFILES_TABLE = String(process.env.SUPABASE_PROFILES_TABLE || 'profiles').trim() || 'profiles';
const SUPABASE_PROFILE_ID_COLUMN = String(process.env.SUPABASE_PROFILE_ID_COLUMN || '').trim().toLowerCase();
const SUPABASE_CONTACTS_TABLE = String(process.env.SUPABASE_CONTACTS_TABLE || 'contacts').trim() || 'contacts';
const SUPABASE_APPOINTMENTS_TABLE = String(process.env.SUPABASE_APPOINTMENTS_TABLE || 'appointments').trim() || 'appointments';
const SUPABASE_COURSES_TABLE = String(process.env.SUPABASE_COURSES_TABLE || 'courses').trim() || 'courses';
const SUPABASE_PAYMENT_REQUESTS_TABLE =
  String(process.env.SUPABASE_PAYMENT_REQUESTS_TABLE || 'payment_requests').trim() || 'payment_requests';
const SUPABASE_PAYMENT_SETTINGS_TABLE =
  String(process.env.SUPABASE_PAYMENT_SETTINGS_TABLE || 'payment_settings').trim() || 'payment_settings';
const SUPABASE_COURSE_ACCESS_TABLE =
  String(process.env.SUPABASE_COURSE_ACCESS_TABLE || 'course_access').trim() || 'course_access';
const FAKE_BACKEND_LINK = String(process.env.FAKE_BACKEND_LINK || '').trim();
const KASPI_PAYMENT_NUMBER = String(process.env.KASPI_PAYMENT_NUMBER || '+77711140710').trim();
const KASPI_PAYMENT_NAME = String(process.env.KASPI_PAYMENT_NAME || 'Serzhan S.').trim();
const KASPI_PAYMENT_INSTRUCTIONS =
  String(
    process.env.KASPI_PAYMENT_INSTRUCTIONS ||
      `Transfer the course amount to Kaspi: ${KASPI_PAYMENT_NUMBER} (${KASPI_PAYMENT_NAME}). ` +
        'After payment, click "Send payment request" so the manager can confirm your access.'
  ).trim();
const ALLOWED_CORS_ORIGINS = new Set(
  String(process.env.ALLOWED_CORS_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
);

function parseOrigin(value) {
  try {
    return new URL(String(value || '')).origin;
  } catch {
    return '';
  }
}

function isLoopbackHost(hostname) {
  const normalized = String(hostname || '').toLowerCase();
  return normalized === 'localhost' || normalized === '127.0.0.1';
}

function isAllowedCorsOrigin(origin) {
  const normalizedOrigin = parseOrigin(origin);
  if (!normalizedOrigin) return false;
  if (ALLOWED_CORS_ORIGINS.has(normalizedOrigin)) return true;

  try {
    const url = new URL(normalizedOrigin);
    return isLoopbackHost(url.hostname);
  } catch {
    return false;
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  const requestOrigin = String(req.headers.origin || '').trim();
  if (requestOrigin && isAllowedCorsOrigin(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', parseOrigin(requestOrigin));
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      String(req.headers['access-control-request-headers'] || 'Content-Type, Authorization')
    );
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return next();
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${elapsed}ms)`);
  });
  next();
});

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

function isSupabaseConfigured() {
  return Boolean(SUPABASE_SYNC_ENABLED && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function parseMaybeJson(raw) {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function supabaseRequest(apiPath, options = {}) {
  if (!isSupabaseConfigured()) {
    return { ok: false, skipped: true, reason: 'Supabase sync is disabled or incomplete.' };
  }

  if (typeof fetch !== 'function') {
    return { ok: false, skipped: true, reason: 'fetch is not available in this Node.js runtime.' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`${SUPABASE_URL}${apiPath}`, {
      method: options.method || 'GET',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: options.body,
      signal: controller.signal
    });

    const raw = await response.text();
    const data = parseMaybeJson(raw);

    if (!response.ok) {
      return {
        ok: false,
        skipped: false,
        reason:
          (data && typeof data === 'object' && (data.message || data.error_description || data.error)) ||
          `Supabase API error ${response.status}`
      };
    }

    return { ok: true, skipped: false, data };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      reason: error.name === 'AbortError' ? 'Supabase request timed out.' : (error.message || 'Supabase request failed.')
    };
  } finally {
    clearTimeout(timeout);
  }
}

function supabaseTablePath(tableName) {
  return `/rest/v1/${encodeURIComponent(String(tableName || '').trim())}`;
}

function encodeSupabaseValue(value) {
  return encodeURIComponent(String(value ?? '').replace(/,/g, '\\,'));
}

function buildSupabaseQuery(params = {}) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (!entries.length) return '';
  const query = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return `?${query}`;
}

function normalizeRole(value, fallback = 'student') {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return fallback;
  if (raw === 'patient') return 'patient';
  if (raw === 'student') return 'student';
  if (raw === 'admin') return 'admin';
  return fallback;
}

function asNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapProfileRowToUser(row) {
  if (!row || typeof row !== 'object') return null;

  const externalId = String(row.external_id || '').trim();
  const databaseId = String(row.id || '').trim();
  const preferredId =
    SUPABASE_PROFILE_ID_COLUMN === 'external_id'
      ? externalId || databaseId
      : SUPABASE_PROFILE_ID_COLUMN === 'id'
        ? databaseId || externalId
        : (isUuid(databaseId) ? databaseId : (externalId || databaseId));
  const id = preferredId || randomId('usr');
  const email = normalizeEmail(row.email);
  if (!email) return null;

  return {
    id,
    name: String(row.full_name || '').trim() || email.split('@')[0] || 'User',
    email,
    role: normalizeRole(row.role),
    phone: row.phone ? String(row.phone) : null,
    passwordHash: String(row.password_hash || ''),
    createdAt: row.created_at || new Date().toISOString()
  };
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

function createUuid() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const hex = crypto.randomBytes(16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function hasMissingSupabaseColumn(reason, columnName) {
  const message = String(reason || '').toLowerCase();
  const column = String(columnName || '').toLowerCase();
  if (!message || !column) return false;
  return (
    message.includes(`could not find the '${column}' column`) ||
    message.includes(`column "${column}" does not exist`) ||
    message.includes(`column ${column} does not exist`)
  );
}

function extractMissingSupabaseColumn(reason) {
  const message = String(reason || '');
  if (!message) return null;

  const cachePattern = /Could not find the '([^']+)' column/i;
  const cacheMatch = message.match(cachePattern);
  if (cacheMatch?.[1]) return cacheMatch[1];

  const missingPattern = /column\s+"?([a-zA-Z0-9_]+)"?\s+does not exist/i;
  const missingMatch = message.match(missingPattern);
  if (missingMatch?.[1]) return missingMatch[1];

  return null;
}

async function upsertSupabaseProfileRow(row, onConflict, preferHeader) {
  const payload = { ...row };
  const roleFallbacks = ['student', 'patient', 'user', 'client'];
  let result = null;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    result = await supabaseRequest(`${supabaseTablePath(SUPABASE_PROFILES_TABLE)}?on_conflict=${onConflict}`, {
      method: 'POST',
      headers: {
        Prefer: preferHeader
      },
      body: JSON.stringify(payload)
    });

    if (result.ok) {
      return { result, payload };
    }

    if (
      typeof payload.role === 'string' &&
      String(result.reason || '').toLowerCase().includes('invalid input value for enum') &&
      String(result.reason || '').includes(`"${payload.role}"`)
    ) {
      const currentRoleIndex = roleFallbacks.indexOf(payload.role);
      const nextRole = currentRoleIndex >= 0 ? roleFallbacks[currentRoleIndex + 1] : null;
      if (nextRole) {
        payload.role = nextRole;
        continue;
      }
    }

    const missingColumn = extractMissingSupabaseColumn(result.reason);
    if (!missingColumn || !Object.prototype.hasOwnProperty.call(payload, missingColumn)) {
      break;
    }

    delete payload[missingColumn];
  }

  return { result, payload };
}

function buildSessionSnapshot(user) {
  const safeUser = sanitizeUser(user);
  return {
    userId: safeUser.id,
    role: safeUser.role,
    name: safeUser.name,
    email: safeUser.email,
    phone: safeUser.phone || null,
    createdAt: safeUser.createdAt,
    kind: 'academy'
  };
}

function buildSupabaseProfileRow(user, source = 'app', options = {}) {
  const mode = options.mode || 'external';
  const includePasswordHash = options.includePasswordHash !== false;
  const createdAt = user.createdAt || new Date().toISOString();
  const row = {
    email: normalizeEmail(user.email),
    full_name: user.name,
    role: normalizeRole(user.role),
    phone: user.phone || null,
    preferred_language: user.preferredLanguage || 'en',
    is_active: true,
    source,
    created_at: createdAt,
    updated_at: new Date().toISOString()
  };

  if (mode === 'external') {
    row.external_id = user.id;
  } else if (mode === 'id') {
    row.id = isUuid(user.id) ? user.id : createUuid();
  }

  if (includePasswordHash) {
    row.password_hash = user.passwordHash || null;
  }

  return row;
}

async function syncUserProfileToSupabase(user, options = {}) {
  const { source = 'app', quiet = false } = options;
  const modes = SUPABASE_PROFILE_ID_COLUMN === 'id' ? ['id', 'external'] : ['external', 'id'];
  let result = null;

  for (const mode of modes) {
    const onConflict = mode === 'external' ? 'external_id' : 'email';
    const row = buildSupabaseProfileRow(user, source, { mode, includePasswordHash: true });
    const upsert = await upsertSupabaseProfileRow(row, onConflict, 'resolution=merge-duplicates,return=minimal');
    result = upsert.result;
    if (result.ok) break;
    if (!hasMissingSupabaseColumn(result.reason, 'external_id')) break;
  }

  if (!quiet && !result.skipped) {
    console.log(
      result.ok
        ? `[supabase] Synced profile ${user.email}`
        : `[supabase] Failed to sync profile ${user.email}: ${result.reason || 'unknown reason'}`
    );
  }

  return result;
}

async function findSupabaseUserByEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const path = `${supabaseTablePath(SUPABASE_PROFILES_TABLE)}${buildSupabaseQuery({
    select: '*',
    email: `eq.${normalized}`,
    limit: 1
  })}`;
  const result = await supabaseRequest(path, { method: 'GET' });
  if (!result.ok || !Array.isArray(result.data) || !result.data.length) return null;
  return mapProfileRowToUser(result.data[0]);
}

async function findSupabaseUserById(userId) {
  const normalized = String(userId || '').trim();
  if (!normalized) return null;
  if (isUuid(normalized)) {
    const idPath = `${supabaseTablePath(SUPABASE_PROFILES_TABLE)}${buildSupabaseQuery({
      select: '*',
      id: `eq.${normalized}`,
      limit: 1
    })}`;
    const idResult = await supabaseRequest(idPath, { method: 'GET' });
    if (idResult.ok && Array.isArray(idResult.data) && idResult.data.length) {
      return mapProfileRowToUser(idResult.data[0]);
    }
  }

  const externalPath = `${supabaseTablePath(SUPABASE_PROFILES_TABLE)}${buildSupabaseQuery({
    select: '*',
    external_id: `eq.${normalized}`,
    limit: 1
  })}`;
  let result = await supabaseRequest(externalPath, { method: 'GET' });
  if (!result.ok && hasMissingSupabaseColumn(result.reason, 'external_id')) {
    const idPath = `${supabaseTablePath(SUPABASE_PROFILES_TABLE)}${buildSupabaseQuery({
      select: '*',
      id: `eq.${normalized}`,
      limit: 1
    })}`;
    result = await supabaseRequest(idPath, { method: 'GET' });
  }
  if (!result.ok || !Array.isArray(result.data) || !result.data.length) return null;
  return mapProfileRowToUser(result.data[0]);
}

async function listSupabaseUsers() {
  const orderedPath = `${supabaseTablePath(SUPABASE_PROFILES_TABLE)}${buildSupabaseQuery({
    select: '*',
    order: 'created_at.desc'
  })}`;
  let result = await supabaseRequest(orderedPath, { method: 'GET' });
  if (!result.ok && hasMissingSupabaseColumn(result.reason, 'created_at')) {
    const fallbackPath = `${supabaseTablePath(SUPABASE_PROFILES_TABLE)}${buildSupabaseQuery({
      select: '*'
    })}`;
    result = await supabaseRequest(fallbackPath, { method: 'GET' });
  }
  if (!result.ok || !Array.isArray(result.data)) return [];
  return result.data.map(mapProfileRowToUser).filter(Boolean);
}

async function createSupabaseUser(payload) {
  const draftUser = {
    id: randomId('usr'),
    name: payload.name,
    email: payload.email,
    role: payload.role || 'student',
    phone: payload.phone || null,
    passwordHash: payload.passwordHash,
    createdAt: new Date().toISOString()
  };

  const preferredModes = SUPABASE_PROFILE_ID_COLUMN === 'id' ? ['id', 'external'] : ['external', 'id'];
  let lastError = null;

  for (const mode of preferredModes) {
    const onConflict = mode === 'external' ? 'external_id' : 'email';
    const row = buildSupabaseProfileRow(draftUser, payload.source || 'academy-signup', {
      mode,
      includePasswordHash: true
    });
    const upsert = await upsertSupabaseProfileRow(
      row,
      onConflict,
      'return=representation,resolution=merge-duplicates'
    );
    const result = upsert.result;

    if (result.ok) {
      const created = Array.isArray(result.data) && result.data.length ? result.data[0] : null;
      const mapped = mapProfileRowToUser(created) || (await findSupabaseUserByEmail(draftUser.email));
      if (!mapped) {
        return { ok: false, reason: 'Supabase user insert returned empty result.', user: null };
      }
      if (!mapped.passwordHash && draftUser.passwordHash) {
        mapped.passwordHash = draftUser.passwordHash;
      }
      return { ok: true, reason: null, user: mapped };
    }

    lastError = result.reason || 'Supabase user insert failed.';
    if (!hasMissingSupabaseColumn(lastError, 'external_id')) break;
  }

  return { ok: false, reason: lastError || 'Supabase user insert failed.', user: null };
}

async function syncAllUsersToSupabase() {
  if (!isSupabaseConfigured()) {
    return { ok: false, skipped: true, reason: 'Supabase sync is disabled or incomplete.' };
  }

  const users = getUsers();
  let synced = 0;
  let failed = 0;
  let lastReason = null;

  for (const user of users) {
    const result = await syncUserProfileToSupabase(user, { source: 'startup', quiet: true });
    if (result.ok) {
      synced += 1;
    } else {
      failed += 1;
      lastReason = result.reason || lastReason;
    }
  }

  return { ok: failed === 0, skipped: false, synced, failed, total: users.length, reason: lastReason };
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

function saveCourses(courses) {
  writeJson(COURSES_FILE, courses);
}

function getGrants() {
  return readJson(GRANTS_FILE, []);
}

function saveGrants(grants) {
  writeJson(GRANTS_FILE, grants);
}

function getContacts() {
  return readJson(CONTACTS_FILE, []);
}

function saveContacts(contacts) {
  writeJson(CONTACTS_FILE, contacts);
}

function getAppointments() {
  return readJson(APPOINTMENTS_FILE, []);
}

function saveAppointments(appointments) {
  writeJson(APPOINTMENTS_FILE, appointments);
}

function getPurchases() {
  return readJson(PURCHASES_FILE, []);
}

function savePurchases(purchases) {
  writeJson(PURCHASES_FILE, purchases);
}

function getDoctors() {
  return readJson(DOCTORS_FILE, []);
}

function buildSeedCourses() {
  const entries = Array.isArray(SITE_DATA.academyCourses) ? SITE_DATA.academyCourses : [];
  return entries.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    price: asNumber(course.priceValue || course.price),
    priceLabel: course.priceLabel || course.price || `$${asNumber(course.priceValue || course.price)}`,
    currency: course.currency || 'USD',
    badge: course.badge || 'Course',
    category: course.category || 'academy'
  }));
}

function buildSeedDoctors() {
  const entries = Array.isArray(SITE_DATA.doctors) ? SITE_DATA.doctors : [];
  return entries.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    specialty_ru: doctor.specialty_ru,
    categories: doctor.categories || [],
    image: doctor.image || null,
    experience: doctor.experience || 0,
    education: doctor.education || '',
    education_ru: doctor.education_ru || doctor.education || '',
    spec: doctor.spec || doctor.specialty || '',
    spec_ru: doctor.spec_ru || doctor.spec || doctor.specialty_ru || doctor.specialty || ''
  }));
}

function mergeSeedRecords(filePath, seedRecords, keyName = 'id') {
  const current = readJson(filePath, []);
  if (!Array.isArray(current) || !current.length) {
    writeJson(filePath, seedRecords);
    return;
  }

  const seedKeys = new Set(seedRecords.map((record) => String(record[keyName])));
  const extras = current.filter((record) => !seedKeys.has(String(record?.[keyName])));
  const currentByKey = new Map(current.map((record) => [String(record?.[keyName]), record]));
  const merged = seedRecords.map((record) => ({
    ...(currentByKey.get(String(record[keyName])) || {}),
    ...record
  }));
  writeJson(filePath, [...merged, ...extras]);
}

function normalizeCourseRow(row) {
  if (!row || typeof row !== 'object') return null;
  const id = String(row.id || '').trim();
  if (!id) return null;
  const numericPrice = asNumber(row.price);
  return {
    id,
    title: String(row.title || id),
    description: String(row.description || ''),
    price: numericPrice,
    priceLabel: String(row.price_label || row.priceLabel || `$${numericPrice}`),
    currency: String(row.currency || 'USD'),
    badge: String(row.badge || 'Course'),
    category: String(row.category || 'academy')
  };
}

async function listAcademyCourses() {
  const fallback = getCourses().map(normalizeCourseRow).filter(Boolean);
  if (!isSupabaseConfigured()) return fallback;

  const path = `${supabaseTablePath(SUPABASE_COURSES_TABLE)}${buildSupabaseQuery({
    select: '*',
    order: 'created_at.desc'
  })}`;
  const result = await supabaseRequest(path, { method: 'GET' });
  if (!result.ok || !Array.isArray(result.data) || !result.data.length) {
    return fallback;
  }

  const normalized = result.data.map(normalizeCourseRow).filter(Boolean);
  return normalized.length ? normalized : fallback;
}

function paymentSettingsFallback() {
  return {
    provider: 'kaspi',
    receiverName: KASPI_PAYMENT_NAME,
    receiverNumber: KASPI_PAYMENT_NUMBER,
    instructions: KASPI_PAYMENT_INSTRUCTIONS
  };
}

async function getPaymentSettings() {
  if (!isSupabaseConfigured()) return paymentSettingsFallback();

  const path = `${supabaseTablePath(SUPABASE_PAYMENT_SETTINGS_TABLE)}${buildSupabaseQuery({
    select: '*',
    order: 'updated_at.desc',
    limit: 1
  })}`;
  const result = await supabaseRequest(path, { method: 'GET' });
  if (!result.ok || !Array.isArray(result.data) || !result.data.length) {
    return paymentSettingsFallback();
  }

  const row = result.data[0] || {};
  return {
    provider: String(row.provider || 'kaspi'),
    receiverName: String(row.receiver_name || KASPI_PAYMENT_NAME),
    receiverNumber: String(row.receiver_number || KASPI_PAYMENT_NUMBER),
    instructions: String(row.instructions || KASPI_PAYMENT_INSTRUCTIONS)
  };
}

async function insertContactRecord(contact) {
  if (!isSupabaseConfigured()) return { ok: false, skipped: true, id: null, reason: 'Supabase disabled' };

  const payload = {
    full_name: contact.fullname,
    phone_number: contact.phone,
    comment: contact.comment,
    created_at: contact.createdAt || new Date().toISOString()
  };

  const result = await supabaseRequest(supabaseTablePath(SUPABASE_CONTACTS_TABLE), {
    method: 'POST',
    headers: {
      Prefer: 'return=representation'
    },
    body: JSON.stringify(payload)
  });

  if (!result.ok) {
    return { ok: false, skipped: false, id: null, reason: result.reason || 'Supabase contacts insert failed.' };
  }

  const inserted = Array.isArray(result.data) && result.data.length ? result.data[0] : null;
  return {
    ok: true,
    skipped: false,
    id: inserted?.id ?? null,
    reason: null
  };
}

async function insertAppointmentRecord(appointment) {
  if (!isSupabaseConfigured()) return { ok: false, skipped: true, id: null, reason: 'Supabase disabled' };

  const payload = {
    patient_id: String(appointment.patientId || '').trim(),
    patient_email: normalizeEmail(appointment.patientEmail),
    patient_name: String(appointment.patientName || '').trim(),
    patient_phone: appointment.patientPhone ? String(appointment.patientPhone).trim() : null,
    doctor_id: Number(appointment.doctorId),
    doctor_name: String(appointment.doctorName || '').trim(),
    scheduled_at: String(appointment.datetime || ''),
    status: String(appointment.status || 'scheduled').trim() || 'scheduled',
    source: String(appointment.source || 'clinic').trim() || 'clinic',
    created_at: String(appointment.createdAt || new Date().toISOString())
  };

  let result = null;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    result = await supabaseRequest(supabaseTablePath(SUPABASE_APPOINTMENTS_TABLE), {
      method: 'POST',
      headers: {
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (result.ok) {
      const inserted = Array.isArray(result.data) && result.data.length ? result.data[0] : null;
      return {
        ok: true,
        skipped: false,
        id: inserted?.id ?? null,
        reason: null
      };
    }

    const missingColumn = extractMissingSupabaseColumn(result.reason);
    if (!missingColumn || !Object.prototype.hasOwnProperty.call(payload, missingColumn)) {
      break;
    }
    delete payload[missingColumn];
  }

  return {
    ok: false,
    skipped: false,
    id: null,
    reason: result?.reason || 'Supabase appointments insert failed.'
  };
}

function normalizeAppointmentRow(row) {
  if (!row || typeof row !== 'object') return null;

  const id = row.id ?? null;
  const patientId = String(row.patient_id || row.patientId || '').trim();
  const doctorIdRaw = row.doctor_id ?? row.doctorId ?? null;
  const doctorId = doctorIdRaw === null || doctorIdRaw === undefined || doctorIdRaw === ''
    ? null
    : Number(doctorIdRaw);
  const datetime = String(row.scheduled_at || row.datetime || '').trim();
  const createdAt = String(row.created_at || row.createdAt || '').trim();

  if (!patientId || !datetime) return null;

  return {
    id,
    patientId,
    patientEmail: row.patient_email ? String(row.patient_email) : (row.patientEmail ? String(row.patientEmail) : null),
    patientName: row.patient_name ? String(row.patient_name) : (row.patientName ? String(row.patientName) : null),
    patientPhone: row.patient_phone ? String(row.patient_phone) : (row.patientPhone ? String(row.patientPhone) : null),
    doctorId: Number.isFinite(doctorId) ? doctorId : null,
    doctorName: row.doctor_name ? String(row.doctor_name) : (row.doctorName ? String(row.doctorName) : null),
    datetime,
    status: String(row.status || 'scheduled').trim() || 'scheduled',
    createdAt: createdAt || new Date().toISOString()
  };
}

function listLocalAppointmentsExpanded() {
  const appointments = getAppointments();
  const users = getUsers();
  const doctors = getDoctors();

  return appointments
    .map((item) => {
      const patient = users.find((user) => user.id === item.patient_id);
      const doctor = doctors.find((entry) => Number(entry.id) === Number(item.doctor_id));
      return normalizeAppointmentRow({
        id: item.id,
        patient_id: item.patient_id,
        patient_email: patient?.email || null,
        patient_name: patient?.name || null,
        patient_phone: patient?.phone || null,
        doctor_id: item.doctor_id,
        doctor_name: doctor?.name || null,
        datetime: item.datetime,
        status: item.status || 'scheduled',
        created_at: item.created_at
      });
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
}

async function listAppointmentRecords({ patientId = null } = {}) {
  const localFallback = listLocalAppointmentsExpanded()
    .filter((item) => (patientId ? item.patientId === patientId : true));

  if (!isSupabaseConfigured()) {
    return localFallback;
  }

  const query = {
    select: '*',
    order: 'scheduled_at.desc'
  };
  if (patientId) query.patient_id = `eq.${patientId}`;

  let result = await supabaseRequest(
    `${supabaseTablePath(SUPABASE_APPOINTMENTS_TABLE)}${buildSupabaseQuery(query)}`,
    { method: 'GET' }
  );

  if (!result.ok && hasMissingSupabaseColumn(result.reason, 'scheduled_at')) {
    const fallbackQuery = { select: '*' };
    if (patientId) fallbackQuery.patient_id = `eq.${patientId}`;
    result = await supabaseRequest(
      `${supabaseTablePath(SUPABASE_APPOINTMENTS_TABLE)}${buildSupabaseQuery(fallbackQuery)}`,
      { method: 'GET' }
    );
  }

  if (!result.ok || !Array.isArray(result.data)) {
    return localFallback;
  }

  const normalized = result.data
    .map(normalizeAppointmentRow)
    .filter(Boolean)
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

  return normalized.length ? normalized : localFallback;
}

function normalizePaymentRequestRow(row) {
  if (!row || typeof row !== 'object') return null;

  return {
    id: String(row.id || '').trim(),
    userId: String(row.user_id || row.userId || '').trim(),
    courseId: String(row.course_id || row.courseId || '').trim(),
    amount: asNumber(row.amount),
    currency: String(row.currency || 'USD'),
    status: String(row.status || 'pending').toLowerCase(),
    paymentProvider: String(row.payment_provider || row.paymentProvider || 'manual'),
    requestNote: String(row.request_note || row.requestNote || ''),
    courseTitle: row.course_title ? String(row.course_title) : null,
    userEmail: row.user_email ? String(row.user_email) : null,
    userName: row.user_name ? String(row.user_name) : null,
    createdAt: String(row.created_at || row.purchasedAt || row.createdAt || new Date().toISOString()),
    reviewedAt: row.reviewed_at || row.reviewedAt || null,
    reviewedBy: row.reviewed_by || row.reviewedBy || null,
    reviewNote: row.review_note || row.reviewNote || null
  };
}

function normalizeLocalPaymentRequest(row) {
  return normalizePaymentRequestRow({
    ...row,
    status: row.status || 'pending',
    createdAt: row.purchasedAt || row.createdAt || row.created_at,
    requestNote: row.requestNote || ''
  });
}

async function listPaymentRequests({ userId = null, status = null } = {}) {
  if (!isSupabaseConfigured()) {
    const local = getPurchases()
      .map(normalizeLocalPaymentRequest)
      .filter(Boolean)
      .filter((item) => (userId ? item.userId === userId : true))
      .filter((item) => (status ? item.status === status : true))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return local;
  }

  const query = {
    select: '*',
    order: 'created_at.desc'
  };
  if (userId) query.user_id = `eq.${userId}`;
  if (status) query.status = `eq.${status}`;

  let result = await supabaseRequest(`${supabaseTablePath(SUPABASE_PAYMENT_REQUESTS_TABLE)}${buildSupabaseQuery(query)}`, {
    method: 'GET'
  });
  if (!result.ok && hasMissingSupabaseColumn(result.reason, 'created_at')) {
    const fallbackQuery = { select: '*' };
    if (userId) fallbackQuery.user_id = `eq.${userId}`;
    if (status) fallbackQuery.status = `eq.${status}`;
    result = await supabaseRequest(
      `${supabaseTablePath(SUPABASE_PAYMENT_REQUESTS_TABLE)}${buildSupabaseQuery(fallbackQuery)}`,
      { method: 'GET' }
    );
  }
  if (!result.ok || !Array.isArray(result.data)) return [];
  return result.data.map(normalizePaymentRequestRow).filter(Boolean);
}

async function insertPaymentRequestRecord(body) {
  const payload = { ...body };
  let result = null;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    result = await supabaseRequest(supabaseTablePath(SUPABASE_PAYMENT_REQUESTS_TABLE), {
      method: 'POST',
      headers: {
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (result.ok) {
      const inserted = Array.isArray(result.data) && result.data.length ? result.data[0] : payload;
      return { ok: true, reason: null, row: inserted };
    }

    const missingColumn = extractMissingSupabaseColumn(result.reason);
    if (!missingColumn || !Object.prototype.hasOwnProperty.call(payload, missingColumn)) {
      break;
    }
    delete payload[missingColumn];
  }

  return { ok: false, reason: result?.reason || 'Could not create payment request.', row: null };
}

async function listApprovedCourseIds(userId) {
  const approved = await listPaymentRequests({ userId, status: 'approved' });
  return new Set(approved.map((item) => item.courseId).filter(Boolean));
}

async function createPaymentRequest(user, course, payload = {}) {
  const userId = String(user?.id || '').trim();
  const courseId = String(course?.id || '').trim();
  if (!userId || !courseId) {
    return { ok: false, reason: 'userId and courseId are required.', request: null };
  }

  const existing = await listPaymentRequests({ userId });
  const duplicate = existing.find((item) => item.courseId === courseId);
  if (duplicate) {
    return { ok: false, conflict: true, reason: 'Payment request already exists for this course.', request: duplicate };
  }

  const paymentProvider = String(payload.paymentProvider || 'manual').trim() || 'manual';
  const requestNote = String(payload.requestNote || '').trim();
  const createdAt = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const purchases = getPurchases();
    const purchase = {
      id: randomId('pur'),
      userId,
      courseId,
      amount: asNumber(course.price),
      currency: String(course.currency || 'USD'),
      status: 'pending',
      paymentProvider,
      requestNote,
      purchasedAt: createdAt
    };
    purchases.push(purchase);
    savePurchases(purchases);
    return { ok: true, conflict: false, reason: null, request: normalizeLocalPaymentRequest(purchase) };
  }

  const body = {
    id: createUuid(),
    user_id: userId,
    course_id: courseId,
    course_title: course.title,
    amount: asNumber(course.price),
    currency: String(course.currency || 'USD'),
    status: 'pending',
    payment_provider: paymentProvider,
    request_note: requestNote || null,
    created_at: createdAt
  };

  const inserted = await insertPaymentRequestRecord(body);
  if (!inserted.ok) {
    return { ok: false, conflict: false, reason: inserted.reason || 'Could not create payment request.', request: null };
  }

  return { ok: true, conflict: false, reason: null, request: normalizePaymentRequestRow(inserted.row) };
}

async function setPaymentDecision(paymentRequestId, decision, adminUser, reviewNote = '') {
  const requestId = String(paymentRequestId || '').trim();
  const status = decision === 'approved' ? 'approved' : 'rejected';
  const reviewedAt = new Date().toISOString();
  const reviewerId = adminUser?.id ? String(adminUser.id).trim() : '';
  const safeReviewerId = reviewerId && isUuid(reviewerId) ? reviewerId : null;

  if (!requestId) {
    return { ok: false, reason: 'payment request id is required.', request: null };
  }

  if (!isSupabaseConfigured()) {
    const purchases = getPurchases();
    const target = purchases.find((item) => item.id === requestId);
    if (!target) return { ok: false, reason: 'Payment request not found.', request: null };

    target.status = status;
    target.reviewedAt = reviewedAt;
    target.reviewedBy = adminUser?.id || null;
    target.reviewNote = reviewNote || null;
    savePurchases(purchases);
    return { ok: true, reason: null, request: normalizeLocalPaymentRequest(target) };
  }

  const result = await supabaseRequest(
    `${supabaseTablePath(SUPABASE_PAYMENT_REQUESTS_TABLE)}${buildSupabaseQuery({ id: `eq.${requestId}` })}`,
    {
      method: 'PATCH',
      headers: {
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        status,
        reviewed_at: reviewedAt,
        reviewed_by: safeReviewerId,
        review_note: reviewNote || null
      })
    }
  );

  if (!result.ok || !Array.isArray(result.data) || !result.data.length) {
    return { ok: false, reason: result.reason || 'Payment request was not updated.', request: null };
  }

  const request = normalizePaymentRequestRow(result.data[0]);
  if (request && request.status === 'approved') {
    await supabaseRequest(`${supabaseTablePath(SUPABASE_COURSE_ACCESS_TABLE)}?on_conflict=user_id,course_id`, {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({
        user_id: request.userId,
        course_id: request.courseId,
        source: 'admin-approval',
        granted_by: safeReviewerId,
        created_at: reviewedAt
      })
    });
  }

  return { ok: true, reason: null, request };
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || null,
    createdAt: user.createdAt
  };
}

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const seedCourses = buildSeedCourses();
  if (!fs.existsSync(COURSES_FILE)) {
    writeJson(COURSES_FILE, seedCourses);
  } else {
    mergeSeedRecords(COURSES_FILE, seedCourses);
  }

  if (!fs.existsSync(USERS_FILE)) {
    writeJson(USERS_FILE, []);
  }

  if (!fs.existsSync(GRANTS_FILE)) {
    writeJson(GRANTS_FILE, []);
  }

  if (!fs.existsSync(CONTACTS_FILE)) {
    writeJson(CONTACTS_FILE, []);
  }

  if (!fs.existsSync(APPOINTMENTS_FILE)) {
    writeJson(APPOINTMENTS_FILE, []);
  }

  if (!fs.existsSync(PURCHASES_FILE)) {
    writeJson(PURCHASES_FILE, []);
  }

  const seedDoctors = buildSeedDoctors();
  if (!fs.existsSync(DOCTORS_FILE)) {
    writeJson(DOCTORS_FILE, seedDoctors);
  } else {
    mergeSeedRecords(DOCTORS_FILE, seedDoctors);
  }

  const users = getUsers();
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
    saveUsers(users);
  }

  const courses = getCourses();
  let changed = false;
  const normalizedCourses = courses.map((course) => {
    const nextCourse = { ...course };
    if (typeof nextCourse.price !== 'number') {
      const extracted = Number(String(nextCourse.priceLabel || nextCourse.price || '').replace(/[^0-9.]/g, ''));
      nextCourse.price = Number.isFinite(extracted) ? extracted : 0;
      changed = true;
    }
    if (!nextCourse.priceLabel) {
      nextCourse.priceLabel = `$${nextCourse.price}`;
      changed = true;
    }
    if (!nextCourse.currency) {
      nextCourse.currency = 'USD';
      changed = true;
    }
    return nextCourse;
  });

  if (changed) {
    saveCourses(normalizedCourses);
  }
}

function currentUser(req) {
  const token = req.cookies[SESSION_COOKIE];
  const payload = verifyToken(token);
  if (!payload?.userId) return null;

  if (payload.kind === 'academy' && payload.email) {
    return {
      id: String(payload.userId),
      name: String(payload.name || '').trim() || String(payload.email).split('@')[0] || 'User',
      email: normalizeEmail(payload.email),
      role: normalizeRole(payload.role),
      phone: payload.phone ? String(payload.phone) : null,
      createdAt: payload.createdAt || new Date(payload.iat * 1000).toISOString()
    };
  }

  const users = getUsers();
  return users.find((user) => user.id === payload.userId) || null;
}

function getBearerToken(req) {
  const raw = String(req.headers.authorization || '').trim();
  if (!raw.toLowerCase().startsWith('bearer ')) return null;
  return raw.slice(7).trim();
}

function currentBearerUser(req) {
  const token = getBearerToken(req);
  const payload = verifyToken(token);
  if (!payload?.sub) return null;

  if (payload.kind === 'clinic' && payload.email) {
    return {
      id: String(payload.sub),
      name: String(payload.name || '').trim() || String(payload.email).split('@')[0] || 'User',
      email: normalizeEmail(payload.email),
      role: normalizeRole(payload.role, 'patient'),
      phone: payload.phone ? String(payload.phone) : null,
      createdAt: payload.createdAt || new Date(payload.iat * 1000).toISOString()
    };
  }

  const users = getUsers();
  return users.find((user) => user.id === payload.sub) || null;
}

function setSession(res, user) {
  const token = signToken(buildSessionSnapshot(user));
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL),
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
}

function clearSession(res) {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL)
  });
}

function issueClinicToken(user) {
  return signToken({
    sub: user.id,
    role: user.role,
    kind: 'clinic',
    email: user.email,
    name: user.name,
    phone: user.phone || null,
    createdAt: user.createdAt
  });
}

function authResponse(user) {
  return {
    user: sanitizeUser(user),
    access_token: issueClinicToken(user),
    token_type: 'bearer'
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

function clinicAuthRequired(req, res, next) {
  const user = currentBearerUser(req);
  if (!user) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  req.user = user;
  next();
}

function clinicAdminRequired(req, res, next) {
  const user = currentBearerUser(req);
  if (!user) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ detail: 'Forbidden' });
  }

  req.user = user;
  next();
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

function formatIsoDate(dateValue) {
  const value = new Date(dateValue);
  if (Number.isNaN(value.getTime())) return null;
  return value.toISOString();
}

async function hasCourseAccess(user, courseId) {
  if (!user || !courseId) return false;
  if (user.role === 'admin') return true;

  if (isSupabaseConfigured()) {
    const approved = await listApprovedCourseIds(user.id);
    if (approved.has(courseId)) return true;

    const accessResult = await supabaseRequest(
      `${supabaseTablePath(SUPABASE_COURSE_ACCESS_TABLE)}${buildSupabaseQuery({
        select: 'course_id',
        user_id: `eq.${user.id}`,
        course_id: `eq.${courseId}`,
        limit: 1
      })}`,
      { method: 'GET' }
    );
    if (accessResult.ok && Array.isArray(accessResult.data) && accessResult.data.length) return true;
  }

  const grants = getGrants();
  const grant = grants.find((item) => item.userId === user.id && item.courseId === courseId);
  if (grant) return true;

  const purchases = getPurchases();
  const purchase = purchases.find((item) => item.userId === user.id && item.courseId === courseId && item.status === 'approved');
  return Boolean(purchase);
}

function isTelegramConfigured() {
  return Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);
}

async function sendTelegramMessage(text) {
  if (!isTelegramConfigured()) {
    return { ok: false, skipped: true, reason: 'Telegram bot credentials are not configured.' };
  }

  if (typeof fetch !== 'function') {
    return { ok: false, skipped: true, reason: 'fetch is not available in this Node.js runtime.' };
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text,
    parse_mode: 'HTML'
  };

  if (TELEGRAM_THREAD_ID) {
    payload.message_thread_id = Number(TELEGRAM_THREAD_ID);
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const raw = await response.text();
    let data = null;

    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw;
    }

    if (!response.ok || !data?.ok) {
      return {
        ok: false,
        skipped: false,
        reason: data?.description || `Telegram API error ${response.status}`
      };
    }

    return { ok: true, skipped: false };
  } catch (error) {
    return { ok: false, skipped: false, reason: error.message || 'Telegram request failed' };
  }
}

async function notifyTelegramWithCode(eventType, payload) {
  const details = payload || {};
  const lines = [];

  if (eventType === 'contact-form') {
    lines.push('<b>New client in touch</b>');
    lines.push(`Name: ${details.fullname || '-'}`);
    lines.push(`Phone: ${details.phone || '-'}`);
    lines.push(`Comment: ${details.comment || '-'}`);
  } else if (eventType === 'payment-request') {
    lines.push('<b>New payment request</b>');
    lines.push(`User: ${details.userName || '-'}`);
    lines.push(`Email: ${details.userEmail || '-'}`);
    lines.push(`Phone: ${details.phone || '-'}`);
    lines.push(`Course: ${details.courseTitle || details.courseId || '-'}`);
    lines.push(`Amount: ${details.amount || '-'}`);
    if (details.requestNote) {
      lines.push(`Note: ${details.requestNote}`);
    }
  } else if (eventType === 'academy-signup') {
    lines.push('<b>New academy signup</b>');
    lines.push(`Name: ${details.name || '-'}`);
    lines.push(`Email: ${details.email || '-'}`);
    lines.push(`Phone: ${details.phone || '-'}`);
  } else {
    lines.push('<b>Integrat Event</b>');
    lines.push(`Type: ${eventType}`);
    Object.entries(details).forEach(([key, value]) => {
      lines.push(`${key}: ${String(value ?? '')}`);
    });
  }

  lines.push(`Time: ${new Date().toISOString()}`);

  const result = await sendTelegramMessage(lines.join('\n'));

  if (result.ok) {
    console.log(`[telegram] Sent ${eventType} notification`);
  } else {
    console.log(`[telegram] ${eventType} notification not delivered: ${result.reason || 'unknown reason'}`);
  }

  return {
    delivered: Boolean(result.ok),
    reason: result.reason || null
  };
}

function buildFakeBackendLink(activePort) {
  if (FAKE_BACKEND_LINK) return FAKE_BACKEND_LINK;
  return `https://integrat-demo-${activePort}.example.com`;
}

async function notifyStartupLink(activePort) {
  const fakeLink = buildFakeBackendLink(activePort);
  console.log(`Fake backend link: ${fakeLink}`);

  if (!TELEGRAM_STARTUP_NOTIFY) {
    return { ok: false, skipped: true, reason: 'Startup Telegram notifications are disabled.', link: fakeLink };
  }

  const lines = [
    '<b>Integrat Backend Started</b>',
    `Time: ${new Date().toISOString()}`,
    `Local: <code>http://localhost:${activePort}</code>`,
    `Demo link: <code>${fakeLink}</code>`
  ];

  const result = await sendTelegramMessage(lines.join('\n'));

  if (result.ok) {
    console.log('[telegram] Startup link delivered.');
  } else {
    console.log(`[telegram] Startup link not delivered: ${result.reason || 'unknown reason'}`);
  }

  return {
    ...result,
    link: fakeLink
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/auth/register', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const phone = String(req.body.phone || '').replace(/\D/g, '');
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!name || !phone || !email || !password) {
    return res.status(400).json({ detail: 'Name, phone, email and password are required' });
  }

  if (name.length < 2) {
    return res.status(400).json({ detail: 'Name must contain at least 2 characters' });
  }

  if (phone.length !== 11 || !phone.startsWith('7')) {
    return res.status(400).json({ detail: 'Phone number must be in +7 (XXX) XXX XX - XX format' });
  }

  if (!validEmail(email)) {
    return res.status(400).json({ detail: 'Invalid email format' });
  }

  if (password.length < 8) {
    return res.status(400).json({ detail: 'Password must be at least 8 characters' });
  }

  const users = getUsers();
  const existing = users.find((item) => item.email === email);
  if (existing) {
    return res.status(400).json({ detail: 'Email already registered' });
  }

  if (isSupabaseConfigured()) {
    const existingSupabaseUser = await findSupabaseUserByEmail(email);
    if (existingSupabaseUser) {
      return res.status(400).json({ detail: 'Email already registered' });
    }
  }

  const user = {
    id: randomId('usr'),
    name,
    phone,
    email,
    passwordHash: hashPassword(password),
    role: 'patient',
    createdAt: new Date().toISOString()
  };

  users.push(user);
  saveUsers(users);
  setSession(res, user);
  void syncUserProfileToSupabase(user, { source: 'clinic-register' });

  const telegram = await notifyTelegramWithCode('clinic-register', {
    name,
    phone,
    email,
    role: user.role
  });

  return res.status(201).json({
    ...authResponse(user),
    telegram: {
      codeSent: telegram.delivered,
      configured: isTelegramConfigured()
    }
  });
});

app.post('/auth/login', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({ detail: 'Email and password are required' });
  }

  const users = getUsers();
  const localUser = users.find((item) => item.email === email) || null;
  let user = localUser;

  if (isSupabaseConfigured()) {
    try {
      const supabaseUser = await findSupabaseUserByEmail(email);
      if (supabaseUser) {
        user = {
          ...supabaseUser,
          passwordHash: supabaseUser.passwordHash || localUser?.passwordHash || '',
          phone: supabaseUser.phone || localUser?.phone || null,
          name: supabaseUser.name || localUser?.name || email.split('@')[0] || 'User',
          createdAt: supabaseUser.createdAt || localUser?.createdAt || new Date().toISOString()
        };
      }
    } catch {
      user = localUser;
    }
  }

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(400).json({ detail: 'Incorrect email or password' });
  }

  setSession(res, user);

  return res.json(authResponse(user));
});

app.post('/auth/logout', (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

app.get('/auth/me', clinicAuthRequired, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

async function createContactHandler(req, res) {
  const fullname = String(req.body.fullname || '').trim();
  const phone = String(req.body.phone || '').replace(/\D/g, '');
  const comment = String(req.body.comment || '').trim();

  if (!fullname || fullname.length < 2) {
    return res.status(400).json({ detail: 'Full name must contain at least 2 characters' });
  }

  if (phone.length < 10) {
    return res.status(400).json({ detail: 'Phone number is incomplete' });
  }

  if (!comment || comment.length < 5) {
    return res.status(400).json({ detail: 'Comment must contain at least 5 characters' });
  }

  const createdAt = new Date().toISOString();
  const contacts = getContacts();
  const entry = {
    id: contacts.length ? Math.max(...contacts.map((item) => Number(item.id) || 0)) + 1 : 1,
    fullname,
    phone,
    comment,
    status: 'new',
    created_at: createdAt
  };

  contacts.unshift(entry);
  saveContacts(contacts);

  const supabaseInsert = await insertContactRecord({
    fullname,
    phone,
    comment,
    createdAt
  });

  const telegram = await notifyTelegramWithCode('contact-form', {
    fullname,
    phone,
    comment: comment.slice(0, 200)
  });

  return res.status(201).json({
    status: 'success',
    id: supabaseInsert.ok && supabaseInsert.id !== null ? supabaseInsert.id : entry.id,
    telegram: {
      codeSent: telegram.delivered,
      configured: isTelegramConfigured()
    },
    storage: {
      supabaseSaved: supabaseInsert.ok
    }
  });
}

app.post('/contacts', createContactHandler);
app.post('/api/contacts', createContactHandler);

app.get('/contacts', clinicAdminRequired, (_req, res) => {
  res.json(getContacts());
});
app.get('/api/contacts', clinicAdminRequired, (_req, res) => {
  res.json(getContacts());
});

app.get('/doctors', (_req, res) => {
  res.json(getDoctors());
});

app.post('/appointments', clinicAuthRequired, async (req, res) => {
  const doctorId = Number(req.body.doctor_id);
  const datetime = formatIsoDate(req.body.datetime);

  if (!doctorId || !datetime) {
    return res.status(400).json({ detail: 'doctor_id and valid datetime are required' });
  }

  const doctors = getDoctors();
  const doctor = doctors.find((item) => Number(item.id) === doctorId);
  if (!doctor) {
    return res.status(404).json({ detail: 'Doctor not found' });
  }

  const appointments = getAppointments();
  const appointment = {
    id: appointments.length ? Math.max(...appointments.map((item) => Number(item.id) || 0)) + 1 : 1,
    patient_id: req.user.id,
    doctor_id: doctorId,
    datetime,
    status: 'scheduled',
    created_at: new Date().toISOString()
  };

  appointments.unshift(appointment);
  saveAppointments(appointments);

  const supabaseInsert = await insertAppointmentRecord({
    patientId: req.user.id,
    patientEmail: req.user.email,
    patientName: req.user.name,
    patientPhone: req.user.phone || null,
    doctorId,
    doctorName: doctor.name,
    datetime,
    status: appointment.status,
    source: 'clinic',
    createdAt: appointment.created_at
  });

  if (!supabaseInsert.ok && !supabaseInsert.skipped) {
    console.log(`[supabase] Appointment sync failed for ${req.user.email}: ${supabaseInsert.reason || 'unknown reason'}`);
  }

  const telegram = await notifyTelegramWithCode('appointment', {
    patientName: req.user.name,
    patientEmail: req.user.email,
    doctor: doctor.name,
    datetime
  });

  return res.status(201).json({
    status: 'success',
    id: supabaseInsert.ok && supabaseInsert.id !== null ? supabaseInsert.id : appointment.id,
    telegram: {
      codeSent: telegram.delivered,
      configured: isTelegramConfigured()
    },
    storage: {
      supabaseSaved: supabaseInsert.ok
    }
  });
});

app.get('/appointments', clinicAuthRequired, async (req, res) => {
  const appointments = await listAppointmentRecords({
    patientId: req.user.role === 'admin' ? null : req.user.id
  });

  return res.json(appointments.map((item) => ({
    id: item.id,
    datetime: item.datetime,
    status: item.status,
    patient_email: item.patientEmail,
    doctor_name: item.doctorName,
    created_at: item.createdAt
  })));
});

app.get('/api/admin/appointments', adminRequired, async (_req, res) => {
  const appointments = await listAppointmentRecords();
  res.json({ appointments });
});

app.post('/api/auth/signup', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const phone = String(req.body.phone || '').replace(/\D/g, '');
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  let passwordHash = '';

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }

  if (!validEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  passwordHash = hashPassword(password);

  let user = null;

  if (isSupabaseConfigured()) {
    try {
      const existing = await findSupabaseUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'Email already registered.' });
      }

      const created = await createSupabaseUser({
        name,
        phone,
        email,
        passwordHash,
        role: 'student',
        source: 'academy-signup'
      });

      if (created.ok && created.user) {
        user = created.user;
      } else {
        console.log(`[supabase] Signup fallback to local storage: ${created.reason || 'unknown reason'}`);
      }
    } catch (error) {
      console.log(`[supabase] Signup fallback to local storage: ${error.message || 'unexpected error'}`);
    }
  }

  const users = getUsers();
  const existsLocally = users.some((item) => item.email === email);

  if (!user) {
    if (existsLocally) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    user = {
      id: randomId('usr'),
      name,
      email,
      phone,
      passwordHash,
      role: 'student',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);
  } else if (!existsLocally) {
    users.push({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || phone,
      passwordHash,
      role: normalizeRole(user.role),
      createdAt: user.createdAt || new Date().toISOString()
    });
    saveUsers(users);
  }

  setSession(res, user);

  const telegram = await notifyTelegramWithCode('academy-signup', {
    name: user.name,
    email: user.email,
    phone: user.phone || phone
  });

  res.status(201).json({
    ...authResponse(user),
    telegram: {
      codeSent: telegram.delivered,
      configured: isTelegramConfigured()
    }
  });
});

app.post('/api/auth/login', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  let user = null;
  let localFallbackUser = null;

  if (isSupabaseConfigured()) {
    const users = getUsers();
    localFallbackUser = users.find((item) => item.email === email) || null;
    try {
      user = await findSupabaseUserByEmail(email);
    } catch {
      user = null;
    }
    if (!user && localFallbackUser) {
      user = localFallbackUser;
    }
    if (user && !user.passwordHash && localFallbackUser) {
      user.passwordHash = localFallbackUser.passwordHash;
      user.name = user.name || localFallbackUser.name;
      user.phone = user.phone || localFallbackUser.phone;
      user.role = user.role || localFallbackUser.role;
      user.createdAt = user.createdAt || localFallbackUser.createdAt;
    }
  } else {
    const users = getUsers();
    user = users.find((item) => item.email === email) || null;
  }

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  setSession(res, user);
  res.json(authResponse(user));
});

app.post('/api/auth/logout', (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const user = currentUser(req);
  res.json({ user: user ? sanitizeUser(user) : null });
});

app.get('/api/payment/settings', async (_req, res) => {
  const settings = await getPaymentSettings();
  res.json({ payment: settings });
});

app.get('/api/courses', async (req, res) => {
  const user = currentUser(req);
  const courses = await listAcademyCourses();
  const myRequests = user ? await listPaymentRequests({ userId: user.id }) : [];
  const latestByCourse = new Map();
  myRequests.forEach((request) => {
    if (!latestByCourse.has(request.courseId)) {
      latestByCourse.set(request.courseId, request);
    }
  });

  const enriched = await Promise.all(courses.map(async (course) => {
    const purchase = user ? latestByCourse.get(course.id) || null : null;
    const hasAccess = user ? await hasCourseAccess(user, course.id) : false;
    return {
      ...course,
      hasAccess,
      isPurchased: Boolean(purchase),
      purchaseStatus: purchase?.status || null
    };
  }));

  const payment = await getPaymentSettings();
  res.json({ courses: enriched, payment });
});

app.get('/api/courses/purchases/me', authRequired, async (req, res) => {
  const purchases = await listPaymentRequests({ userId: req.user.id });
  const courses = await listAcademyCourses();

  const myPurchases = purchases.map((purchase) => {
    const course = courses.find((item) => item.id === purchase.courseId);
    return {
      ...purchase,
      course: course || null
    };
  });

  res.json({ purchases: myPurchases });
});

app.post('/api/courses/:courseId/purchase', authRequired, async (req, res) => {
  const courseId = String(req.params.courseId || '').trim();
  const courses = await listAcademyCourses();
  const course = courses.find((item) => item.id === courseId);

  if (!course) {
    return res.status(404).json({ error: 'Course not found.' });
  }

  const hasAccess = await hasCourseAccess(req.user, courseId);
  if (hasAccess) {
    return res.status(409).json({ error: 'Course is already approved.' });
  }

  const created = await createPaymentRequest(req.user, course, {
    paymentProvider: req.body.paymentProvider,
    requestNote: req.body.requestNote
  });

  if (!created.ok && created.conflict) {
    return res.status(409).json({ error: 'Payment request already exists for this course.' });
  }
  if (!created.ok) {
    return res.status(500).json({ error: created.reason || 'Could not create payment request.' });
  }

  const telegram = await notifyTelegramWithCode('payment-request', {
    userName: req.user.name,
    userEmail: req.user.email,
    phone: req.user.phone || '-',
    courseId: course.id,
    courseTitle: course.title,
    amount: `${created.request.amount} ${created.request.currency}`,
    requestNote: created.request.requestNote || ''
  });

  const payment = await getPaymentSettings();

  res.status(201).json({
    purchase: created.request,
    hasAccess: false,
    course,
    payment,
    telegram: {
      codeSent: telegram.delivered,
      configured: isTelegramConfigured()
    }
  });
});

app.get('/api/courses/:courseId/access', authRequired, async (req, res) => {
  const courseId = req.params.courseId;
  const courses = await listAcademyCourses();
  const course = courses.find((item) => item.id === courseId);

  if (!course) {
    return res.status(404).json({ error: 'Course not found.' });
  }

  const purchases = await listPaymentRequests({ userId: req.user.id });
  const purchase = purchases.find((item) => item.courseId === courseId) || null;
  const hasAccess = await hasCourseAccess(req.user, courseId);
  const payment = await getPaymentSettings();

  return res.json({
    hasAccess,
    course,
    payment,
    grantedAt: purchase?.reviewedAt || null,
    purchase: purchase
      ? {
          id: purchase.id,
          status: purchase.status,
          amount: purchase.amount,
          currency: purchase.currency,
          purchasedAt: purchase.createdAt
        }
      : null
  });
});

app.post('/api/notifications/telegram-code', adminRequired, async (req, res) => {
  const phone = String(req.body.phone || '').trim();
  const context = String(req.body.context || 'generic').trim() || 'generic';

  const telegram = await notifyTelegramWithCode('manual-notify', {
    requestedBy: req.user.email,
    phone,
    context
  });

  res.status(201).json({
    ok: true,
    telegram: {
      codeSent: telegram.delivered,
      configured: isTelegramConfigured()
    }
  });
});

app.get('/api/admin/users', adminRequired, async (req, res) => {
  const query = String(req.query.query || '').trim().toLowerCase();
  const users = isSupabaseConfigured() ? await listSupabaseUsers() : getUsers();
  const sanitized = users.map(sanitizeUser);

  if (!query) {
    return res.json({ users: sanitized });
  }

  const filtered = sanitized.filter((user) => {
    return user.email.includes(query) || user.name.toLowerCase().includes(query);
  });

  return res.json({ users: filtered });
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

  return res.json({ grants: expanded });
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

  return res.status(201).json({ grant });
});

app.delete('/api/admin/grants/:grantId', adminRequired, (req, res) => {
  const grantId = req.params.grantId;
  const grants = getGrants();
  const next = grants.filter((item) => item.id !== grantId);

  if (next.length === grants.length) {
    return res.status(404).json({ error: 'Grant not found.' });
  }

  saveGrants(next);
  return res.json({ ok: true });
});

app.get('/api/admin/payment-requests', adminRequired, async (_req, res) => {
  const [requests, users, courses] = await Promise.all([
    listPaymentRequests(),
    isSupabaseConfigured() ? listSupabaseUsers() : Promise.resolve(getUsers()),
    listAcademyCourses()
  ]);
  const usersById = new Map(users.map((item) => [item.id, item]));
  const coursesById = new Map(courses.map((item) => [item.id, item]));

  const paymentRequests = requests.map((request) => {
    const user = usersById.get(request.userId);
    const course = coursesById.get(request.courseId);
    return {
      ...request,
      userEmail: request.userEmail || user?.email || null,
      userName: request.userName || user?.name || null,
      userPhone: user?.phone || null,
      courseTitle: request.courseTitle || course?.title || request.courseId
    };
  });

  res.json({ paymentRequests });
});

app.post('/api/admin/payment-requests/:paymentRequestId/decision', adminRequired, async (req, res) => {
  const paymentRequestId = String(req.params.paymentRequestId || '').trim();
  const decision = String(req.body.decision || '').trim().toLowerCase();
  const reviewNote = String(req.body.note || '').trim();

  if (!['approve', 'reject', 'approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'decision must be approve or reject.' });
  }

  const normalizedDecision = decision.startsWith('approv') ? 'approved' : 'rejected';
  const updated = await setPaymentDecision(paymentRequestId, normalizedDecision, req.user, reviewNote);

  if (!updated.ok || !updated.request) {
    const status = String(updated.reason || '').toLowerCase().includes('not found') ? 404 : 400;
    return res.status(status).json({ error: updated.reason || 'Payment request update failed.' });
  }

  res.json({ paymentRequest: updated.request });
});

app.get('/api/admin/purchases', adminRequired, async (_req, res) => {
  const response = await listPaymentRequests();
  res.json({ purchases: response });
});

app.use('/assets', express.static(ASSETS_DIR));
app.use('/src', express.static(SRC_DIR));

app.get('/', (_req, res) => {
  res.redirect('/src/pages/index.html');
});

function startServer(port = PORT) {
  ensureData();

  const server = app.listen(port, () => {
    const address = server.address();
    const activePort = typeof address === 'object' && address ? address.port : port;
    console.log(`Integrat backend running on http://localhost:${activePort}`);
    console.log(`Default admin email: ${DEFAULT_ADMIN_EMAIL}`);
    if (!process.env.ADMIN_PASSWORD) {
      console.log('Admin password is using the default development value. Set ADMIN_PASSWORD before production.');
    }
    console.log(`Telegram configured: ${isTelegramConfigured() ? 'yes' : 'no'}${TELEGRAM_THREAD_ID ? ` (thread ${TELEGRAM_THREAD_ID})` : ''}`);
    console.log(`Supabase data mode: ${isSupabaseConfigured() ? 'enabled' : 'disabled'}`);
    console.log('HTTP request logging: enabled');

    void notifyStartupLink(activePort);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
  ensureData
};
