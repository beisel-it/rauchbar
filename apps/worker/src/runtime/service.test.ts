import { test } from 'node:test';
import assert from 'node:assert/strict';

import { getWorkerRuntimeConfig } from './config.ts';
import { createWorkerHttpServer } from './http.ts';

test('worker runtime exposes health and readiness endpoints for deployment probes', async () => {
  const config = getWorkerRuntimeConfig({
    PORT: '0',
    HOST: '127.0.0.1',
    WORKER_ROLE: 'scrape-service',
    SCRAPER_JOB_QUEUE: 'scraper-jobs',
    QUEUE_CONCURRENCY: '6',
    LOG_LEVEL: 'info',
  });
  const { server, setReady } = createWorkerHttpServer(config);

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const address = server.address();
  assert.ok(address && typeof address !== 'string');

  const baseUrl = `http://127.0.0.1:${address.port}`;

  const healthResponse = await fetch(`${baseUrl}/healthz`);
  assert.equal(healthResponse.status, 200);
  const healthBody = (await healthResponse.json()) as Record<string, unknown>;
  assert.equal(healthBody.service, 'worker');
  assert.equal(healthBody.ready, false);
  assert.equal(healthBody.workerRole, 'scrape-service');
  assert.equal(healthBody.scraperJobQueue, 'scraper-jobs');
  assert.equal(healthBody.queueConcurrency, 6);

  const readyBefore = await fetch(`${baseUrl}/readyz`);
  assert.equal(readyBefore.status, 503);

  setReady(true);

  const readyAfter = await fetch(`${baseUrl}/readyz`);
  assert.equal(readyAfter.status, 200);

  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});
