# `@rauchbar/deals-core`

Shared TypeScript contracts for the Rauchbar MVP deal pipeline.

## Scope

`deals-core` is the source of truth for the contracts shared across site, admin, worker, and notifications:

- canonical merchant and source references
- adapter ingestion input and output payloads
- normalized deal entities and lifecycle state
- ingest run telemetry
- admin review and publication shapes
- subscriber preference, member profile, hot-deal, and digest matching payloads

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

`normalizationStatus` and `reviewStatus` stay separate from lifecycle so worker output, admin moderation, and publication timing remain decoupled.

## Domain Coverage

- `MerchantReference`, `SourceReference`, `SourceOffer`, and `SourceAdapterOutput` cover shop ingestion.
- `ProductCatalogEntry`, `NormalizedDealCandidate`, and `PublishedDeal` add the richer domain layer needed for curation and delayed publication.
- `MemberSignupInput`, `MemberProfile`, `NotificationPreference`, and `MemberAdminStatus` define the shared member contract across signup, delivery, and admin runtime views.
- `Subscription`, `SubscriberPreferences`, `HotDealRule`, `DigestRule`, `DealMatch`, `WorkerContracts`, and `AdminContracts` define the cross-app boundaries for member matching and operations.

## Current Assumptions

- MVP merchants are German-speaking market shops in `DE`, `AT`, or `CH`.
- Currency is fixed to `EUR`.
- Email and WhatsApp are the only immediate-notification channels in scope.
- Weekly digest is the only digest cadence in MVP.
- Public publication remains delayed by `24` hours relative to member access.
- Cross-stream identifiers are opaque strings for now. Storage-specific formats are intentionally left open.

## Member Contract Notes

- Site signup should emit `MemberSignupInput`, with required email, digest consent, optional preference detail, and explicit notification toggles.
- Notifications should read `NotificationPreference`, `SubscriberChannelPreference`, and `MemberProfile.consents` instead of redefining recipient preference gates.
- Admin surfaces should use `MemberAdminStatus` for digest state, alert-channel verification/failure state, and preference completeness messaging.

## Notes

The task referenced `docs/roadmap/cycle-001-delivery-plan.md`, but that file was not present in this worktree while these contracts were authored. This package therefore aligns to:

- `docs/product/prd.md`
- `docs/architecture/overview.md`
- `docs/roadmap/mvp-cycle-001.md`
