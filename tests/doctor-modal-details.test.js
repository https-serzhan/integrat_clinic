const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createNode(overrides = {}) {
  return {
    textContent: '',
    innerHTML: '',
    value: '',
    style: {},
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    appendChild() {},
    ...overrides
  };
}

test('doctor modal Cases action opens doctor page for the selected doctor id', () => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'shared', 'doctor-modal.js'), 'utf8');

  const detailsButton = createNode({ textContent: 'Cases' });
  const bookButton = createNode({ textContent: 'Записаться к врачу' });
  const modal = createNode({
    dataset: {},
    querySelector(selector) {
      const map = {
        '.doctor-modal-close': createNode(),
        '.doctor-name': createNode(),
        '.doctor-role': createNode(),
        '.doctor-exp': createNode(),
        '.doctor-text': createNode(),
        '.doctor-modal-body': createNode({ appendChild() {} }),
        '.doctor-booking__input': createNode({ value: '2026-05-03T10:00' })
      };
      return map[selector] || null;
    },
    querySelectorAll(selector) {
      if (selector === '.doctor-modal-img, .doctor-photo') return [];
      if (selector === '.doctor-actions .btn-black') return [detailsButton, bookButton];
      return [];
    },
    addEventListener() {}
  });

  const card = createNode({
    dataset: {
      id: '4',
      name: 'Dr. Timur Sadykov',
      role: 'Implantology and bone reconstruction',
      exp: '13',
      edu: 'Education',
      spec: 'Spec',
      img: '../../assets/images/blue-doctor.png',
      specialty: 'Implantology and bone reconstruction'
    }
  });

  const document = {
    createElement() { return createNode({ setAttribute() {}, appendChild() {}, className: '' }); },
    readyState: 'complete',
    body: { style: {} },
    getElementById(id) {
      return id === 'doctorModal' ? modal : null;
    },
    addEventListener(type, handler) {
      if (type === 'click') {
        handler({ target: { closest(selector) { return selector === '.doctor-card' ? card : null; } } });
      }
    }
  };

  const sandbox = {
    window: {
      location: { href: 'doctors.html' },
      IntegratI18n: {
        t(_key, fallback) { return fallback; },
        format(_key, _values, fallback) { return fallback; },
        isRussian() { return false; }
      },
      localStorage: { getItem() { return 'token'; } },
      setTimeout() {}
    },
    document,
    console
  };

  vm.runInNewContext(code, sandbox, { filename: 'doctor-modal.js' });
  detailsButton.listeners.click();

  assert.equal(sandbox.window.location.href, 'doctor.html?doctor=4');
});
