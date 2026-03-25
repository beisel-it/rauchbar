import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import type { WorkerRuntimeConfig } from './config.ts';

export type WorkerRuntimeSnapshot = {
  service: 'worker';
  status: 'ok';
  ready: boolean;
  workerRole: string;
  scraperJobQueue: string;
  queueConcurrency: number;
  uptimeSeconds: number;
};

export function createWorkerRuntimeSnapshot(
  config: WorkerRuntimeConfig,
  startedAt: number,
  ready: boolean,
): WorkerRuntimeSnapshot {
  return {
    service: 'worker',
    status: 'ok',
    ready,
    workerRole: config.workerRole,
    scraperJobQueue: config.scraperJobQueue,
    queueConcurrency: config.queueConcurrency,
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
  };
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

export function createWorkerHttpServer(config: WorkerRuntimeConfig): {
  server: Server;
  setReady: (value: boolean) => void;
} {
  const startedAt = Date.now();
  let ready = false;

  const requestListener = (request: IncomingMessage, response: ServerResponse): void => {
    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'method-not-allowed' });
      return;
    }

    if (request.url === '/healthz') {
      sendJson(response, 200, createWorkerRuntimeSnapshot(config, startedAt, ready));
      return;
    }

    if (request.url === '/readyz') {
      sendJson(response, ready ? 200 : 503, createWorkerRuntimeSnapshot(config, startedAt, ready));
      return;
    }

    sendJson(response, 404, { error: 'not-found' });
  };

  const server = createServer(requestListener);

  return {
    server,
    setReady(value: boolean) {
      ready = value;
    },
  };
}
