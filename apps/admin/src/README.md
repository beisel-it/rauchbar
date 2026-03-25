# Admin

Interne Oberflaeche fuer Shops, Deals, Freigaben, Versand und Monitoring.

## MVP Surface

Die Admin-Konsole ist in drei Operations-Bereiche gegliedert:

- Merchants: Shop-Onboarding, Crawl-Steuerung, Monitoring und Incident-Handling
- Approvals: Triage neuer Deals, manuelle Freigabe, Ablehnung und Publikationskontrolle
- Dispatch: Digest- und Alert-Runs, Provider-Status, Wiederholungen und Pausen

## Kernseiten

- Dashboard
- Merchants
- Incoming Deals
- Approval Queue
- Dispatch Runs
- Audit Log

Die ausformulierte Produktdefinition liegt in [docs/product/admin-surface.md](../../../docs/product/admin-surface.md).

## UX Scope

- operator dashboard
- shop and crawler health monitoring
- deal review and approval queue
- digest and hot-deal send operations

## Required Navigation

- Uebersicht
- Shops
- Deals
- Freigaben
- Versand

## Implementation Reference

See `docs/ux/implementation-support.md` for:

- admin information architecture
- dashboard questions and widgets
- review queue row/detail requirements
- delivery-state and failure-handling guidance
