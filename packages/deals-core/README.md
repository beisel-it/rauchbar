# `@rauchbar/deals-core`

Shared TypeScript contracts for the Rauchbar MVP deal pipeline.

## Scope

`deals-core` is the source of truth for the contracts shared across site, admin, worker, and notifications:

- canonical merchant and source references
- adapter ingestion input and output payloads
- normalized deal entities and lifecycle state
- ingest run telemetry
- hot-deal evaluation input and result payloads
- subscriber preference and digest entry shapes

## Lifecycle

The current MVP deal lifecycle is:

1. `discovered`
2. `normalized`
3. `ready-for-review`
4. `approved`
5. `scheduled`
6. `published-members`
7. `published-public`
8. `archived`

`normalizationStatus` and `reviewStatus` are separate from lifecycle to keep worker output, admin moderation, and publication timing decoupled.

## Integration Notes

- Worker ingestion should emit `SourceAdapterOutput`, then persist or upsert `NormalizedDealPayload`.
- Admin should treat `reviewStatus` and `lifecycleStatus` as the operational control surface.
- Site should use `publication.memberVisibleAt` and `publication.publicVisibleAt` to enforce the 24h public delay.
- Notifications should consume `HotDealEvaluationResult` plus `SubscriberDealPreferences` to decide whether to send immediate alerts.

## Current Assumptions

- MVP merchants are German-speaking market shops in `DE`, `AT`, or `CH`.
- Currency is fixed to `EUR`.
- Cross-stream identifiers are opaque strings for now. Storage-specific formats are intentionally left open.
- The delivery-plan file referenced by the task was not present in this worktree while these contracts were authored, so the package aligns to the PRD and architecture docs plus coordinator guidance received through ClawTeam.
