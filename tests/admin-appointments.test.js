const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const serverModulePath = path.join(__dirname, '..', 'src', 'backend', 'academy', 'server.js');
const originalFetch = global.fetch;

test('academy admin panel can list clinic appointments', async (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'integrat-admin-appts-'));
  const previousEnv = {
    INTEGRAT_DATA_DIR: process.env.INTEGRAT_DATA_DIR,
    SUPABASE_SYNC_ENABLED: process.env.SUPABASE_SYNC_ENABLED,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
  };

  process.env.INTEGRAT_DATA_DIR = tempDir;
  delete process.env.SUPABASE_SYNC_ENABLED;
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_CHAT_ID;
  process.env.ADMIN_EMAIL = 'admin@integrat.local';
  process.env.ADMIN_PASSWORD = 'Admin123!';

  delete require.cache[serverModulePath];
  const { startServer } = require(serverModulePath);
  const server = startServer(0);
  const port = server.address().port;

  t.after(() => {
    server.close();
    global.fetch = originalFetch;
    delete require.cache[serverModulePath];
    Object.entries(previousEnv).forEach(([key, value]) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
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

  const appointmentResponse = await originalFetch(`http://127.0.0.1:${port}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${registerData.access_token}`
    },
    body: JSON.stringify({
      doctor_id: 4,
      datetime: '2026-05-03T10:30:00.000Z'
    })
  });
  assert.equal(appointmentResponse.status, 201);

  const adminLoginResponse = await originalFetch(`http://127.0.0.1:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@integrat.local',
      password: 'Admin123!'
    })
  });
  assert.equal(adminLoginResponse.status, 200);
  const cookie = adminLoginResponse.headers.get('set-cookie');
  assert.ok(cookie);

  const adminAppointmentsResponse = await originalFetch(`http://127.0.0.1:${port}/api/admin/appointments`, {
    method: 'GET',
    headers: { Cookie: cookie }
  });

  assert.equal(adminAppointmentsResponse.status, 200);
  const { appointments } = await adminAppointmentsResponse.json();
  assert.equal(appointments.length, 1);
  assert.equal(appointments[0].patientEmail, 'patient@example.com');
  assert.equal(appointments[0].patientName, 'Patient One');
  assert.equal(appointments[0].doctorName, 'Dr. Timur Sadykov');
});
