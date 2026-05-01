const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const serverSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'backend', 'academy', 'server.js'), 'utf8');

test('backend config contains local development CORS handling for frontend form posts', () => {
  assert.match(serverSource, /Access-Control-Allow-Origin/);
  assert.match(serverSource, /Access-Control-Allow-Methods/);
  assert.match(serverSource, /OPTIONS/);
});
