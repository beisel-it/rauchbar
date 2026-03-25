# Lokale Demo

Diese Demo-Route ist fuer Walkthroughs des aktuellen MVP-Standes gedacht und bleibt
bewusst klein: sie startet nur die `site`-App auf `127.0.0.1`.

## Zweck

- reproduzierbarer Startpfad fuer Produktdemos und interne Reviews
- keine Abhaengigkeit auf Container oder Hintergrunddienste
- keine Netzwerkfreigabe ausserhalb von `localhost`

## Voraussetzungen

- Node.js 22 oder neuer
- `corepack` verfuegbar

## Start

1. Im Repo-Root installieren:

   ```bash
   npm run install:local
   ```

2. Demo starten:

   ```bash
   npm run demo:dev
   ```

3. Im Browser oeffnen:

   ```text
   http://127.0.0.1:4173
   ```

## Was die Demo zeigt

- Homepage mit Value Proposition und Deal-Preview
- Signup- und Preference-Onboarding fuer Mitglieder
- Members-first Publishing Flow mit 24h Delay bis zur oeffentlichen Sichtbarkeit

## Produktionscheck

Vor einer Demo kann der statische Build validiert werden:

```bash
npm run demo:build
```

## Grenzen des aktuellen Demo-Setups

- `apps/admin` und `apps/worker` sind noch keine lauffaehigen UIs bzw. Services
- Seed-Daten liegen direkt in der Site-App und kommen noch nicht aus einer API
- Es ist aktuell keine Containerisierung noetig; falls spaeter Demo-Services fuer
  Crawling oder APIs dazukommen, sollte das mit `backend-crawlers` abgestimmt werden
