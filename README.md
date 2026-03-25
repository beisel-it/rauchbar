# 🚬 Rauchbar

Rauchbar ist ein deutscher Newsletter- und Alert-Service fuer Zigarren-Deals. Nutzer melden sich mit ihren Praeferenzen an und erhalten woechentliche Digests, optional sofortige Hot-Deal-Benachrichtigungen per E-Mail oder WhatsApp. Deals werden erst nach einem Mitgliederfenster von einem Tag oeffentlich auf der Homepage sichtbar.

## Produktkern

- woechentliche Deal-Digests nach Marken-, Shop-, Preis- und Format-Praeferenzen
- optionale Hot-Deal-Alerts per E-Mail oder WhatsApp
- Mitglieder-exklusive Deal-Sicht vor der oeffentlichen Homepage
- Scraping und Monitoring fuer die groessten deutschen Zigarren-Haendler
- moderne Homepage, Admin-Konsole und wiederverwendbare Mailing-Designsprache

## Monorepo-Struktur

```text
apps/
  site/          Marketing- und Mitglieder-Homepage
  admin/         Admin und Operations UI
  worker/        Scraping, Monitoring, Digest- und Alert-Pipelines
packages/
  deals-core/    Gemeinsame Domainmodelle fuer Deals, Shops und Regeln
  design-system/ Gemeinsame visuelle Sprache fuer UI und Mailings
  notifications/ Kanaele fuer E-Mail und WhatsApp
docs/
  architecture/
  product/
  roadmap/
  ux/
tools/
  ux-preview/   Lokaler UX-Prototyp fuer Browser- und Screenshot-Reviews
```

## Arbeitsmodell

Rauchbar wird ueber ClawTeam in getrennten Workstreams entwickelt:

- design
- backend-scraping
- admin
- frontend-site
- notifications

## Nächste Schritte

- Produkt- und Compliance-Scope schaerfen
- Datenmodell fuer Deals, Shops, Alerts und Nutzerpraeferenzen stabilisieren
- MVP fuer Site, Admin und Worker aufsetzen
- erste Haendleradapter und Hot-Deal-Regeln definieren

## Docker Setup

Fuer die lokale Monorepo-Entwicklung liegt ein initiales Container-Setup im Repo:

- `Dockerfile` baut eine gemeinsame Node-22-/pnpm-Basis fuer alle Apps
- `docker-compose.yml` startet getrennte Services fuer `site`, `admin` und `worker`
- persistente Volumes halten pnpm-Store und `node_modules` ausserhalb des Bind-Mounts

Beispiele:

```bash
docker compose up site
docker compose up admin worker
docker compose run --rm worker pnpm install
```

Die aktuellen App-Skripte sind noch Platzhalter. Das Compose-Setup ist deshalb als Bootstrap fuer die naechsten Implementierungsschritte gedacht, nicht als produktionsreifes Runtime-Layout.
## UX Testing Preview

Fuer lokale UX-Reviews ohne kompletten App-Scaffold gibt es einen separaten Preview-Server:

- `pnpm ux:preview`
- `pnpm ux:preview:host` fuer Browserzugriff ueber `0.0.0.0:4173`

Die Artefakte und Review-Ablauf sind in `docs/ux/testing-setup.md` dokumentiert.
