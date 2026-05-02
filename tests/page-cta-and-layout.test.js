const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('academy page loads clinic api before shared contact form and has a local contact CTA target', () => {
  const html = read('src/pages/academy.html');
  const apiIndex = html.indexOf('../scripts/shared/api.js');
  const contactIndex = html.indexOf('../scripts/shared/contact-form.js');
  assert.notEqual(apiIndex, -1, 'academy page should include shared api client');
  assert.notEqual(contactIndex, -1, 'academy page should include shared contact form script');
  assert.ok(apiIndex < contactIndex, 'academy page should load api.js before contact-form.js');
  assert.match(html, /id="contactForm"/);
});

test('about page meet-the-team CTA targets the about video section and videos are pausable with controls', () => {
  const html = read('src/pages/about.html');
  assert.match(html, /<div class="header-right">\s*<button class="btn-outline">/);
  assert.doesNotMatch(html, /<div class="header-right">[\s\S]*btn-black/);
  assert.match(html, /<a href="#aboutVideoSection" class="academy-btn">/);
  assert.match(html, /<section class="about-section" id="aboutVideoSection">/);
  assert.match(html, /<video[\s\S]*?controls/);
  assert.match(html, /<div class="doctors-grid" data-people-grid="doctors" data-people-limit="5">/);
  assert.doesNotMatch(html, /data-people-filters="doctors"/);
});

test('doctors page css prevents horizontal overflow in filters and long doctor labels', () => {
  const css = read('src/styles/doctors.css');
  assert.match(css, /\.doctors-filters\s*\{[\s\S]*flex-wrap:\s*wrap/);
  assert.match(css, /\.treatments-filters\s*\{[\s\S]*flex-wrap:\s*wrap/);
  assert.match(css, /\.doctor-card p\s*\{[\s\S]*overflow-wrap:\s*anywhere/);
});
