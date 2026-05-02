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

test('shared site data keeps doctors and lecturers intentionally compact', () => {
  const data = loadSiteData();
  assert.ok(data);
  assert.ok(Array.isArray(data.doctors));
  assert.ok(Array.isArray(data.lecturers));
  assert.ok(Array.isArray(data.academyCourses));
  assert.equal(data.doctors.length, 5, 'expected exactly 5 doctors');
  assert.equal(data.lecturers.length, 5, 'expected exactly 5 lecturers');
  assert.ok(data.academyCourses.length >= 8, 'expected at least 8 academy courses');

  const doctorCategories = new Set(data.doctors.flatMap((doctor) => doctor.categories || []));
  const lecturerCategories = new Set(data.lecturers.flatMap((lecturer) => lecturer.categories || []));
  assert.ok(doctorCategories.size <= 5, 'expected at most 5 doctor categories');
  assert.ok(lecturerCategories.size <= 5, 'expected at most 5 lecturer categories');
});

test('every academy course has a matching video catalog outline', () => {
  const data = loadSiteData();
  const courseIds = new Set(data.academyCourses.map((course) => course.id));
  const catalogIds = new Set(Object.keys(data.academyVideoCatalog || {}));
  const missing = [...courseIds].filter((id) => !catalogIds.has(id));
  assert.deepEqual(missing, []);
});
