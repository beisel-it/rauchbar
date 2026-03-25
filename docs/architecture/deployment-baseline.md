# Deployment Baseline

This document defines the current deployment contract for Rauchbar web surfaces during MVP delivery.

## Target Platform

- provider: Render
- region: Frankfurt
- runtime shape: stateless Docker web services
- rollout model: staging auto-deploys from `main`, selective manual preview environments

## Non-Negotiable Runtime Constraints

- no durable local filesystem assumptions beyond build artifacts bundled into the image
- no sessions or shared cache stored only in single-process memory
- services must bind to `HOST=0.0.0.0`
- services must respect `PORT` from the environment
- services must expose `GET /health/live` and `GET /health/ready`

## Service Contracts

### Site

- workspace: `apps/site`
- build command: `corepack pnpm --filter @rauchbar/site build`
- start command: `corepack pnpm --filter @rauchbar/site start`
- default local runtime port: `10000`
- health semantics:
  - `/health/live`: process is accepting requests
  - `/health/ready`: build artifact `apps/site/dist/index.html` is present and can be served
- state model: static asset serving plus health responses only; no local session persistence

### Admin

- workspace: `apps/admin`
- build command: `corepack pnpm --filter @rauchbar/admin build`
- start command: `corepack pnpm --filter @rauchbar/admin start`
- default local runtime port: `10001`
- health semantics:
  - `/health/live`: process is accepting requests
  - `/health/ready`: placeholder service is booted and ready to answer traffic
- state model: placeholder stateless web surface until the full admin UI replaces it

## Descriptor Inputs Still Needed

- concrete Render descriptor files and env schemas per service
- image build strategy per app versus shared root image
- release/rollback wiring
- environment variable ownership once real API, auth, and notification providers are connected
