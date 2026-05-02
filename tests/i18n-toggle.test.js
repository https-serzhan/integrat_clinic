const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createButton(initialText = 'ENG') {
  return {
    textContent: initialText,
    dataset: {},
    type: '',
    listeners: {},
    closest(selector) {
      return selector === '.header-right, .auth-page, .admin-header, .videos-header, .faq-header' ? {} : null;
    },
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    }
  };
}

test('language toggle button shows the target language and switches cleanly', () => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'shared', 'i18n.js'), 'utf8');
  const langButton = createButton();
  const storageWrites = [];
  const html = {
    attrs: {},
    getAttribute(name) {
      return this.attrs[name] || '';
    },
    setAttribute(name, value) {
      this.attrs[name] = value;
    }
  };

  const document = {
    readyState: 'complete',
    body: {},
    documentElement: html,
    querySelectorAll(selector) {
      if (selector === '.btn-outline, [data-lang-toggle]') return [langButton];
      if (selector === '[placeholder]') return [];
      if (selector === '[aria-label]') return [];
      if (selector === '[title]') return [];
      if (selector === '[data-i18n-key]') return [];
      return [];
    },
    createTreeWalker() {
      return {
        nextNode() {
          return null;
        }
      };
    },
    addEventListener() {},
    dispatchEvent() {}
  };

  const sandbox = {
    window: {
      localStorage: {
        getItem() {
          return null;
        },
        setItem(key, value) {
          storageWrites.push([key, value]);
        }
      },
      NodeFilter: {
        SHOW_TEXT: 4,
        FILTER_REJECT: 2,
        FILTER_ACCEPT: 1
      },
      CustomEvent: function CustomEvent(type, init) {
        this.type = type;
        this.detail = init?.detail;
      }
    },
    CustomEvent: function CustomEvent(type, init) {
      this.type = type;
      this.detail = init?.detail;
    },
    document,
    console
  };

  vm.runInNewContext(code, sandbox, { filename: 'i18n.js' });

  assert.equal(langButton.textContent, 'RU');
  assert.equal(typeof langButton.listeners.click, 'function');

  let prevented = false;
  langButton.listeners.click({
    preventDefault() {
      prevented = true;
    }
  });

  assert.equal(prevented, true);
  assert.deepEqual(storageWrites.pop(), ['integrat.lang', 'ru']);
  assert.equal(html.attrs.lang, 'ru');
  assert.equal(langButton.textContent, 'ENG');
});
