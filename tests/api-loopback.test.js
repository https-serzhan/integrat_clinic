const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadScript(file, windowOverrides = {}) {
  const code = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const window = {
    location: {
      origin: 'http://localhost:3000',
      hostname: 'localhost'
    },
    localStorage: {
      getItem() { return null; }
    },
    IntegratConfig: {},
    fetch() {
      throw new Error('fetch should not be called in this test');
    },
    ...windowOverrides
  };
  const sandbox = {
    window,
    URL,
    fetch: window.fetch,
    FormData: class FormData {},
    console
  };
  vm.runInNewContext(code, sandbox, { filename: file });
  return window;
}

test('clinic api uses current loopback origin instead of mismatched explicit loopback host', () => {
  const window = loadScript('src/scripts/shared/api.js', {
    IntegratConfig: { clinicApiBaseUrl: 'http://127.0.0.1:3000' }
  });
  assert.equal(window.api.baseUrl, 'http://localhost:3000');
});

test('academy auth api uses current loopback origin instead of mismatched explicit loopback host', () => {
  const window = loadScript('src/scripts/shared/auth-api.js', {
    IntegratConfig: { academyApiBaseUrl: 'http://127.0.0.1:3000' }
  });
  assert.equal(window.IntegratAuthApi.baseUrl, 'http://localhost:3000');
});
