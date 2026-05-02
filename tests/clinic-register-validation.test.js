const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const serverModulePath = path.join(__dirname, '..', 'src', 'backend', 'academy', 'server.js');
const originalFetch = global.fetch;

test('clinic registration requires name and phone and stores them in the created user', async (t) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'integrat-register-'));
  const previousEnv = {
    INTEGRAT_DATA_DIR: process.env.INTEGRAT_DATA_DIR,
    SUPABASE_SYNC_ENABLED: process.env.SUPABASE_SYNC_ENABLED,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID
  };

  process.env.INTEGRAT_DATA_DIR = tempDir;
  delete process.env.SUPABASE_SYNC_ENABLED;
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_CHAT_ID;

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

  const invalidResponse = await originalFetch(`http://127.0.0.1:${port}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'no-name@example.com',
      password: 'Password1!'
    })
  });
  assert.equal(invalidResponse.status, 400);

  const validResponse = await originalFetch(`http://127.0.0.1:${port}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Patient One',
      phone: '77011234567',
      email: 'patient@example.com',
      password: 'Password1!'
    })
  });
  assert.equal(validResponse.status, 201);
  const validData = await validResponse.json();
  assert.equal(validData.user.name, 'Patient One');
  assert.equal(validData.user.phone, '77011234567');
});
