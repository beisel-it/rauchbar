import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const indexFile = path.join(distDir, 'index.html');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 10000);

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.ico', 'image/x-icon'],
  ['.webp', 'image/webp'],
]);

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
};

const sendFile = async (response, filePath) => {
  const extension = path.extname(filePath);
  const contentType = contentTypes.get(extension) || 'application/octet-stream';
  response.writeHead(200, { 'content-type': contentType });
  createReadStream(filePath).pipe(response);
};

const getSafeAssetPath = (pathname) => {
  const normalizedPath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const requestedPath = normalizedPath === '/' ? '/index.html' : normalizedPath;
  const absolutePath = path.join(distDir, requestedPath);

  if (!absolutePath.startsWith(distDir)) {
    return null;
  }

  return absolutePath;
};

const checkReady = async () => {
  try {
    await access(indexFile);
    return { ready: true };
  } catch {
    return {
      ready: false,
      reason: 'site-build-missing',
    };
  }
};

const server = http.createServer(async (request, response) => {
  if (!request.url) {
    sendJson(response, 400, { status: 'error', reason: 'missing-url' });
    return;
  }

  const { pathname } = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (pathname === '/health/live') {
    sendJson(response, 200, {
      service: 'site',
      status: 'live',
      stateless: true,
    });
    return;
  }

  if (pathname === '/health/ready') {
    const readiness = await checkReady();
    sendJson(response, readiness.ready ? 200 : 503, {
      service: 'site',
      status: readiness.ready ? 'ready' : 'not-ready',
      ...readiness,
    });
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendJson(response, 405, { status: 'error', reason: 'method-not-allowed' });
    return;
  }

  const safePath = getSafeAssetPath(pathname);
  if (!safePath) {
    sendJson(response, 400, { status: 'error', reason: 'invalid-path' });
    return;
  }

  try {
    const fileStat = await stat(safePath);
    if (fileStat.isFile()) {
      await sendFile(response, safePath);
      return;
    }
  } catch {
    // Fall through to SPA entrypoint.
  }

  try {
    await sendFile(response, indexFile);
  } catch {
    sendJson(response, 503, {
      service: 'site',
      status: 'not-ready',
      reason: 'site-build-missing',
    });
  }
});

server.listen(port, host, () => {
  console.log(`@rauchbar/site listening on http://${host}:${port}`);
});
