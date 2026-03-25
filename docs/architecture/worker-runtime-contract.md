# Worker Runtime Contract

## Goal

Define the minimal deployment-facing contract for `@rauchbar/worker` so platform descriptors can target a stable runtime without assuming crawler internals.

## Runtime Entrypoint

- package: `@rauchbar/worker`
- start command: `pnpm --filter @rauchbar/worker start`
- implementation entrypoint: `apps/worker/src/service.ts`
- expected process model: one stateless worker service container per replica

The runtime contract intentionally avoids single-worker coordination. Queue job ownership and retries happen outside the process via the deployment queue or scheduler.

## Health Surfaces

The worker exposes an HTTP probe server.

- bind host: `HOST`, default `0.0.0.0`
- bind port: `PORT`, default `8080`
- liveness: `GET /healthz`
- readiness: `GET /readyz`

Response shape:

```json
{
  "service": "worker",
  "status": "ok",
  "ready": true,
  "workerRole": "scrape-service",
  "scraperJobQueue": "scraper-jobs",
  "queueConcurrency": 4,
  "uptimeSeconds": 12
}
```

Readiness returns `503` until the service is listening and marked ready. Liveness returns `200` while the process is healthy.

## Logging Contract

- newline-delimited JSON
- stdout for `debug` and `info`
- stderr for `warn` and `error`
- each record includes `service`, `level`, `message`, and ISO timestamp

Example startup log:

```json
{"level":"info","message":"worker-runtime-started","service":"worker","timestamp":"2026-03-25T18:00:00.000Z","host":"0.0.0.0","port":8080,"workerRole":"scrape-service","scraperJobQueue":"scraper-jobs","queueConcurrency":4,"healthPath":"/healthz","readyPath":"/readyz"}
```

## Environment Contract

- `HOST`: optional probe-server bind host, default `0.0.0.0`
- `PORT`: optional probe-server port, default `8080`
- `LOG_LEVEL`: runtime log level label, default `info`
- `WORKER_ROLE`: deployment role name, default `scrape-service`
- `SCRAPER_JOB_QUEUE`: queue/topic name for scraper jobs, default `scraper-jobs`
- `QUEUE_CONCURRENCY`: per-process queue concurrency hint, default `4`

These variables are deployment-descriptor friendly and safe to reuse across multiple replicas.

## Docker Contract

Worker container definition lives at `apps/worker/Dockerfile`.

Descriptor assumptions:

- build context: repo root
- Dockerfile path: `apps/worker/Dockerfile`
- exposed container port: `8080`
- healthcheck command: `node --experimental-strip-types apps/worker/src/healthcheck.ts`
- default command: `pnpm --filter @rauchbar/worker start`

## Multi-Worker Constraint

- each replica may process queue jobs independently
- queue jobs must stay source-scoped and idempotent
- no in-memory leader election or singleton scheduler assumption is allowed in the worker runtime contract

This keeps deployment scaling horizontal: more replicas only increase claim capacity for queued jobs.
