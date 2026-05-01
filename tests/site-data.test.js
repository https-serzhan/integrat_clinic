const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadSiteData() {
  const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'scripts', 'shared', 'site-data.js'), 'utf8');
  const sandbox = { window: {}, console };
  vm.runInNewContext(code, sandbox, { filename: 'site-data.js' });
  return sandbox.window.IntegratSiteData;
}

test('shared site data exposes a fuller academy content set', () => {
  const data = loadSiteData();
  assert.ok(data);
  assert.ok(Array.isArray(data.doctors));
  assert.ok(Array.isArray(data.lecturers));
  assert.ok(Array.isArray(data.academyCourses));
  assert.ok(data.doctors.length >= 8, 'expected at least 8 doctors');
  assert.ok(data.lecturers.length >= 6, 'expected at least 6 lecturers');
  assert.ok(data.academyCourses.length >= 8, 'expected at least 8 academy courses');
});

test('every academy course has a matching video catalog outline', () => {
  const data = loadSiteData();
  const courseIds = new Set(data.academyCourses.map((course) => course.id));
  const catalogIds = new Set(Object.keys(data.academyVideoCatalog || {}));
  const missing = [...courseIds].filter((id) => !catalogIds.has(id));
  assert.deepEqual(missing, []);
});
