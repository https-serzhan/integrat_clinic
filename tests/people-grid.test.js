const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createElement(dataset = {}) {
  return {
    dataset,
    innerHTML: '',
    hidden: false,
    style: {},
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    }
  };
}

test('people grid renderer populates lecturer cards from shared data', () => {
  const siteDataCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'shared', 'site-data.js'), 'utf8');
  const peopleGridCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'shared', 'people-grid.js'), 'utf8');

  const grid = createElement({ peopleGrid: 'lecturers' });
  const root = createElement();
  root.querySelectorAll = () => [grid];

  const sandbox = {
    window: {
      IntegratI18n: {
        t(_key, fallback) { return fallback; },
        isRussian() { return false; }
      }
    },
    document: {
      querySelectorAll(selector) {
        if (selector === '[data-people-grid]') return [grid];
        return [];
      },
      addEventListener() {}
    },
    console
  };

  vm.runInNewContext(siteDataCode, sandbox, { filename: 'site-data.js' });
  vm.runInNewContext(peopleGridCode, sandbox, { filename: 'people-grid.js' });

  assert.match(grid.innerHTML, /doctor-card/);
  assert.match(grid.innerHTML, /Lecturer|Mentor|Professor|Doctor/);
});

test('people grid renderer respects per-grid item limits', () => {
  const siteDataCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'shared', 'site-data.js'), 'utf8');
  const peopleGridCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'shared', 'people-grid.js'), 'utf8');

  const grid = createElement({ peopleGrid: 'doctors', peopleLimit: '4' });

  const sandbox = {
    window: {
      IntegratI18n: {
        t(_key, fallback) { return fallback; },
        isRussian() { return false; }
      }
    },
    document: {
      querySelectorAll(selector) {
        if (selector === '[data-people-grid]') return [grid];
        return [];
      },
      addEventListener() {}
    },
    console
  };

  vm.runInNewContext(siteDataCode, sandbox, { filename: 'site-data.js' });
  vm.runInNewContext(peopleGridCode, sandbox, { filename: 'people-grid.js' });

  const matches = grid.innerHTML.match(/class="doctor-card"/g) || [];
  assert.equal(matches.length, 4);
});
