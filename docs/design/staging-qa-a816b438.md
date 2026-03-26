# Staging Design QA

Task: `a816b438`

Datum: `2026-03-26`

Inspektionsmethode:

- lokaler Browser-Pfad: `/usr/bin/chromium`
- Live-Capture gegen:
  - `https://staging.rauchbar.genussgesellschaft-neckartal.de`
  - `https://admin.rauchbar.genussgesellschaft-neckartal.de`
- Desktop- und Mobile-Screenshots

Scope:

- sichtbare Layoutfehler
- Clipping und Overflow
- Hierarchieprobleme
- off-spec Präsentation
- andere offensichtliche Live-Staging-Defekte

## Findings

### 1. Admin-Staging liefert weiterhin nur die Placeholder-Seite aus

Schweregrad: blockierend

Surface:

- `https://admin.rauchbar.genussgesellschaft-neckartal.de`
- Desktop und Mobile

Beobachtung:

- die Domain zeigt weiterhin die Seite `Deployment placeholder for the admin surface`
- keine echte Admin-Navigation, kein Dashboard, keine Queues und keine Versandoberfläche sind sichtbar

Warum das die Design-QA blockiert:

- es gibt keine reale Produktoberfläche, die auf Layout, Hierarchie, Overflow oder Präsentationsqualität geprüft werden kann
- die aktuelle Auslieferung ist klar off-spec für die erwartete Staging-Reviewfläche

Konkrete Follow-up-Owner:

- `deploy-platform`: Admin-Staging so korrigieren, dass die echte Admin-Anwendung statt der Placeholder-Runtime ausgeliefert wird
- `admin-console`: nach dem Deployment-Fix eine neue Design-QA gegen die echte Admin-Oberfläche anfordern

### 2. Site-Staging zeigt in den geprüften Ansichten keinen klaren sichtbaren Layoutdefekt

Schweregrad: keiner in diesem Pass

Surface:

- `https://staging.rauchbar.genussgesellschaft-neckartal.de`
- Desktop- und Mobile-Captures des aktuellen Zustands

Beobachtung:

- in den geprüften Ansichten war kein eindeutiges Text-Clipping, Card-Breakout oder Container-Overflow sichtbar
- die Hierarchie wirkte im erfassten Bereich stabil genug für einen ersten visuellen QA-Pass

Hinweis:

- das ist keine vollständige Produktabnahme
- es ist nur das Ergebnis des aktuellen sichtbaren Staging-Zustands in diesem Sofort-Pass

## Evidence Summary

Für den Pass wurden lokale Screenshots erstellt von:

- Site Desktop
- Site Mobile
- Admin Desktop
- Admin Mobile

Die Admin-Captures zeigen konsistent nur die Placeholder-Auslieferung statt der eigentlichen Anwendung.

## Outcome

- Site: kein blockierender sichtbarer Layoutfehler im geprüften Ausschnitt
- Admin: Design-QA weiterhin blockiert, bis Staging die echte Admin-Oberfläche ausliefert
