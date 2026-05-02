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

const rootIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=/src/pages/index.html">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting...</title>
  <script>
    window.location.replace('/src/pages/index.html');
  </script>
</head>
<body>
  <p>Redirecting to <a href="/src/pages/index.html">the site</a>...</p>
</body>
</html>
`;

fs.writeFileSync(path.join(publicDir, 'index.html'), rootIndexHtml);
