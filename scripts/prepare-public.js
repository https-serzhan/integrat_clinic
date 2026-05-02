const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

const copies = [
  ['assets', 'assets'],
  ['src/pages', 'src/pages'],
  ['src/scripts', 'src/scripts'],
  ['src/styles', 'src/styles']
];

fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });

for (const [sourceRelative, destinationRelative] of copies) {
  const sourcePath = path.join(rootDir, sourceRelative);
  const destinationPath = path.join(publicDir, destinationRelative);
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.cpSync(sourcePath, destinationPath, { recursive: true });
}
