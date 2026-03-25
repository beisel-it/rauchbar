# README Visual Plan

## Purpose

This document defines how the top-level `README.md` should be extended once screenshot assets are available. It keeps the GitHub landing page visually coherent with the current product, UX, and embedded design handoff.

The goal is not to dump every surface into the README. The goal is to create a short visual story:

1. what Rauchbar is
2. how the public/member value works
3. how preferences and alerts create relevance
4. how operators control quality and delivery

## Placement in README

Insert the visual block after `## MVP im Ueberblick` and before `## Nutzer- und Surface-Modell`.

Reason:

- readers first get the product promise and repo scope
- visuals then prove the product shape quickly
- architecture and contributor detail can remain below the fold

## Visual Section Structure

Use one high-level section in the README:

`## Produkt in Bildern`

Inside that section, present screenshots in this order:

1. homepage hero plus primary CTA
2. delayed deal preview plus 24h member-first framing
3. preference and alert setup
4. admin dashboard overview
5. admin review or dispatch operations

Do not lead with admin. The first two visuals should always establish the member-facing product value before showing internal tooling.

## Recommended Screenshot Set

### 1. Homepage Hero

Purpose:

- establish premium/editorial tone
- communicate the core product promise in one frame

Should show:

- headline
- proof points
- primary and secondary CTA
- enough surrounding UI to feel like a real product, not a cropped banner

Caption direction:

`Die Homepage erklaert den Mitgliedervorteil in Sekunden: kuratierte Zigarren-Deals, persoenliche Relevanz und frueherer Zugang vor der oeffentlichen Freigabe.`

Suggested asset name:

- `docs/assets/readme/site-home-hero.png`

### 2. Delayed Deal Preview

Purpose:

- prove inventory and the delayed-publication mechanic

Should show:

- deal cards
- merchant and price signal
- public timestamp or member-first label

Caption direction:

`Oeffentliche Deals bleiben sichtbar, aber der README-Screenshot sollte klar machen, dass Mitglieder relevante Angebote frueher sehen als das offene Archiv.`

Suggested asset name:

- `docs/assets/readme/site-delayed-deals.png`

### 3. Preferences and Alerts

Purpose:

- show how relevance is tuned
- make digest versus alert logic concrete

Should show:

- preference groups such as Marken, Formate, Preisrahmen
- alert controls or channel settings
- a concise summary state rather than a long raw form

Caption direction:

`Praeferenzen und Alert-Kanaele halten das Produkt leichtgewichtig: der Digest ist die Basis, Hot-Deal-Alerts bleiben optional und steuerbar.`

Suggested asset names:

- `docs/assets/readme/member-preferences.png`
- or `docs/assets/readme/member-alerts.png`

If only one member screenshot is available, prefer a combined settings view over a generic signup step.

### 4. Admin Dashboard

Purpose:

- show that the product has operational depth
- communicate that shop health, review backlog, and delivery status are observable

Should show:

- dashboard summary cards or tables
- at least one warning or actionable state
- enough navigation to anchor the surface

Caption direction:

`Die Admin-Konsole macht Automatisierung sichtbar: Shop-Health, Review-Backlog, Publikationsstatus und Versandprobleme bleiben direkt greifbar.`

Suggested asset name:

- `docs/assets/readme/admin-dashboard.png`

### 5. Review Queue or Dispatch Operations

Purpose:

- close the story with human control over approvals and sends

Prefer one of these:

- deal review queue if data quality and publication control are visually stronger
- dispatch runs if delivery reliability is the sharper story

Caption direction for review:

`Deals werden nicht blind publiziert: Review-Queues verbinden Normalisierung, Freigabe, Kanal-Eignung und Audit-Kontext.`

Caption direction for dispatch:

`Versandlaeufe bleiben operativ steuerbar: Status, Fehlerraten und Wiederholungen sind fuer Digests und Hot-Deals nachvollziehbar.`

Suggested asset names:

- `docs/assets/readme/admin-review-queue.png`
- or `docs/assets/readme/admin-dispatch-runs.png`

## Layout Guidance for GitHub

- Use full-width stacked images, not side-by-side grids. GitHub renders narrow multi-column layouts unreliably across devices.
- Keep the screenshot count to four or five. More than that turns the README into a gallery instead of a product overview.
- Put one short paragraph or caption under each image. Avoid long bullets between screenshots.
- Prefer screenshots with real but clean demo data. Empty states are useful in product docs, but the README should prove momentum first.
- Crop for readability, not spectacle. Text must remain legible on GitHub without zooming.

## Screenshot Direction

- Use the warm Rauchbar palette and preserve enough chrome to show the product identity.
- Avoid browser chrome if it adds noise; the UI itself should fill the frame.
- Use desktop screenshots for the main sequence.
- If a mobile screenshot is excellent, use it as an optional sixth image only when it proves a responsive behavior that desktop cannot.

## README Copy Scaffold

Use this shape inside `README.md` once assets exist:

```md
## Produkt in Bildern

### Homepage

![Rauchbar Homepage Hero](docs/assets/readme/site-home-hero.png)

Die Homepage erklaert den Mitgliedervorteil in Sekunden: kuratierte Zigarren-Deals, persoenliche Relevanz und frueherer Zugang vor der oeffentlichen Freigabe.

### Verzoegerte Deals

![Rauchbar Delayed Deal Preview](docs/assets/readme/site-delayed-deals.png)

Oeffentliche Deals bleiben sichtbar, aber Mitglieder sehen relevante Angebote vor dem offenen Archiv.

### Praeferenzen und Alerts

![Rauchbar Member Preferences and Alerts](docs/assets/readme/member-preferences.png)

Praeferenzen und Kanaele halten das Produkt leichtgewichtig: der Digest ist die Basis, Hot-Deal-Alerts bleiben optional und steuerbar.

### Admin Operations

![Rauchbar Admin Dashboard](docs/assets/readme/admin-dashboard.png)

Die Admin-Konsole macht Automatisierung sichtbar: Shop-Health, Review-Backlog, Publikationsstatus und Versandprobleme bleiben direkt greifbar.

### Freigaben oder Versand

![Rauchbar Admin Review Queue](docs/assets/readme/admin-review-queue.png)

Deals und Versandlaeufe bleiben operativ kontrollierbar, statt als Black Box im Hintergrund zu laufen.
```

## Asset Checklist

Before wiring screenshots into the README, confirm:

- filenames are stable and lowercase
- image width is readable on GitHub
- demo data does not expose private values
- copy and UI labels match the current lifecycle/state vocabulary
- the screenshot order still matches the strongest product story
