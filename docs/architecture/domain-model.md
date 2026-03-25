# Domain Model Foundation

## Purpose

This document defines the shared vocabulary for the Rauchbar MVP so worker, site, admin, and notification streams can implement against the same state model.

## Core Objects

### Merchant

- represents a German cigar shop integrated into the system
- owns adapter metadata, operating status, and base URL information
- is the anchor for crawl runs and health snapshots

### SourceAdapterInput / SourceAdapterOutput

- captures the fetched merchant payload and the observed offers extracted from it
- keeps adapter I/O tied to canonical merchant and source references
- is the boundary between merchant-specific scraping and shared normalization logic

### NormalizedDealPayload

- is the worker handoff into shared domain logic
- captures normalized product identity, pricing observation, review status, and publication metadata
- remains the shared record used by worker, admin, site, and notifications before channel-specific dispatch

### IngestRun

- records source-level ingestion outcomes for admin visibility and retry decisions
- captures counts for observed, normalized, created, and updated deals
- keeps warning and error history without inventing extra worker-only run states

## Shared State Model

### Ingest run status

- `pending`: scheduled but not started yet
- `running`: fetch or normalization in progress
- `succeeded`: finished without blocking issues
- `partial`: completed with warnings or incomplete extraction
- `failed`: run did not produce a usable result

### Normalization status

- `raw`: observed but not normalized yet
- `normalized`: canonical payload is complete enough for shared workflows
- `needs-review`: parser or policy uncertainty requires human verification
- `rejected`: intentionally suppressed before publication or dispatch

### Review status

- `pending`: not yet approved for publication or notifications
- `approved`: cleared for publication and dispatch routing
- `rejected`: intentionally suppressed

### Deal lifecycle status

- `discovered`: raw observation exists
- `normalized`: canonical payload exists
- `ready-for-review`: awaiting operator or auto-approval
- `approved`: cleared for publication handling
- `scheduled`: member/public visibility timing has been assigned
- `published-members`: visible to members
- `published-public`: visible on the public site
- `archived`: no longer active in the surfaced catalogue

## Cross-Stream Usage

### Worker

- emits `SourceAdapterInput`, `SourceAdapterOutput`, `NormalizedDealPayload`, and `IngestRun`
- should not invent separate lifecycle names once shared types exist

### Site

- reads `NormalizedDealPayload.publication` and `lifecycleStatus` to separate member and public surfaces
- should treat future `publicVisibleAt` values as hidden from the public archive until their scheduled time

### Admin

- reads merchant and source references, `IngestRun`, normalization status, and review status
- is the primary place where `needs-review`, `partial`, and `failed` records are triaged

### Notifications

- uses `HotDealEvaluationInput` and `HotDealEvaluationResult` plus publication channels to build digest and hot-deal queues
- reports delivery outcomes against downstream notification records without redefining the deal lifecycle

## Integration Notes

- `packages/deals-core/src/index.ts` is the source of truth for shared contracts
- worker-specific or UI-specific extensions should extend this vocabulary instead of forking it
- if a stream needs a new lifecycle state, it should be proposed as a shared addition first
