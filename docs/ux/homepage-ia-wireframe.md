# Homepage IA and Wireframe Artifact

## Purpose

This document defines the MVP homepage information architecture at wireframe level so site, design, and content work stay aligned.

It covers:

- section order
- module purpose
- navigation behavior
- CTA hierarchy
- responsive priorities
- content and state expectations

## Homepage Goals

- explain Rauchbar in under 10 seconds
- establish member-first value
- prove there is real deal inventory
- convert visitors into signup
- create a clear path to the delayed public archive

## Success Criteria

- a first-time visitor understands that deals are curated and delayed publicly
- the primary CTA is unambiguous
- the page can be implemented without inventing section order or CTA logic
- design and frontend share the same block structure across desktop and mobile

## Page-Level IA

Top to bottom order:

1. Header / primary navigation
2. Hero
3. Trust strip / proof of cadence
4. "So funktioniert's"
5. Delayed deal preview
6. Preference and personalization explainer
7. Digest and alert value section
8. FAQ
9. Final CTA band
10. Footer

## Navigation Model

Header links:

- Deals entdecken
- So funktioniert's
- Mitglied werden
- Login

Header behavior:

- logo returns to homepage
- "So funktioniert's" scrolls to explanatory section on homepage
- "Deals entdecken" routes to delayed archive
- "Mitglied werden" opens signup flow
- on mobile, keep CTA visible inside menu and optionally as sticky bottom action after hero

## CTA Hierarchy

Primary CTA:

- Mitglied werden

Secondary CTA:

- Verzoegerte Deals ansehen

Rules:

- every major section may repeat the primary CTA
- the archive CTA should not visually outrank signup
- CTAs should mention benefit, not generic submit language

## Wireframe

```text
+----------------------------------------------------------------------------------+
| Header: Logo | Deals entdecken | So funktioniert's | Mitglied werden | Login     |
+----------------------------------------------------------------------------------+
| HERO                                                                            |
| Kicker: Zigarren-Deals fuer deutsche Shops                                      |
| Headline: Gute Angebote frueher sehen, statt sie zu verpassen                   |
| Copy: Kuratierte Deals, persoenliche Praeferenzen, Hot-Deal-Alerts auf Wunsch. |
| Proof bullets: 24h Mitglieder-Vorsprung | Woechentlicher Digest | E-Mail/WA     |
| [Primary CTA: Mitglied werden] [Secondary CTA: Verzoegerte Deals ansehen]       |
| Optional proof panel: Letzte Woche X Deals, Y Shops beobachtet                  |
+----------------------------------------------------------------------------------+
| TRUST / CADENCE STRIP                                                            |
| Beobachtet deutsche Shops | Taegliches Monitoring | Keine Preisjagd per Hand    |
+----------------------------------------------------------------------------------+
| SO FUNKTIONIERT'S                                                                |
| 1. Praeferenzen waehlen  2. Deals frueher erhalten  3. Nur relevante Alerts     |
| Small explainer copy + CTA                                                       |
+----------------------------------------------------------------------------------+
| DELAYED DEAL PREVIEW                                                             |
| Section intro: Diese Deals sind jetzt oeffentlich, Mitglieder sahen sie frueher |
| [Deal card] [Deal card] [Deal card]                                              |
| Card fields: Brand | Format | Shop | Current price | Savings | public timestamp |
| [CTA: Alle verzoegerten Deals ansehen]                                           |
+----------------------------------------------------------------------------------+
| PERSONALIZATION EXPLAINER                                                        |
| Copy around brands, formats, price limits, shop preferences                      |
| UI hint chips/tags showing preference examples                                   |
| [CTA: Praeferenzen anlegen]                                                      |
+----------------------------------------------------------------------------------+
| DIGEST + ALERT VALUE                                                             |
| Left: Weekly digest preview                                                      |
| Right: Hot-deal alert explanation and channel options                            |
| Message: Digest is default, alerts are optional                                  |
| [CTA: Mitglied werden]                                                           |
+----------------------------------------------------------------------------------+
| FAQ                                                                              |
| Questions: Wie funktioniert der 24h Vorsprung? Wann kommen Alerts? Was kostet?  |
+----------------------------------------------------------------------------------+
| FINAL CTA BAND                                                                   |
| Short recap + [Mitglied werden]                                                  |
+----------------------------------------------------------------------------------+
| Footer: FAQ | Datenschutz/Impressum | Kontakt                                    |
+----------------------------------------------------------------------------------+
```

## Section Specifications

## 1. Header

Must include:

- logo
- primary nav
- signup CTA
- login entry

Responsive behavior:

- desktop uses inline navigation
- mobile collapses navigation, but signup remains easy to reach

## 2. Hero

Message priority:

1. curated cigar deals
2. members see deals earlier
3. alerts are preference-driven

Required content:

- headline
- short explanatory copy
- proof points
- primary and secondary CTAs

Do not place:

- long feature lists
- detailed form fields
- dense deal grids

## 3. Trust Strip

Purpose:

- reinforce that the service monitors shops consistently
- reduce skepticism without requiring deep reading

Recommended content:

- count of shops monitored
- monitoring cadence
- curation or review statement

## 4. So funktioniert's

Three steps only:

1. preferences
2. member-first delivery
3. relevant alerts

Interaction:

- on desktop, show as equal-width three-step row
- on mobile, stack vertically with visible numbering

## 5. Delayed Deal Preview

This is the homepage proof module.

Card content priority:

- product or deal title
- shop
- current price
- savings or deal rationale
- "Mitglieder sahen dieses Angebot frueher"
- public-release timestamp

Interaction:

- cards link to archive or deal detail when available
- section CTA routes to full delayed archive

## 6. Personalization Explainer

Purpose:

- show users they control relevance without making setup feel heavy

Content blocks:

- favorite brands
- preferred formats
- price comfort zone
- shop inclusion/exclusion

Recommended representation:

- chips or pill examples
- short benefit copy, not form UI duplication

## 7. Digest and Alert Value

Clarify the split:

- digest is the default membership value
- hot-deal alerts are optional and selective

Must answer:

- what arrives weekly
- what triggers an alert
- which channels exist

## 8. FAQ

Required questions:

- Wie funktioniert der 24h Vorsprung?
- Muss ich WhatsApp nutzen?
- Kann ich meine Praeferenzen spaeter aendern?
- Sind alle Deals oeffentlich sichtbar?

## 9. Final CTA Band

Purpose:

- catch visitors who scroll for proof before acting

Content:

- concise summary
- one primary CTA

## Responsive Priorities

On mobile, keep this order intact:

1. hero
2. trust strip
3. how it works
4. delayed deals
5. personalization
6. digest/alerts
7. FAQ
8. final CTA

Mobile rules:

- no horizontal deal-card overflow
- keep CTAs thumb-reachable
- avoid excessive copy before first CTA

## Homepage States

### Default

- all modules render with live or placeholder content

### Low-Inventory State

- delayed deal preview shows fewer cards
- supporting copy explains that archive updates continuously
- CTA still routes to archive/signup

### No Public Deals Yet

- replace cards with explanatory empty state
- message that members receive deals first and public archive follows with delay
- preserve signup CTA

### Metrics Unavailable

- trust strip falls back to qualitative proof copy instead of broken numbers

## Implementation Notes

- Build the page as modular sections that can be reused in content management later.
- Keep delayed deal preview data-driven; do not hardcode card assumptions beyond the fields above.
- Hero and final CTA should share the same conversion event naming.
- Archive preview and "So funktioniert's" should each have unique analytics hooks.

## Dependencies

This homepage artifact depends on:

- delayed-deal fields from site/backend integration
- final brand and product naming from design/content
- signup entrypoint route definition from site implementation
