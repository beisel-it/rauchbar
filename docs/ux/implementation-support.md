# UX Implementation Support

## Purpose

This document translates the Rauchbar product definition into implementation-ready UX guidance for the MVP surfaces:

- public site
- member journey
- admin operations

It is intended to reduce interpretation drift between product, frontend, admin, backend, and notification workstreams.

Related artifacts:

- `docs/ux/homepage-ia-wireframe.md`
- `docs/ux/lifecycle-state-map.md`

## Shared UX Principles

- Prioritize speed to relevant deals over browsing depth.
- Separate public discovery from member advantage at every step.
- Keep preference editing lightweight; users should be able to improve results without a complex setup flow.
- Make automation legible in admin. Every send, rule, and publication state should be inspectable.
- Prefer explicit empty, loading, error, and delayed-publication states over silent gaps.

## Primary Actors

### Public Visitor

Wants to understand the value proposition quickly, inspect delayed deals, and convert into signup.

### Member

Wants curated deals with minimal effort, alert control, and confidence that preferences affect results.

### Admin Operator

Wants to validate incoming deals, monitor shop and delivery health, and intervene quickly when automation fails.

## Product Surface Map

### Site

- Homepage
- delayed deal archive
- signup flow
- preference onboarding
- member account entry

### Member Surface

- digest preview or latest picks
- alert channel settings
- preference editor
- membership and notification status

### Admin

- dashboard
- shop monitoring
- deal review queue
- publication control
- digest and alert operations

## Information Architecture

## Site Navigation

Primary navigation:

- Deals entdecken
- So funktioniert's
- Mitglied werden
- Login

Homepage CTA priority:

- primary: Mitglied werden
- secondary: Verzoegerte Deals ansehen

Footer utility links:

- FAQ
- Datenschutz/Impressum
- Kontakt

## Member Navigation

Primary navigation:

- Fuer dich
- Alerts
- Praeferenzen
- Konto

Secondary utility:

- letzte E-Mail ansehen
- WhatsApp Status
- Abmelden

## Admin Navigation

Primary navigation:

- Uebersicht
- Shops
- Deals
- Freigaben
- Versand

Secondary utility:

- fehlgeschlagene Jobs
- Benachrichtigungslog
- Einstellungen

## Key Journeys

## 1. Public Visitor to Member

1. Land on homepage from search, referral, or newsletter mention.
2. Understand three core promises within first viewport:
   - kuratierte Zigarren-Deals
   - Mitglieder sehen Angebote frueher
   - Alerts nur bei relevanten Treffern
3. Review a few delayed deals or benefit summary.
4. Start signup with email CTA.
5. Complete lightweight preference onboarding.
6. Confirm notification channels and enter member area or await first digest.

Implementation notes:

- The homepage hero should prove freshness and exclusivity without requiring login.
- Delayed archive items should visibly show they are public after a 24h member window.
- Signup should avoid long forms before value is established.

## 2. New Member Onboarding

1. Submit email and consent.
2. Choose core interests:
   - Lieblingsmarken
   - bevorzugte Formate
   - Shops ausschliessen oder bevorzugen
   - Preisrahmen
3. Choose alert sensitivity:
   - nur grosse Treffer
   - ausgewogen
   - moeglichst viel
4. Select channels:
   - E-Mail Digest required
   - Hot-Deal per E-Mail optional
   - Hot-Deal per WhatsApp optional
5. Reach completion screen with expectations:
   - wann der naechste Digest kommt
   - wie Alerts ausgelost werden
   - wo Einstellungen spaeter aenderbar sind

Implementation notes:

- Make all preference choices skippable except minimum consent and email capture.
- Use progressive disclosure. Start with high-signal questions first.
- Show editable summaries instead of forcing step repetition.

## 3. Returning Member Management

1. Open member home.
2. See latest relevant deals, delivery status, and any action needed.
3. Edit preferences or channels inline.
4. Confirm saved state immediately.

Implementation notes:

- The default member landing state should answer:
  - "Did I miss anything?"
  - "Are my alerts active?"
  - "Can I tune results in under a minute?"
- Use inline sections and drawers/modals sparingly; settings should remain deep-linkable.

## 4. Admin Deal Operations

1. Open dashboard and inspect system health.
2. Review incoming deals flagged by worker pipeline.
3. Approve, reject, or hold deals with reason codes.
4. Confirm member publication timing and public delay.
5. Monitor digest and alert sends.

Implementation notes:

- Queue management must optimize scanability over detail density.
- Approval decisions should preserve audit context:
  - source shop
  - normalized price
  - discount rationale
  - send/publication state
- Operators need a path from aggregate metrics into a single failed entity in one click.

## Screen-Level Requirements

## Homepage

Must include:

- clear value proposition for German cigar deal monitoring
- proof of freshness or cadence
- explanation of member-first 24h access
- sample delayed deals
- signup CTA above the fold and repeated after proof sections

Recommended modules:

- hero with current deal count or cadence statement
- "So funktioniert's" three-step explanation
- delayed deal cards
- preference/personalization explainer
- digest and alert examples
- FAQ

## Delayed Deal Archive

Must include:

- list/grid toggle only if both are clearly useful; otherwise default to dense list
- filters for brand, shop, format, and price band
- prominent "Mitglieder sahen dieses Angebot frueher" marker
- timestamps for member release and public release

State handling:

- empty state: explain archive cadence and invite signup
- expired/unavailable deal state: preserve card shell with unavailable label
- filter no-results state: offer reset plus signup prompt

## Signup Flow

Recommended steps:

1. email + consent
2. preferences
3. alert channels
4. completion

Requirements:

- step count visible
- save progress where possible
- low-friction back navigation
- clear distinction between required and optional inputs
- inline validation, not only end-of-form validation

## Member Home

Must include:

- latest digest status
- most relevant recent deals
- alert channel health
- quick links to edit preferences

Preferred module order:

1. next/last delivery status
2. highlighted matching deals
3. channel status
4. preference summary

## Preferences

Represent preferences as editable groups, not a single long form:

- Marken
- Formate
- Preisrahmen
- Shops
- Alert-Empfindlichkeit

Interaction requirements:

- changes show immediate saved confirmation
- each group can be edited independently
- provide sensible defaults and reset behavior

## Admin Dashboard

Must answer in one screen:

- Are crawlers healthy?
- Are there deals waiting for review?
- Did any digest or alert job fail?
- Is publication lag behaving as expected?

Recommended widgets:

- pipeline health summary
- pending review count
- failed jobs table
- recent publications
- notification channel status

## Admin Deal Review Queue

Each row/card should expose:

- product name
- shop
- current price
- reference/previous price if available
- computed savings
- deal confidence or rule match
- publication eligibility
- channel eligibility

Bulk actions:

- approve
- reject
- mark needs review

Single-item detail should show:

- raw source data
- normalization output
- send history
- internal notes

## Admin Versand

Separate tabs or segmented controls:

- Digeste
- Hot-Deals
- Fehlgeschlagen

Requirements:

- status badges must use consistent terminology with backend states
- every failed send exposes retry path and failure reason
- operators can see audience scope before triggering a resend

## State Model Guidance

Use explicit status labels across product surfaces.

### Deal Status

- entdeckt
- normalisiert
- in Pruefung
- freigegeben
- an Mitglieder sichtbar
- oeffentlich sichtbar
- abgelehnt

### Notification Status

- geplant
- in Versand
- gesendet
- teilweise fehlgeschlagen
- fehlgeschlagen
- pausiert

### Shop Health Status

- gesund
- verlangsamt
- fehlgeschlagen
- auth/problem erkannt

## UX Copy Guidance

- Emphasize curation, timing advantage, and relevance.
- Avoid overclaiming automation accuracy.
- Explain delayed-publication mechanics in plain language.
- Use operational language in admin, marketing language on site, and confidence-building language in member areas.

## Interaction Patterns

### Filters

- Use immediate apply for low-cost filters on site archive.
- Use sticky filter summaries on mobile.
- In admin, preserve filter state between visits.

### Tables and Lists

- Site and member surfaces should prefer card/list hybrids optimized for scanning.
- Admin should prefer dense tables with expandable details where actions are frequent.

### Feedback

- Inline success for settings changes.
- Toasts only for secondary confirmation, not as the sole persistence signal.
- Persistent banners for failures that block delivery or publication.

### Empty States

Every empty state should answer:

- why there is no content
- what happens next
- what the user can do now

## Implementation Handoff Checklist

Before frontend implementation starts, confirm:

- route map is aligned with the navigation model above
- backend contracts expose publication timestamps and state labels
- notification contracts expose per-channel delivery status
- admin actions preserve audit metadata for approvals and retries
- design system supports shared status badges, cards, tables, filters, and empty states

## Open Dependencies

Frontend and admin implementers should verify these upstream details before locking UI behavior:

- exact deal fields available from `deals-core`
- final notification status enums from `notifications`
- auth and session model for member/admin access
- whether member home includes an in-app digest preview or only delivery metadata
