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
    }
  };
}

function createNode(overrides = {}) {
  return {
    textContent: '',
    href: '',
    style: {},
    classList: createClassList(),
    listeners: {},
    addEventListener(type, handler) { this.listeners[type] = handler; },
    getAttribute(name) { return this[name]; },
    setAttribute(name, value) { this[name] = value; },
    removeAttribute(name) { delete this[name]; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    ...overrides
  };
}

test('global nav wires treatment-card appointment promos through auth before opening the doctors page', () => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'shared', 'global-nav.js'), 'utf8');
  const treatmentCard = createNode({ href: '#' });

  const document = {
    readyState: 'complete',
    querySelector(selector) {
      if (selector === '.header-right .btn-black') return null;
      if (selector === '.nav-pill') return null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '.book-pill') return [];
      if (selector === '.treatment-card[href="#"]') return [treatmentCard];
      if (selector === '.nav-pill .pill') return [];
      if (selector === '.site-footer__links') return [];
      if (selector === '.logo, .site-footer__logo') return [];
      if (selector === '.address') return [];
      if (selector === '.phone') return [];
      if (selector === '.map') return [];
      if (selector === '.site-footer__copy') return [];
      if (selector === '.site-footer__tagline') return [];
      if (selector === 'a.social, a.site-footer__social') return [];
      return [];
    },
    getElementById(id) {
      return id === 'contactForm' ? null : null;
    }
  };

  const sandbox = {
    window: {
      location: {
        pathname: '/src/pages/about.html',
        search: '',
        hash: '',
        href: 'about.html'
      },
      setTimeout(fn) { fn(); return 1; },
      localStorage: {
        getItem() { return null; },
        removeItem() {}
      },
      IntegratConfig: {
        contact: {},
        socials: {},
        siteScope: {
          navItems: [],
          archivedPages: []
        }
      },
      IntegratI18n: {
        applyDomTranslations() {}
      }
    },
    document,
    console
  };

  vm.runInNewContext(code, sandbox, { filename: 'global-nav.js' });
  assert.ok(treatmentCard.listeners.click, 'expected treatment-card click handler');

  let prevented = false;
  treatmentCard.listeners.click({
    preventDefault() { prevented = true; }
  });

  assert.equal(prevented, true);
  assert.equal(sandbox.window.location.href, 'auth.html?returnTo=doctors.html');
});

test('global nav applies configured social links and external-link attributes', () => {
  const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'shared', 'global-nav.js'), 'utf8');

  const socialImage = {
    getAttribute(name) {
      return name === 'src' ? '../../assets/icons/whatsapp.svg' : '';
    }
  };
  const socialLink = createNode({
    href: '#',
    'aria-label': 'WhatsApp',
    querySelector(selector) {
      return selector === 'img' ? socialImage : null;
    }
  });

  const document = {
    readyState: 'complete',
    querySelector(selector) {
      if (selector === '.header-right .btn-black') return null;
      if (selector === '.nav-pill') return null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '.book-pill') return [];
      if (selector === '.treatment-card[href="#"]') return [];
      if (selector === '.nav-pill .pill') return [];
      if (selector === '.site-footer__links') return [];
      if (selector === '.logo, .site-footer__logo') return [];
      if (selector === '.address') return [];
      if (selector === '.phone') return [];
      if (selector === '.map') return [];
      if (selector === '.site-footer__copy') return [];
      if (selector === '.site-footer__tagline') return [];
      if (selector === 'a.social, a.site-footer__social') return [socialLink];
      return [];
    },
    getElementById() {
      return null;
    }
  };

  const sandbox = {
    window: {
      location: {
        pathname: '/src/pages/index.html',
        search: '',
        hash: '',
        href: 'index.html'
      },
      setTimeout(fn) { fn(); return 1; },
      localStorage: {
        getItem() { return null; },
        removeItem() {}
      },
      IntegratConfig: {
        contact: {},
        socials: {
          whatsapp: 'https://wa.me/+77711140710'
        },
        siteScope: {
          navItems: [],
          archivedPages: []
        }
      },
      IntegratI18n: {
        applyDomTranslations() {}
      }
    },
    document,
    console
  };

  vm.runInNewContext(code, sandbox, { filename: 'global-nav.js' });

  assert.equal(socialLink.href, 'https://wa.me/+77711140710');
  assert.equal(socialLink.target, '_blank');
  assert.equal(socialLink.rel, 'noopener noreferrer');
});
