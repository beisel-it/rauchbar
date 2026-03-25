import http from 'node:http';

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 10001);

const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rauchbar Admin</title>
    <style>
      :root {
        color-scheme: light;
        font-family: "Segoe UI", sans-serif;
        background: #f6f1e8;
        color: #13110d;
      }
      body {
        margin: 0;
        padding: 48px 20px;
      }
      main {
        max-width: 880px;
        margin: 0 auto;
        background: rgba(255, 248, 238, 0.92);
        border: 1px solid rgba(19, 17, 13, 0.12);
        border-radius: 24px;
        padding: 32px;
      }
      h1 {
        margin-top: 0;
        font-size: 2.5rem;
      }
      p, li {
        line-height: 1.6;
      }
      code {
        background: rgba(19, 17, 13, 0.08);
        border-radius: 8px;
        padding: 2px 6px;
      }
    </style>
  </head>
  <body>
    <main>
      <p>Rauchbar Admin</p>
      <h1>Deployment placeholder for the admin surface</h1>
      <p>
        This service is intentionally stateless and exists to provide a stable deployment interface
        while the full admin UI is still under construction.
      </p>
      <ul>
        <li><code>GET /health/live</code> returns liveness.</li>
        <li><code>GET /health/ready</code> returns readiness for the placeholder runtime.</li>
        <li>All other routes return this placeholder page.</li>
      </ul>
    </main>
  </body>
</html>
`;

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
};

const server = http.createServer((request, response) => {
  if (!request.url) {
    sendJson(response, 400, { status: 'error', reason: 'missing-url' });
    return;
  }

  const { pathname } = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (pathname === '/health/live') {
    sendJson(response, 200, {
      service: 'admin',
      status: 'live',
      stateless: true,
    });
    return;
  }

  if (pathname === '/health/ready') {
    sendJson(response, 200, {
      service: 'admin',
      status: 'ready',
      mode: 'placeholder',
      stateless: true,
    });
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendJson(response, 405, { status: 'error', reason: 'method-not-allowed' });
    return;
  }

  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  response.end(html);
});

server.listen(port, host, () => {
  console.log(`@rauchbar/admin listening on http://${host}:${port}`);
});
