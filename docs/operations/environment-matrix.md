# Environment- und Config-Matrix

Stand: 2026-03-25

Diese Matrix beschreibt die deploybaren Konfigurationsartefakte fuer Rauchbar. In diesem Branch enthaelt `render.yaml` jetzt die aktivierten Stanzas fuer `site`, `admin` und `worker` sowie die zugehoerigen Environment Groups und Managed Services.

## Geltungsbereich

- `local` nutzt `.env`-Dateien oder Docker Compose mit lokalen Diensten.
- `preview` bleibt im MVP manuell und selektiv fuer `site` und `admin`.
- `staging` und `production` werden in `render.yaml` modelliert.
- Secrets werden in Render oder GitHub gepflegt, nicht im Repo.
- `render.yaml` provisioniert sowohl die Shared Infrastructure als auch die derzeit deploybaren Web- und Worker-Services.

## App- und Runtime-Vertrag

### Site

- Zielbild: Docker-Web-Service
- Build: `corepack pnpm --filter @rauchbar/site build`
- Start: `corepack pnpm --filter @rauchbar/site start`
- Bind: `HOST=0.0.0.0`, `PORT` aus Env
- Health: `GET /health/live`, `GET /health/ready`
- Aktueller Branch-Zustand: dedizierter Docker-Build vorhanden; der Service ist im Blueprint fuer Staging und Production aktiviert.

### Admin

- Zielvertrag identisch zu Site
- aktueller Stand: deploybarer Placeholder-Web-Service mit eigener Docker-Verpackung; im Blueprint fuer Staging und Production aktiviert

### Worker

- Zielbild: Docker-Service mit HTTP-Startprozess `corepack pnpm --filter @rauchbar/worker start`
- Standard-Port: `8080`
- Health: `GET /healthz`, `GET /readyz`
- Logs: newline-delimited JSON auf `stdout`/`stderr`
- Rollensteuerung ueber `WORKER_ROLE=worker|scrape|digest`
- Aktueller Branch-Zustand: der Worker-Dockerfile und die Health-Runtime sind integriert; der Worker-Service ist im Blueprint fuer Staging und Production aktiviert.

## Variablenmatrix

| Key | Scope | Local | Preview | Staging | Production | Quelle / Bemerkung |
| --- | --- | --- | --- | --- | --- | --- |
| `NODE_ENV` | all | `development` | `production` | `production` | `production` | Runtime-Modus |
| `APP_ENV` | all | `local` | `preview` | `staging` | `production` | Fachliches Environment |
| `HOST` | site, admin | `0.0.0.0` | `0.0.0.0` | `0.0.0.0` | `0.0.0.0` | HTTP bind host |
| `PORT` | site | `3000` | provider | `10000` | `10000` | Docker-Default im Site-Image, Render setzt explizit |
| `PORT` | admin | `3001` | provider | `10001` | `10001` | Docker-Default im Admin-Image, Render setzt explizit |
| `PORT` | worker | `8080` | `8080` | `8080` | `8080` | Worker-Health-Port |
| `LOG_LEVEL` | all | `debug` | `info` | `info` | `info` | Muss JSON-Logging nicht verhindern |
| `DATABASE_URL` | all app services | local DB | preview DB | staging DB | prod DB | Secret/managed reference |
| `REDIS_HOST` | all app services | `localhost` | preview Redis | staging Redis | prod Redis | aus Render keyvalue host |
| `REDIS_PORT` | all app services | `6379` | provider | provider | provider | aus Render keyvalue port |
| `SITE_BASE_URL` | shared | `http://localhost:3000` | preview URL | `https://staging.rauchbar.de` | `https://rauchbar.de` | oeffentliche Site |
| `ADMIN_BASE_URL` | shared | `http://localhost:3001` | preview URL | `https://admin-staging.rauchbar.de` | `https://admin.rauchbar.de` | Admin-URL |
| `PUBLIC_APP_URL` | shared | `http://localhost:3000` | preview URL | `https://staging.rauchbar.de` | `https://rauchbar.de` | Default absolute URL |
| `WORKER_ROLE` | worker | `worker` | optional | `worker`/`scrape`/`digest` | `worker`/`scrape`/`digest` | durch Service/Rolle gesetzt |
| `SCRAPER_JOB_QUEUE` | worker | `scrape-local` | `scrape-preview` | `scrape-staging` | `scrape-production` | queue namespace |
| `QUEUE_CONCURRENCY` | worker | `1` | `1` | `2` | `4` | tuning pro environment |
| `ALLOW_REAL_EMAIL_SEND` | notifications | `false` | `false` | `false` | `true` | harte Safety-Grenze |
| `ALLOW_REAL_WHATSAPP_SEND` | notifications | `false` | `false` | `false` | `true` | harte Safety-Grenze |
| `SESSION_SECRET` | site, admin | local secret | preview secret | generated in env group | generated in env group | nie committen |
| `REDIS_URL` | all app services | local redis URL | preview Redis URL | staging Redis URL | prod Redis URL | private-network connection string |
| `EMAIL_PROVIDER_API_KEY` | worker/notifications | local sandbox | preview sandbox | staging sandbox | prod secret | `sync: false` |
| `WHATSAPP_PROVIDER_API_KEY` | worker/notifications | local sandbox | preview sandbox | staging sandbox | prod secret | `sync: false` |
| `SENTRY_DSN` | all | optional | preview DSN | staging DSN | prod DSN | `sync: false` |

## Nicht im Repo hinterlegte Werte

Folgende Werte muessen beim Provisioning manuell oder ueber den Provider gesetzt werden:

- alle echten Provider-API-Keys
- alle DSNs/Webhook-Secrets
- zusaetzliche manuelle Provider-Secrets fuer Notifications/Auth
- eventuelle OAuth-/Auth-Provider-Secrets
- zusaetzliche DB- oder Queue-Credentials ausserhalb der Render-Referenzen

## Preview-Regeln

- Preview wird im MVP nur manuell erzeugt.
- Preview bekommt nie reale Versand-Credentials.
- Preview fuer Worker ist standardmaessig deaktiviert.
- Preview-Datenbank darf Testdaten enthalten, aber keine Kopie produktiver personenbezogener Daten ohne gesonderte Freigabe.

## Aktivierte App-Services

Aktuell definiert `render.yaml` folgende Services pro Environment:

- `site` als Docker-Web-Service mit `GET /health/live` und `GET /health/ready`
- `admin` als Docker-Web-Service mit dem gleichen Health-Vertrag
- `worker` als Docker-Worker mit `PORT=8080` fuer interne Health-Probes

Separate `scrape`- und `digest`-Cron-Jobs bleiben ein Folge-Schritt, sobald die Worker-Rollen ueber eigene Startprofile oder Commands modelliert werden.
