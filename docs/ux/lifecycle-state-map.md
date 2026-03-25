# Lifecycle and State Map

## Purpose

This document provides a single state reference for the product surfaces so design, frontend, admin, worker, and notifications use the same lifecycle language.

It covers:

- deal lifecycle
- homepage/archive state representation
- member state representation
- admin operational state representation
- notification and shop-health state patterns

## Core Principle

Users should always understand:

- what state an item is in
- why it is in that state
- what happens next
- whether they can act on it

## Deal Lifecycle

```text
[discovered]
    |
    v
[normalized]
    |
    v
[in_review] -----> [rejected]
    |
    v
[approved]
    |
    +-----> [member_visible]
                |
                v
          [public_visible]
                |
                v
             [expired]
```

## Deal State Definitions

- `discovered`: raw deal detected by worker, not yet normalized for product use
- `normalized`: canonical fields prepared, pending operator confidence or automation gate
- `in_review`: waiting for approval or manual quality check
- `approved`: accepted for downstream publication and channel eligibility checks
- `member_visible`: visible to members during the exclusivity window
- `public_visible`: visible on the homepage/archive after the delay window
- `rejected`: intentionally withheld from publication
- `expired`: no longer active, but may remain visible historically depending on archive rules

## Surface Representation by State

## Public Site

- `member_visible`: never show full item publicly; only communicate that members see deals earlier
- `public_visible`: show full archive card with release timing
- `expired`: show preserved shell or archive entry with unavailable label if historically useful
- `rejected`: never visible publicly

## Member Surface

- `approved` to `member_visible`: may appear as "neu fuer Mitglieder"
- `public_visible`: can lose exclusivity badge but remain available
- `expired`: show stale/unavailable indicator if referenced from digest history

## Admin Surface

- show all states
- each state needs filtering and badge treatment
- transitions require timestamps and actor/system attribution when possible

## Homepage State Representation

## Hero

Possible states:

- normal: headline, proof points, and primary CTA
- low-data fallback: keep proposition and CTA, remove live metrics

UI treatment:

- never show broken counters
- if live counts are unavailable, substitute static proof copy

## Delayed Deal Preview

Possible states:

- loaded with public deals
- loading
- empty because no deal has passed public delay yet
- partial because only a few deals are public
- error retrieving deals

Recommended rendering:

- loading: render skeleton cards in final layout
- empty: explain member-first delay and route to signup
- partial: render available cards and retain archive CTA
- error: show retry-friendly copy and preserve signup/archive actions

## Archive State Representation

Filter-level states:

- default feed
- filtered results
- no results for current filters
- unavailable/expired item

Each archive card should communicate:

- title
- shop
- current price
- savings or rationale if available
- public timestamp
- member-first timing message
- availability state when relevant

## Signup State Representation

## Step Flow

```text
[email_and_consent]
    |
    v
[preferences]
    |
    v
[channel_selection]
    |
    v
[completion]
```

Step states:

- not_started
- in_progress
- completed
- validation_error

Requirements:

- current step is always visible
- users can move backward without losing valid input
- validation errors anchor to the affected field group
- completion state sets expectation for first digest and optional alerts

## Member Surface State Representation

## Member Home

Must represent these parallel states:

- latest digest status
- alert channel status
- preference completeness
- recent relevant-deals availability

### Digest Status

- scheduled
- sent
- delayed
- failed

### Alert Channel Status

- active
- muted
- pending_verification
- failed

### Preference Completeness

- minimal
- partial
- tuned

UI behavior:

- failed or pending_verification states deserve persistent inline messaging
- minimal or partial preferences should trigger upgrade prompts, not blocking gates

## Admin State Representation

## Dashboard

The dashboard should summarize:

- pipeline health
- review backlog
- publication lag
- delivery failures

Severity model:

- info
- warning
- critical

Rules:

- warning means the system is degraded but still moving
- critical means operator intervention is required
- every warning/critical card links to the exact queue or log behind it

## Review Queue

Each item should expose:

- deal lifecycle state
- confidence/reason
- publication eligibility
- channel eligibility
- review urgency

Action states:

- approvable
- rejectable
- held_for_review

## Versand Operations

Notification runs should show:

- planned
- sending
- sent
- partial_failure
- failed
- paused

Operator actions:

- retry failed items
- inspect failure reason
- pause or resume when supported

## Shop Health State Representation

Shop/crawler states:

- healthy
- delayed
- failed
- auth_issue

UI rules:

- healthy can stay low emphasis
- delayed needs trend and age of last success
- failed and auth_issue require prominent banners or cards

## Cross-Surface Badge Guidance

Use consistent badge language across site, member, and admin where the same state is exposed.

Suggested semantic groups:

- success: approved, sent, active, healthy
- warning: delayed, partial, pending verification, held for review
- danger: failed, rejected, auth issue
- neutral: discovered, normalized, scheduled, expired

## State Copy Patterns

Preferred pattern:

- state label
- one-line explanation
- next action or next event

Examples:

- `Mitgliederzugang aktiv`: Du erhaeltst neue Deals vor der oeffentlichen Freigabe.
- `WhatsApp ausstehend`: Bestaetige den Kanal, um Hot-Deal-Alerts zu erhalten.
- `Versand fehlgeschlagen`: Dieser Lauf braucht eine erneute Ausloesung oder Fehlerpruefung.

## Visual Alignment Notes for Design

Design should preserve a stable visual grammar for:

- status badges
- empty states
- warning banners
- queue severity indicators
- skeleton/loading placeholders

If a surface diverges stylistically, the meaning of the state labels must still remain identical.
