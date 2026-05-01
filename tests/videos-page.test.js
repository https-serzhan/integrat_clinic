const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createElement() {
  return {
    textContent: '',
    innerHTML: '',
    style: {},
    hidden: false,
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    }
  };
}

function loadScripts(search) {
  const siteDataCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'shared', 'site-data.js'), 'utf8');
  const videosCode = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'videos.js'), 'utf8');
  const accessBanner = createElement();
  accessBanner.classList = { remove() {} };
  const player = createElement();
  const controls = createElement();
  const sidebar = createElement();
  const title = createElement();
  const subtitle = createElement();
  const close = createElement();

  const document = {
    getElementById(id) {
      return {
        videosAccessBanner: accessBanner,
        videosPlayer: player,
        videosBuyNow: null
      }[id] || null;
    },
    querySelector(selector) {
      return {
        '.videos-controls': controls,
        '.videos-sidebar': sidebar,
        '.videos-text h1': title,
        '.videos-text p': subtitle,
        '.videos-close': close
      }[selector] || null;
    },
    querySelectorAll() {
      return [];
    },
    addEventListener() {}
  };

  const sandbox = {
    window: {
      location: { search, href: '', pathname: '/src/pages/videos.html' },
      IntegratAuthApi: null,
      IntegratI18n: {
        t(_key, fallback) { return fallback; },
        format(_key, _values, fallback) { return fallback; },
        isRussian() { return false; }
      }
    },
    document,
    console,
    URLSearchParams,
    setTimeout,
    clearTimeout
  };

  vm.runInNewContext(siteDataCode, sandbox, { filename: 'site-data.js' });
  vm.runInNewContext(videosCode, sandbox, { filename: 'videos.js' });

  return { title, subtitle, sidebar, accessBanner };
}

test('videos page does not silently fall back to another course when course id is unknown', () => {
  const view = loadScripts('?course=missing-course');
  assert.equal(view.title.textContent, 'Course unavailable');
  assert.equal(view.subtitle.textContent, 'This course outline will be published soon.');
  assert.match(view.sidebar.innerHTML, /Course outline is not available yet\./);
});
