# Local-Machine Staging Runbook

Stand: 2026-03-26

Dieses Runbook beschreibt den kuerzesten Staging-Pfad fuer Rauchbar auf dem Host `65.21.2.149` mit Caddy als oeffentlichem Reverse Proxy und Docker Compose als Runtime-Manager.

## Zielbild

- `staging.rauchbar.genussgesellschaft-neckartal.de` zeigt auf `site`
- `admin.rauchbar.genussgesellschaft-neckartal.de` zeigt auf `admin`
- nur Caddy ist oeffentlich auf `80` und `443` erreichbar
- `site`, `admin`, `worker`, `postgres` und `redis` laufen nur im internen Docker-Netz
- TLS wird automatisch ueber Let's Encrypt / HTTP-01 von Caddy abgewickelt

## Repo-Artefakte

- `docker-compose.deploy.yml`
- `ops/caddy/Caddyfile`
- `.env.deploy.example`

## Alternative

Falls der Host ueber Portainer statt direkte Docker-Compose-CLI betrieben werden soll, liegt der parallele Pfad in `docker-compose.portainer.yml` und `docs/operations/portainer-staging-runbook.md`.

## Vorbedingungen

1. DNS:
   - `staging.rauchbar.genussgesellschaft-neckartal.de` als `A`-Record auf `65.21.2.149`
   - `admin.rauchbar.genussgesellschaft-neckartal.de` als `A`-Record auf `65.21.2.149`
   - kein `AAAA`-Record, solange IPv6 auf Host und Firewall nicht bewusst konfiguriert ist
2. Host:
   - Docker Engine und Compose Plugin installiert
   - eingehend `80/tcp` und `443/tcp` offen
   - ausgehend `443/tcp` fuer Image Pulls und ACME erreichbar
3. Zugriff:
   - SSH-Zugang zum Host
   - Schreibrechte fuer das Deploy-Verzeichnis

## Bootstrap

1. Repo auf dem Host auschecken oder aktualisieren.
2. `.env.deploy.example` nach `.env.deploy` kopieren und alle Platzhalter ersetzen:
   - `ACME_EMAIL`
   - `POSTGRES_PASSWORD`
   - `SESSION_SECRET`
   - `EMAIL_PROVIDER_API_KEY`
   - `WHATSAPP_PROVIDER_API_KEY`
3. Compose-Konfiguration pruefen:

```bash
docker compose --env-file .env.deploy -f docker-compose.deploy.yml config
```

4. Services bauen und starten:

```bash
docker compose --env-file .env.deploy -f docker-compose.deploy.yml up -d --build
```

## Verifikation

Nach erfolgreichem Start muessen folgende Checks gruen sein:

- `https://staging.rauchbar.genussgesellschaft-neckartal.de/health/live`
- `https://staging.rauchbar.genussgesellschaft-neckartal.de/health/ready`
- `https://admin.rauchbar.genussgesellschaft-neckartal.de/health/live`
- `https://admin.rauchbar.genussgesellschaft-neckartal.de/health/ready`
- intern fuer Worker:

```bash
docker compose --env-file .env.deploy -f docker-compose.deploy.yml exec worker \
  wget -qO- http://127.0.0.1:8080/healthz
```

## Exposure-Regeln

- keine direkten Port-Publishes fuer `site`, `admin`, `worker`, `postgres` oder `redis`
- nur Caddy oeffnet `80` und `443`
- `worker` bleibt intern und bekommt keine oeffentliche Route
- `postgres` und `redis` bleiben ausschliesslich im internen Docker-Netz

## Rollback

1. Vorherigen Commit auschecken.
2. Stack mit dem bekannten Stand neu ausrollen:

```bash
docker compose --env-file .env.deploy -f docker-compose.deploy.yml up -d --build
```

3. Health-Endpunkte erneut pruefen.

## Bekannte externe Blocker

- fehlender SSH-Zugang verhindert den eigentlichen Deploy-Schritt
- fehlende oder falsche DNS-`A`-Records verhindern HTTP-01 und damit TLS
- geschlossene Ports `80`/`443` verhindern Caddy-Exposure und Let's Encrypt
