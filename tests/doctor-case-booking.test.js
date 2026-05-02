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
    classList: { toggle() {}, add() {}, remove() {} },
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    ...overrides
  };
}

test('doctor case booking submits appointment for selected doctor instead of redirecting to doctors list', async () => {
  const siteDataCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'shared', 'site-data.js'), 'utf8');
  const doctorCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'doctor.js'), 'utf8');

  const section = createNode({ dataset: {} });
  const title = createNode();
  const description = createNode();
  const tenure = createNode();
  const specialtiesLeft = createNode();
  const specialtiesRight = createNode();
  const bookingStatus = createNode();
  const dateInput = createNode({ value: '2026-05-03T10:30' });
  const bookingButton = createNode();
  const nextButton = createNode();
  const prevButton = createNode();
  const slider = createNode();
  const slides = [createNode({ classList: { toggle() {} } }), createNode({ classList: { toggle() {} } })];
  const apiCalls = [];

  const queryMap = {
    '.doctor-section': section,
    '.doctor-info h2': title,
    '.doctor-description': description,
    '.doctor-service strong': tenure,
    '.doctor-specialties > div:first-child': specialtiesLeft,
    '.doctor-specialties > div:last-child': specialtiesRight,
    '.doctor-case-booking__input': dateInput,
    '.doctor-case-booking__status': bookingStatus,
    '.next': nextButton,
    '.prev': prevButton,
    '.doctor-slider': slider,
    '.doctor-btn': bookingButton
  };

  const document = {
    querySelector(selector) {
      return queryMap[selector] || null;
    },
    querySelectorAll(selector) {
      return selector === '.slide' ? slides : [];
    }
  };

  const sandbox = {
    window: {
      location: {
        href: 'doctor.html?doctor=4',
        pathname: '/src/pages/doctor.html',
        search: '?doctor=4'
      },
      localStorage: {
        getItem(key) {
          return key === 'token' ? 'clinic-token' : null;
        }
      },
      api: {
        post(endpoint, payload) {
          apiCalls.push({ endpoint, payload });
          return Promise.resolve({ status: 'success' });
        }
      },
      IntegratI18n: {
        t(_key, fallback) { return fallback; },
        format(_key, _values, fallback) { return fallback; },
        isRussian() { return false; }
      },
      setInterval() { return 1; },
      clearInterval() {},
      setTimeout(fn) { fn(); return 1; },
      URLSearchParams
    },
    document,
    console,
    URLSearchParams,
    setInterval() { return 1; },
    clearInterval() {},
    setTimeout(fn) { fn(); return 1; }
  };

  vm.runInNewContext(siteDataCode, sandbox, { filename: 'site-data.js' });
  vm.runInNewContext(doctorCode, sandbox, { filename: 'doctor.js' });

  assert.equal(title.textContent, 'Dr. Timur Sadykov');
  assert.ok(bookingButton.listeners.click, 'expected booking click handler');
  await bookingButton.listeners.click();

  assert.equal(apiCalls.length, 1);
  assert.equal(apiCalls[0].endpoint, '/appointments');
  assert.equal(apiCalls[0].payload.doctor_id, 4);
  assert.equal(apiCalls[0].payload.datetime, '2026-05-03T10:30:00.000Z');
  assert.notEqual(sandbox.window.location.href, 'doctors.html');
});
