const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createClassList() {
  const classes = new Set();
  return {
    add(...tokens) {
      tokens.forEach((token) => classes.add(token));
    },
    remove(...tokens) {
      tokens.forEach((token) => classes.delete(token));
    },
    toggle(token, force) {
      if (force === undefined) {
        if (classes.has(token)) {
          classes.delete(token);
          return false;
        }
        classes.add(token);
        return true;
      }
      if (force) classes.add(token);
      else classes.delete(token);
      return force;
    },
    contains(token) {
      return classes.has(token);
    }
  };
}

function createNode(overrides = {}) {
  return {
    value: '',
    checked: false,
    textContent: '',
    innerHTML: '',
    dataset: {},
    style: {},
    classList: createClassList(),
    listeners: {},
    children: [],
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    setAttribute(name, value) {
      this[name] = value;
    },
    closest() {
      return null;
    },
    ...overrides
  };
}

function buildFormHarness() {
  const fullname = createNode({ value: '' });
  const phone = createNode({ value: '' });
  const comment = createNode({ value: '' });
  const agree = createNode({ checked: false });
  const submitButton = createNode({ disabled: false });
  let statusNode = null;

  const form = createNode({
    reset() {
      fullname.value = '';
      phone.value = '';
      comment.value = '';
      agree.checked = false;
    },
    querySelector(selector) {
      const map = {
        '[name="fullname"]': fullname,
        '[name="comment"]': comment,
        'input[type="tel"]': phone,
        'input[name="agree"], input[type="checkbox"]': agree,
        'button[type="submit"]': submitButton,
        '[data-form-status]': statusNode
      };
      return map[selector] || null;
    },
    appendChild(child) {
      statusNode = child;
      return child;
    }
  });

  return { form, fullname, phone, comment, agree, submitButton, getStatus: () => statusNode };
}

test('shared contact form blocks invalid payloads and normalizes valid requests', async () => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'shared', 'contact-form.js'), 'utf8');
  const { form, fullname, phone, comment, agree, submitButton, getStatus } = buildFormHarness();
  const apiCalls = [];

  const document = {
    readyState: 'complete',
    body: { style: {} },
    querySelectorAll(selector) {
      return selector === '.contact-form, #contactForm' ? [form] : [];
    },
    createElement() {
      return createNode();
    }
  };

  const sandbox = {
    window: {
      api: {
        post(endpoint, payload) {
          apiCalls.push({ endpoint, payload });
          return Promise.resolve({ telegram: { configured: true } });
        }
      },
      IntegratI18n: {
        t(_key, fallback) { return fallback; },
        isRussian() { return false; }
      },
      setTimeout(fn) { fn(); return 1; }
    },
    document,
    console
  };

  vm.runInNewContext(code, sandbox, { filename: 'contact-form.js' });

  assert.ok(form.listeners.submit, 'expected submit handler');

  fullname.value = 'A';
  phone.value = '+7 (701) 123 45 - 6';
  comment.value = 'bad';
  agree.checked = false;
  await form.listeners.submit({ preventDefault() {} });

  assert.equal(apiCalls.length, 0);
  assert.equal(getStatus().textContent, 'Please complete the form correctly before submitting.');
  assert.equal(submitButton.disabled, false);

  fullname.value = 'Serzhan S';
  phone.value = '+7 (701) 123 45 - 67';
  comment.value = 'Need a consultation about implants.';
  agree.checked = true;
  await form.listeners.submit({ preventDefault() {} });

  assert.equal(apiCalls.length, 1);
  assert.equal(apiCalls[0].endpoint, '/contacts');
  assert.equal(apiCalls[0].payload.fullname, 'Serzhan S');
  assert.equal(apiCalls[0].payload.phone, '77011234567');
  assert.equal(apiCalls[0].payload.comment, 'Need a consultation about implants.');
  assert.match(getStatus().textContent, /Request sent\./);
});
