const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const serverModulePath = path.join(__dirname, '..', 'src', 'backend', 'academy', 'server.js');
const originalFetch = global.fetch;

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

test('appointments endpoint syncs booking to configured supabase appointments table', async (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'integrat-appointments-'));
  const previousEnv = {
    INTEGRAT_DATA_DIR: process.env.INTEGRAT_DATA_DIR,
    SUPABASE_SYNC_ENABLED: process.env.SUPABASE_SYNC_ENABLED,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_APPOINTMENTS_TABLE: process.env.SUPABASE_APPOINTMENTS_TABLE,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID
  };

  process.env.INTEGRAT_DATA_DIR = tempDir;
  process.env.SUPABASE_SYNC_ENABLED = '1';
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  process.env.SUPABASE_APPOINTMENTS_TABLE = 'appointments';
  process.env.TELEGRAM_BOT_TOKEN = 'bot-token';
  process.env.TELEGRAM_CHAT_ID = '1036784703';

  const supabaseCalls = [];
  global.fetch = async (url, options = {}) => {
    const target = String(url);
    if (target.startsWith('http://127.0.0.1:') || target.startsWith('http://localhost:')) {
      return originalFetch(url, options);
    }

    if (target.includes('/rest/v1/appointments')) {
      supabaseCalls.push({ url: target, options });
      return jsonResponse([{ id: 'appointment-row-1' }], 201);
    }

    if (target.includes('/rest/v1/profiles')) {
      return jsonResponse([], 201);
    }

    if (target.includes('/sendMessage')) {
      return jsonResponse({ ok: true, result: { message_id: 1 } }, 200);
    }

    return jsonResponse({}, 200);
  };

  delete require.cache[serverModulePath];
  const { startServer } = require(serverModulePath);
  const server = startServer(0);
  const port = server.address().port;

  t.after(() => {
    server.close();
    global.fetch = originalFetch;
    delete require.cache[serverModulePath];
    Object.entries(previousEnv).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const registerResponse = await originalFetch(`http://127.0.0.1:${port}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Patient One',
      phone: '77011234567',
      email: 'patient@example.com',
      password: 'Password1!'
    })
  });
  assert.equal(registerResponse.status, 201);
  const registerData = await registerResponse.json();
  assert.ok(registerData.access_token);

  const bookingResponse = await originalFetch(`http://127.0.0.1:${port}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${registerData.access_token}`
    },
    body: JSON.stringify({
      doctor_id: 4,
      datetime: '2026-05-02T10:00:00.000Z'
    })
  });

  assert.equal(bookingResponse.status, 201);
  const appointmentInsert = supabaseCalls[0];
  assert.ok(appointmentInsert, 'expected supabase appointment insert');

  const payload = JSON.parse(String(appointmentInsert.options.body || '{}'));
  assert.equal(payload.patient_email, 'patient@example.com');
  assert.equal(payload.patient_name, 'Patient One');
  assert.equal(payload.doctor_id, 4);
  assert.equal(payload.status, 'scheduled');
});
