const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createClassList() {
  const classes = new Set();
  return {
    add(...tokens) { tokens.forEach((token) => classes.add(token)); },
    remove(...tokens) { tokens.forEach((token) => classes.delete(token)); },
    toggle(token, force) {
      if (force === undefined) {
        if (classes.has(token)) {
          classes.delete(token);
          return false;
        }
        classes.add(token);
        return true;
      }
      if (force) classes.add(token); else classes.delete(token);
      return force;
    },
    contains(token) { return classes.has(token); }
  };
}

function createNode(overrides = {}) {
  return {
    value: '',
    textContent: '',
    dataset: {},
    style: {},
    classList: createClassList(),
    listeners: {},
    disabled: false,
    addEventListener(type, handler) { this.listeners[type] = handler; },
    querySelector() { return null; },
    ...overrides
  };
}

test('auth page register form collects name and phone before creating clinic account', async () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'src', 'pages', 'auth.html'), 'utf8');
  assert.match(html, /name="name"/);
  assert.match(html, /name="phone"/);

  const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'auth.js'), 'utf8');
  const loginButton = createNode();
  const registerButton = createNode();
  const loginTab = createNode({ dataset: { tab: 'login' }, classList: createClassList() });
  const registerTab = createNode({ dataset: { tab: 'register' }, classList: createClassList() });
  const loginError = createNode({ style: {} });
  const registerError = createNode({ style: {} });
  const apiCalls = [];

  const loginForm = createNode({
    id: 'loginForm',
    email: createNode({ value: '' }),
    password: createNode({ value: '' }),
    classList: createClassList(),
    querySelector(selector) {
      return selector === 'button[type="submit"]' ? loginButton : null;
    }
  });

  const registerForm = createNode({
    id: 'registerForm',
    name: createNode({ value: 'Serzhan S' }),
    phone: createNode({ value: '+7 (701) 123 45 - 67' }),
    email: createNode({ value: 'patient@example.com' }),
    password: createNode({ value: 'Password1!' }),
    confirmPassword: createNode({ value: 'Password1!' }),
    classList: createClassList(),
    querySelector(selector) {
      return selector === 'button[type="submit"]' ? registerButton : null;
    }
  });

  const document = {
    querySelectorAll(selector) {
      if (selector === '.auth-tab') return [loginTab, registerTab];
      if (selector === '.auth-form') return [loginForm, registerForm];
      return [];
    },
    getElementById(id) {
      const map = {
        loginForm,
        registerForm,
        loginError,
        registerError
      };
      return map[id] || null;
    }
  };

  const sandbox = {
    window: {
      api: {
        post(endpoint, payload) {
          apiCalls.push({ endpoint, payload });
          if (endpoint === '/auth/register') return Promise.resolve({ ok: true });
          if (endpoint === '/auth/login') return Promise.resolve({ access_token: 'token-1' });
          throw new Error('Unexpected endpoint');
        }
      },
      localStorage: {
        setItem() {}
      },
      location: {
        search: '?returnTo=doctor.html%3Fdoctor%3D4',
        href: 'auth.html'
      },
      IntegratI18n: {
        t(_key, fallback) { return fallback; }
      },
      URLSearchParams
    },
    document,
    console,
    URLSearchParams
  };

  vm.runInNewContext(code, sandbox, { filename: 'auth.js' });
  assert.ok(registerForm.listeners.submit, 'expected register submit handler');

  await registerForm.listeners.submit({ preventDefault() {} });

  assert.equal(apiCalls.length, 2);
  assert.equal(apiCalls[0].endpoint, '/auth/register');
  assert.equal(apiCalls[0].payload.name, 'Serzhan S');
  assert.equal(apiCalls[0].payload.phone, '77011234567');
  assert.equal(apiCalls[0].payload.email, 'patient@example.com');
  assert.equal(apiCalls[0].payload.password, 'Password1!');
});
