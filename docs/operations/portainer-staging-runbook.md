# Portainer Staging Runbook

Stand: 2026-03-26

Dieses Runbook beschreibt den zweiten Staging-Pfad für Rauchbar: Deployment über Portainer auf denselben Host `65.21.2.149` und dieselben Hostnamen wie beim direkten Docker-Compose-Pfad.

## Zielbild

- Portainer deployed einen Stack aus dem Git-Repo
- `staging.rauchbar.genussgesellschaft-neckartal.de` zeigt auf `site`
- `admin.rauchbar.genussgesellschaft-neckartal.de` zeigt auf `admin`
- nur Caddy ist öffentlich auf `80` und `443` erreichbar
- `site`, `admin`, `worker`, `postgres` und `redis` laufen nur im internen Docker-Netz
- TLS wird automatisch über Let's Encrypt / HTTP-01 von Caddy abgewickelt

## Repo-Artefakte

- `docker-compose.portainer.yml`
- `ops/caddy/Dockerfile.portainer`
- `ops/caddy/Caddyfile`
- `ops/portainer/stack.env.example`
- `.github/workflows/portainer-stack-ci.yml`
- `.github/workflows/portainer-image-publish.yml`
- `.github/workflows/portainer-deploy-prework.yml`
- `docs/operations/portainer-automation-prework.md`

## Warum eigener Portainer-Compose-Pfad

Der bestehende lokale Maschinenpfad nutzt in `docker-compose.deploy.yml` einen relativen Bind-Mount für `ops/caddy/Caddyfile`. Für Portainer-Git-Deployments ist das unattraktiv, weil relative Path Volumes nur in Portainer Business Edition als eigene Funktion verfügbar sind und Git-basierte relative Bind-Mounts auf Updates empfindlich reagieren können. Zusätzlich ist Portainers Git-Stack-Pfad für repo-basierte Compose-Builds nicht zuverlässig genug. Der Portainer-Pfad nutzt deshalb vorgebaute Images aus GHCR statt `build:`-Direktiven.

## Vorbedingungen

1. DNS:
   - `staging.rauchbar.genussgesellschaft-neckartal.de` als `A`-Record auf `65.21.2.149`
   - `admin.rauchbar.genussgesellschaft-neckartal.de` als `A`-Record auf `65.21.2.149`
   - kein `AAAA`-Record, solange IPv6 auf Host und Firewall nicht bewusst konfiguriert ist
2. Host / Endpoint:
   - Docker Engine läuft auf `65.21.2.149`
   - Endpoint ist in Portainer eingebunden
   - eingehend `80/tcp` und `443/tcp` offen
   - ausgehend `443/tcp` für Image Pulls und ACME erreichbar
3. Repo:
   - Portainer kann das Git-Repo erreichen
   - keine Submodule nötig

## Stack-Anlage in Portainer

1. In Portainer `Stacks` -> `Add stack`.
2. Stack-Name setzen, empfohlen: `rauchbar-staging`.
3. Als Quelle `Git Repository` wählen.
4. Repository, Branch und Compose-Pfad setzen:
   - Branch: der gewünschte Deploy-Branch oder `main`
   - Compose path: `docker-compose.portainer.yml`
5. Unter Environment Variables die Werte aus `ops/portainer/stack.env.example` laden oder manuell setzen.
6. Deploy auslösen.

Vor dem eigentlichen Stack-Deploy müssen die referenzierten Images bereits in GHCR vorhanden sein. Dafür ist `.github/workflows/portainer-image-publish.yml` der vorgesehene Publish-Pfad.

Solange `ALLOW_REAL_EMAIL_SEND=false` und `ALLOW_REAL_WHATSAPP_SEND=false` gesetzt bleiben, dürfen `EMAIL_PROVIDER_API_KEY` und `WHATSAPP_PROVIDER_API_KEY` leer bleiben. Sie sind für den aktuellen Aktivierungs- und Deploy-Pfad nicht mehr blockierend.

## Verifikation

Nach erfolgreichem Deploy müssen folgende Checks grün sein:

- `https://staging.rauchbar.genussgesellschaft-neckartal.de/health/live`
- `https://staging.rauchbar.genussgesellschaft-neckartal.de/health/ready`
- `https://admin.rauchbar.genussgesellschaft-neckartal.de/health/live`
- `https://admin.rauchbar.genussgesellschaft-neckartal.de/health/ready`
- intern für Worker:

```bash
docker exec "$(docker ps --filter name=worker --format '{{.ID}}' | head -n1)" \
  wget -qO- http://127.0.0.1:8080/healthz
```

## Update-Pfad

1. Gewünschten Repo-Commit oder Branch aktualisieren.
2. Sicherstellen, dass für diesen Commit passende GHCR-Images existieren.
3. In Portainer den Stack aus Git neu deployen.
4. Wenn Image-Tag oder Konfiguration geändert wurden, einen vollständigen Redeploy erzwingen, damit alle Container neu gezogen bzw. neu erstellt werden.
5. Danach alle Health-Endpunkte erneut prüfen.

## Exposure-Regeln

- keine direkten Port-Publishes für `site`, `admin`, `worker`, `postgres` oder `redis`
- nur Caddy öffnet `80` und `443`
- `worker` bleibt intern und bekommt keine öffentliche Route
- `postgres` und `redis` bleiben ausschließlich im internen Docker-Netz

## Rollback

1. In Portainer den Stack auf den letzten bekannten Commit oder Branch-Stand zurücksetzen.
2. Stack neu deployen.
3. Health-Endpunkte und Caddy-TLS erneut prüfen.

## Bekannte externe Blocker

- fehlende oder falsche DNS-`A`-Records verhindern HTTP-01 und damit TLS
- geschlossene Ports `80`/`443` verhindern Caddy-Exposure und Let's Encrypt
- fehlender Git-Zugriff im Portainer-Endpoint verhindert Stack-Deployment
- fehlende GHCR-Images für den gewünschten `IMAGE_TAG` verhindern die Stack-Aktivierung
- fehlende reale Admin-MVP-Runtime führt weiterhin nur zum Placeholder-Admin, auch wenn das Deployment technisch erfolgreich ist
