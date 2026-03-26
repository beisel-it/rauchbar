# Portainer Staging Runbook

Stand: 2026-03-26

Dieses Runbook beschreibt den zweiten Staging-Pfad fuer Rauchbar: Deployment ueber Portainer auf denselben Host `65.21.2.149` und dieselben Hostnamen wie beim direkten Docker-Compose-Pfad.

## Zielbild

- Portainer deployed einen Stack aus dem Git-Repo
- `staging.rauchbar.genussgesellschaft-neckartal.de` zeigt auf `site`
- `admin.rauchbar.genussgesellschaft-neckartal.de` zeigt auf `admin`
- nur Caddy ist oeffentlich auf `80` und `443` erreichbar
- `site`, `admin`, `worker`, `postgres` und `redis` laufen nur im internen Docker-Netz
- TLS wird automatisch ueber Let's Encrypt / HTTP-01 von Caddy abgewickelt

## Repo-Artefakte

- `docker-compose.portainer.yml`
- `ops/caddy/Dockerfile.portainer`
- `ops/caddy/Caddyfile`
- `ops/portainer/stack.env.example`

## Warum eigener Portainer-Compose-Pfad

Der bestehende lokale Maschinenpfad nutzt in `docker-compose.deploy.yml` einen relativen Bind-Mount fuer `ops/caddy/Caddyfile`. Fuer Portainer-Git-Deployments ist das unattraktiv, weil relative Path Volumes nur in Portainer Business Edition als eigene Funktion verfuegbar sind und Git-basierte relative Bind-Mounts auf Updates empfindlich reagieren koennen. Der Portainer-Pfad baut deshalb fuer Caddy ein kleines Image, das die Caddy-Konfiguration direkt mitliefert.

## Vorbedingungen

1. DNS:
   - `staging.rauchbar.genussgesellschaft-neckartal.de` als `A`-Record auf `65.21.2.149`
   - `admin.rauchbar.genussgesellschaft-neckartal.de` als `A`-Record auf `65.21.2.149`
   - kein `AAAA`-Record, solange IPv6 auf Host und Firewall nicht bewusst konfiguriert ist
2. Host / Endpoint:
   - Docker Engine laeuft auf `65.21.2.149`
   - Endpoint ist in Portainer eingebunden
   - eingehend `80/tcp` und `443/tcp` offen
   - ausgehend `443/tcp` fuer Image Pulls und ACME erreichbar
3. Repo:
   - Portainer kann das Git-Repo erreichen
   - keine Submodule noetig

## Stack-Anlage in Portainer

1. In Portainer `Stacks` -> `Add stack`.
2. Stack-Name setzen, empfohlen: `rauchbar-staging`.
3. Als Quelle `Git Repository` waehlen.
4. Repository, Branch und Compose-Pfad setzen:
   - Branch: der gewuenschte Deploy-Branch oder `main`
   - Compose path: `docker-compose.portainer.yml`
5. Unter Environment Variables die Werte aus `ops/portainer/stack.env.example` laden oder manuell setzen.
6. Deploy ausloesen.

## Verifikation

Nach erfolgreichem Deploy muessen folgende Checks gruen sein:

- `https://staging.rauchbar.genussgesellschaft-neckartal.de/health/live`
- `https://staging.rauchbar.genussgesellschaft-neckartal.de/health/ready`
- `https://admin.rauchbar.genussgesellschaft-neckartal.de/health/live`
- `https://admin.rauchbar.genussgesellschaft-neckartal.de/health/ready`
- intern fuer Worker:

```bash
docker exec "$(docker ps --filter name=worker --format '{{.ID}}' | head -n1)" \
  wget -qO- http://127.0.0.1:8080/healthz
```

## Update-Pfad

1. Gewuenschten Repo-Commit oder Branch aktualisieren.
2. In Portainer den Stack aus Git neu deployen.
3. Wenn Build-Kontext oder Konfiguration geaendert wurden, einen vollstaendigen Redeploy erzwingen, damit alle Container neu gebaut bzw. neu erstellt werden.
4. Danach alle Health-Endpunkte erneut pruefen.

## Exposure-Regeln

- keine direkten Port-Publishes fuer `site`, `admin`, `worker`, `postgres` oder `redis`
- nur Caddy oeffnet `80` und `443`
- `worker` bleibt intern und bekommt keine oeffentliche Route
- `postgres` und `redis` bleiben ausschliesslich im internen Docker-Netz

## Rollback

1. In Portainer den Stack auf den letzten bekannten Commit oder Branch-Stand zuruecksetzen.
2. Stack neu deployen.
3. Health-Endpunkte und Caddy-TLS erneut pruefen.

## Bekannte externe Blocker

- fehlende oder falsche DNS-`A`-Records verhindern HTTP-01 und damit TLS
- geschlossene Ports `80`/`443` verhindern Caddy-Exposure und Let's Encrypt
- fehlender Git-Zugriff im Portainer-Endpoint verhindert Stack-Deployment
- fehlende reale Admin-MVP-Runtime fuehrt weiterhin nur zum Placeholder-Admin, auch wenn das Deployment technisch erfolgreich ist
