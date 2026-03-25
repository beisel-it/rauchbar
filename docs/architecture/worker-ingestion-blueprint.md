# Worker Ingestion Blueprint

## Goal

Define an implementable ingestion pipeline for Rauchbar that keeps source-specific scraping isolated, hands normalized data into `@rauchbar/deals-core`, and exposes enough ingestion state for admin and notification workflows.

Horizontal scalability across multiple queued workers is a hard requirement. The ingestion design must stay safe when many worker processes pull jobs concurrently from the same queue.

## Ownership Boundaries

### Worker owns

- merchant source adapters and scheduling
- queue job planning and idempotent source-level work decomposition
- source payload fetch and extraction into `SourceAdapterOutput`
- normalization into `NormalizedDealPayload`
- `IngestRun` logging and source health derivation from run history
- hot-deal evaluation input assembly and queueing

### `@rauchbar/deals-core` owns

- shared entity and status types
- the handoff shape between adapter input/output, normalized deal payloads, ingest runs, and hot-deal evaluation records
- hot-deal evaluation input and result contracts

### Admin owns

- merchant enable or pause decisions
- triage of `flagged` deals and failing merchants
- manual replay triggers for failed or partial crawl runs

### Notifications owns

- channel delivery execution for digest and hot-deal dispatches
- persistence of `DealDispatch` results back into shared records

## Source Adapter Boundary

Each merchant source adapter should implement the shared input and output types from `@rauchbar/deals-core`.

```ts
type MerchantSourceAdapter = {
  sourceId: string;
  parse(input: SourceAdapterInput): Promise<SourceAdapterOutput>;
};
```

Boundary rules:

- adapters return only merchant-local observations as `OfferObservation`
- adapters do not assign normalization, review, or lifecycle status
- adapters may emit `warnings` for partial parsing issues without failing the whole run
- adapters should keep transport details outside the shared contract except for `requestUrl`, `contentType`, and `payload`
- adapters must remain stateless so a queued job can run on any worker instance

## Queue-Friendly Worker Decomposition

Workers must decompose scraping into one queueable job per `(merchant, source)` pair.

Required properties:

- each queued job is self-contained: merchant reference, source reference, request URL, and requested timestamp travel with the job
- workers do not rely on shared in-memory registries for job ownership or scheduling decisions
- queue claims should use a deterministic source-level key such as `merchantId:sourceId`
- normalization must be idempotent so retries or duplicated deliveries do not create duplicate canonical deals
- queue sharding may use source origin such as `newsletter-mail` versus `webshop`, but execution semantics stay identical

## Ingestion Stages

### 1. Fetch source payloads

- enqueue one job per active `SourceReference`
- allow any available worker to claim and execute a job independently
- persist a pending-to-running `IngestRun` around each fetch-and-parse attempt
- skip inactive merchants or sources before creating work

### 2. Parse adapter output

- adapter emits `SourceAdapterOutput.observedOffers`
- hard failures set the `IngestRun` to `failed`
- partial parses keep the run `partial` when at least one offer was observed

### 3. Normalize into candidates

- convert offer observations into `NormalizedDealPayload`
- use `normalizationStatus` for parser quality and `reviewStatus` for approval posture
- route uncertain records to `needs-review` plus `ready-for-review` rather than dropping them silently

### 4. Promote to canonical deal records

- dedupe on merchant, source, listing URL, and stable external ID when present
- create or update canonical `NormalizedDealPayload` records
- move `lifecycleStatus` from `discovered` to `normalized` to `ready-for-review`
- reserve `approved` and `scheduled` for records that passed auto or manual review
- keep upserts safe under concurrent workers by using the same dedupe key during retries and duplicate deliveries

### 5. Evaluate hot-deal eligibility

- run after normalization and before notification fan-out
- build `HotDealEvaluationInput` from `NormalizedDealPayload` plus pricing baselines and matched preference tags
- persist `HotDealEvaluationResult` on the normalized deal record or a side table used by notifications
- allow `eligibleChannels` to drive hot-deal fan-out while digest selection remains a separate ranking step

### 6. Publish and dispatch handoff

- approved deals move from `approved` to `scheduled`
- set `publication.memberVisibleAt`, `publication.publicVisibleAt`, and `publication.membersVisibleUntil` when the 24h member window starts
- notification workers consume only deals with `reviewStatus: approved` and publication channels populated

## Monitoring Strategy

Derive the admin-facing health surface from `IngestRun` history per merchant and source instead of introducing a second shared lifecycle object.

Operational interpretation:

- healthy source: recent `succeeded` run and no unusual warning pattern
- degraded source: repeated `partial` runs or stale observations
- failing source: repeated `failed` runs or sustained no-data conditions for an active source

Recommended signals:

- recent run status sequence
- last successful run timestamp
- last observed offer timestamp from `OfferObservation.observedAt`
- fetch and parse latency
- warning count trend

## Retry Policy

Retries should reuse the shared `IngestRun` statuses instead of inventing a separate retry lifecycle.

- retry `failed` runs with bounded backoff
- retry `partial` runs only when warnings indicate transport or parse instability
- stop automatic retries when merchant or source `active` is `false`
- after the retry budget is exhausted, surface the source as failing in admin using run-history aggregation
- retries must re-enqueue the same source-scoped job shape so another worker can resume without local process context

## Hot-Deal Plug-In Point

Hot-deal evaluation belongs after normalization because it depends on canonical product and price fields, but before notification dispatch because it decides whether an immediate channel should be queued.

This keeps the sequence:

`SourceAdapterInput` -> `SourceAdapterOutput` -> `NormalizedDealPayload` -> `HotDealEvaluationResult` -> notification selection

## First Merchant Rollout

Start with one adapter per merchant listing source and keep product-detail crawling optional.

- implement one listing-page adapter for the first German cigar merchant
- capture `OfferObservation.externalId` when available to improve dedupe stability
- add product-detail enrichment only when listing data is insufficient for pricing or availability
- expose source health from `IngestRun` trends in admin before scaling to more merchants
- validate the first adapter against queue-style execution rather than a single long-running worker loop
