# Site And Admin Deployment Readiness

This pass verifies the current deployable interface for `site` and `admin` against the baseline in `docs/architecture/deployment-baseline.md`.

## Verified Commands

### Site

- build: `corepack pnpm --filter @rauchbar/site build`
- start: `corepack pnpm --filter @rauchbar/site start`
- local verification port: `10080`

### Admin

- build: `corepack pnpm --filter @rauchbar/admin build`
- start: `corepack pnpm --filter @rauchbar/admin start`
- local verification port: `10081`

## Health Interface

Both services now expose:

- `GET /health/live`
- `GET /health/ready`

Expected behavior:

- `site /health/live`: returns `200` when the Node process is alive
- `site /health/ready`: returns `200` only when built static assets exist; otherwise `503`
- `admin /health/live`: returns `200` when the placeholder runtime is alive
- `admin /health/ready`: returns `200` for the placeholder runtime

## Deployment Notes

- Both services bind to `0.0.0.0` and read `PORT` from the environment.
- Both services are stateless and do not write runtime data to local disk.
- The site serves build artifacts from `apps/site/dist`.
- The admin service is deployable as a placeholder, but it is not the final MVP admin UI.

## Remaining Gaps

- Render descriptor files, env skeletons, and release/rollback mechanics are still external to this pass.
- The admin runtime is intentionally only a deployment placeholder and still needs the full operator UI implementation.
- No external API or auth integration is present yet, so readiness today is process/runtime readiness rather than upstream dependency readiness.
