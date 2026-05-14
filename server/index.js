const http = require('http');
const fs = require('fs');
const path = require('path');
const eventsHandler = require('./events');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve(__dirname, '..', '.env'));
loadEnvFile(path.resolve(__dirname, '.env'));

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function withHelpers(response) {
  response.status = (code) => {
    response.statusCode = code;
    return response;
  };
  response.json = (payload) => {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(payload));
    return response;
  };
  return response;
}

async function runHandler(handler, request, response) {
  const enhancedResponse = withHelpers(response);
  request.body = await readRequestBody(request);
  await handler(request, enhancedResponse);
}

const server = http.createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', process.env.CONTACT_ALLOWED_ORIGIN || 'http://localhost:5173');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    if (request.method === 'OPTIONS') {
      response.statusCode = 204;
      response.end();
      return;
    }

    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

    if (request.method === 'GET' && url.pathname === '/health') {
      withHelpers(response).json({ ok: true });
      return;
    }

    if (url.pathname === '/api/events') {
      await runHandler(eventsHandler, request, response);
      return;
    }

    response.statusCode = 404;
    response.end('Not found');
  } catch (error) {
    withHelpers(response).status(400).json({
      error: error instanceof Error ? error.message : 'Request failed.'
    });
  }
});

const port = Number(process.env.PORT || 4000);
server.listen(port, () => {
  console.log(`Integrat API server running at http://localhost:${port}`);
});
