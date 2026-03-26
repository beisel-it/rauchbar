# Portainer Automation Prework

Stand: 2026-03-26

Dieses Dokument beschreibt den maximalen Stand der repo-seitigen Automatisierung für den Portainer-Pfad, bevor externer Zugriff oder echte Credentials nötig werden.

## Vorhandene Automatisierung

### 1. Stack-CI

Workflow: `.github/workflows/portainer-stack-ci.yml`

Leistet automatisch:

- `docker-compose.portainer.yml` mit `ops/portainer/stack.env.example` validieren
- die Quell-Dockerfiles für `caddy`, `site`, `admin` und `worker` lokal bauen
- den nicht-geheimen Stack-Bundle-Artefakt hochladen

### 2. Image-Publish

Workflow: `.github/workflows/portainer-image-publish.yml`

Leistet automatisch:

- `caddy`, `site`, `admin` und `worker` bauen
- Images nach GHCR pushen
- Tags mindestens für Commit-SHA und Branch erzeugen

### 3. Deploy-Prework

Workflow: `.github/workflows/portainer-deploy-prework.yml`

Leistet automatisch:

- GitHub-Variablen und Secrets gegen die benötigten Portainer- und Deploy-Inputs prüfen
- ein echtes `stack.env` aus GitHub-Inputs rendern
- prüfen, dass die erwarteten GHCR-Images für den Ziel-Commit existieren
- die Compose-Datei gegen dieses gerenderte Environment validieren
- den nicht-geheimen Stack-Bundle-Artefakt hochladen

## Repo-seitig erledigte Vorarbeit

- `docker-compose.portainer.yml`
- `ops/caddy/Dockerfile.portainer`
- `ops/caddy/Caddyfile`
- `ops/portainer/stack.env.example`
- `ops/portainer/check-automation-inputs.sh`
- `ops/portainer/render-stack-env.sh`
- `docs/operations/portainer-staging-runbook.md`
- `.github/workflows/portainer-stack-ci.yml`
- `.github/workflows/portainer-image-publish.yml`
- `.github/workflows/portainer-deploy-prework.yml`
- `docs/operations/portainer-automation-prework.md`

## Exakt noch benötigte externe Inputs

Diese Werte oder Zugänge müssen außerhalb des Repos bereitgestellt werden:

### GitHub Variables

- `PORTAINER_BASE_URL`
- `PORTAINER_ENDPOINT_ID`
- `PORTAINER_STACK_NAME`
- `ACME_EMAIL`
- `PUBLIC_BIND_IPV4`
- `GHCR_NAMESPACE`
- `SITE_HOST`
- `ADMIN_HOST`
- `SITE_BASE_URL`
- `ADMIN_BASE_URL`
- `PUBLIC_APP_URL`
- `POSTGRES_DB`
- `SCRAPER_JOB_QUEUE`
- `QUEUE_CONCURRENCY`

### GitHub Secrets

- `PORTAINER_ACCESS_TOKEN`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `SESSION_SECRET`
- optional: `SENTRY_DSN`
- optional: `EMAIL_PROVIDER_API_KEY`
- optional: `WHATSAPP_PROVIDER_API_KEY`

### Externe Betriebsinputs

- funktionierender Portainer-Endpoint für den Zielhost
- DNS-`A`-Records für `staging.rauchbar.genussgesellschaft-neckartal.de` und `admin.rauchbar.genussgesellschaft-neckartal.de`
- offene Ports `80/tcp` und `443/tcp` auf dem Zielhost

## Bewusst noch nicht automatisiert

- der eigentliche Stack-Create/Update-Call gegen die Portainer-API
- Host-Bootstrap oder Firewall-Änderungen
- DNS-Änderungen

Diese Schritte bleiben solange extern, bis die benötigten Portainer-API-Zugänge, Endpoint-IDs und Betriebsfreigaben verbindlich im Repo-Umfeld hinterlegt sind.
