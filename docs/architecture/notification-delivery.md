# Notification Delivery Boundaries

## Purpose

This document defines what the notification stream owns for Rauchbar MVP delivery and which shared domain states gate digest and hot-deal sends.

## Ownership

- `packages/deals-core` remains the source of truth for deal, decision, preference, and dispatch state names
- `packages/notifications` owns channel contracts, recipient requirements, and queue-time validation
- provider-specific adapters should translate from the notification package contract into ESP or WhatsApp API calls without renaming shared states

## Channel Boundaries

### Digest email

- channel: `digest`
- transport: email only
- cadence: scheduled batch
- audience: members only
- allowed deal states: `approved` plus `member-visible`, `public-scheduled`, or `public-visible`
- preference gate: `digestEnabled`
- payload shape: one dispatch may contain multiple deals

### Hot-deal email

- channel: `email-hot-deal`
- transport: email only
- cadence: immediate
- audience: members only
- allowed deal states: `approved` plus `member-visible` or `public-scheduled`
- preference gate: `hotDealEmailEnabled`
- payload shape: one dispatch per deal

### Hot-deal WhatsApp

- channel: `whatsapp-hot-deal`
- transport: WhatsApp only
- cadence: immediate
- audience: members only
- allowed deal states: `approved` plus `member-visible` or `public-scheduled`
- preference gate: `hotDealWhatsappEnabled`
- contact gate: verified WhatsApp number and stored opt-in timestamp
- payload shape: one dispatch per deal

## Queue Rules

- notifications only queue for channels present on `deal.channels`
- every queued notification must have a matching `NotificationDecision` with eligibility `eligible`
- `suppressed` and `blocked-review` decisions never queue
- hot-deal channels require the members-only window to still be open at queue time
- email channels require a recipient email address
- WhatsApp hot deals require a WhatsApp destination and explicit opt-in evidence

## Delivery State

- new dispatch records start as `queued`
- adapters may advance a dispatch through `sent` and `delivered`
- adapters must map provider rejections or hard bounces to `failed`
- queue-time policy skips should be persisted as `suppressed` instead of attempting delivery

## Integration Notes

- worker and admin flows should use `canQueueNotification` from `packages/notifications`
- if another stream needs a new channel or lifecycle state, add it to `deals-core` first and then extend the notification contracts
