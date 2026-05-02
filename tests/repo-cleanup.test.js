const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('repo no longer contains dead dashboard artifacts or duplicate root frontend tree', () => {
  const disallowedPaths = [
    'pages',
    'css',
    'js',
    'icons',
    'src/pages/dashboard.html',
    'src/scripts/dashboard.js',
    'src/styles/dashboard.css'
  ];

  disallowedPaths.forEach((relativePath) => {
    assert.equal(
      fs.existsSync(path.join(repoRoot, relativePath)),
      false,
      `unexpected leftover file or directory: ${relativePath}`
    );
  });
});

test('active frontend scripts and docs do not reference removed dashboard flow', () => {
  const files = [
    'src/scripts/shared/global-nav.js',
    'src/scripts/shared/i18n.js',
    'README.md',
    'docs/project-defense.md',
    'docs/academy-backend.md',
    'docs/deploy-and-use.md',
    'src/backend/academy/server.js'
  ];

  files.forEach((relativePath) => {
    const content = read(relativePath);
    assert.equal(
      /dashboard\.html|dashboard\.js|dashboard\.css|\/dashboard\/summary|dashboard_/i.test(content),
      false,
      `unexpected dashboard reference in ${relativePath}`
    );
  });
});

test('asset root only contains managed directories', () => {
  const assetEntries = fs.readdirSync(path.join(repoRoot, 'assets'), { withFileTypes: true });
  const entryNames = assetEntries.map((entry) => entry.name).sort();

  assert.deepEqual(entryNames, ['icons', 'images']);
  assert.ok(assetEntries.every((entry) => entry.isDirectory()), 'assets root should only contain directories');
});
