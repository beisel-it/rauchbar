const port = Number.parseInt(process.env.PORT || '8080', 10);
const host = process.env.HEALTHCHECK_HOST || '127.0.0.1';
const url = `http://${host}:${port}/healthz`;

const response = await fetch(url);

if (!response.ok) {
  throw new Error(`Healthcheck failed with status ${response.status}`);
}
