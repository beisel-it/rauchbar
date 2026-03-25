# Environment- und Config-Matrix

Stand: 2026-03-25

Diese Matrix beschreibt die deploybaren Konfigurationsartefakte fuer Rauchbar. In diesem Branch ist `render.yaml` bewusst auf Environments plus managed infra reduziert; konkrete App-Service-Stanzas werden erst nach Merge der zugehoerigen Runtime-Artefakte aktiviert.

## Geltungsbereich

- `local` nutzt `.env`-Dateien oder Docker Compose mit lokalen Diensten.
- `preview` bleibt im MVP manuell und selektiv fuer `site` und `admin`.
- `staging` und `production` werden in `render.yaml` modelliert.
- Secrets werden in Render oder GitHub gepflegt, nicht im Repo.
- `render.yaml` provisioniert in diesem Branch nur Environment Groups, Postgres und Key Value. Web-/Worker-Services werden nach Runtime-Integration in einem Folge-PR aktiviert.

## App- und Runtime-Vertrag

### Site

- Zielbild: Docker-Web-Service
- Build: `corepack pnpm --filter @rauchbar/site build`
- Start: `corepack pnpm --filter @rauchbar/site start`
- Bind: `HOST=0.0.0.0`, `PORT` aus Env
- Health: `GET /health/live`, `GET /health/ready`
- Aktueller Branch-Zustand: lokale Vite-Dev-Konfiguration nutzt noch festen Dev-Port `4173`; deshalb ist dieser Service noch nicht im Blueprint aktiviert.

### Admin

- Zielvertrag identisch zu Site
- aktueller Stand auf dem readiness-Branch ist ein deploybarer Placeholder-Web-Service; in diesem Branch ist der Service noch nicht im Blueprint aktiviert

### Worker

- Zielbild: Docker-Service mit HTTP-Startprozess `corepack pnpm --filter @rauchbar/worker start`
- Standard-Port: `8080`
- Health: `GET /healthz`, `GET /readyz`
- Logs: newline-delimited JSON auf `stdout`/`stderr`
- Rollensteuerung ueber `WORKER_ROLE=worker|scrape|digest`
- Aktueller Branch-Zustand: der Worker-Dockerfile liegt upstream auf `backend-crawlers`, aber nicht in diesem Branch; deshalb ist der Service noch nicht im Blueprint aktiviert.

## Variablenmatrix

| Key | Scope | Local | Preview | Staging | Production | Quelle / Bemerkung |
| --- | --- | --- | --- | --- | --- | --- |
| `NODE_ENV` | all | `development` | `production` | `production` | `production` | Runtime-Modus |
| `APP_ENV` | all | `local` | `preview` | `staging` | `production` | Fachliches Environment |
| `HOST` | site, admin | `0.0.0.0` | `0.0.0.0` | `0.0.0.0` | `0.0.0.0` | HTTP bind host |
| `PORT` | site, admin | branch-spezifisch | provider | provider | provider | erst nach Runtime-Merge verbindlich |
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
| `SESSION_SECRET` | site, admin | local secret | preview secret | generated/secret | secret | nie committen |
| `EMAIL_PROVIDER_API_KEY` | worker/notifications | local sandbox | preview sandbox | staging sandbox | prod secret | `sync: false` |
| `WHATSAPP_PROVIDER_API_KEY` | worker/notifications | local sandbox | preview sandbox | staging sandbox | prod secret | `sync: false` |
| `SENTRY_DSN` | all | optional | preview DSN | staging DSN | prod DSN | `sync: false` |

## Nicht im Repo hinterlegte Werte

Folgende Werte muessen beim Provisioning manuell oder ueber den Provider gesetzt werden:

- alle echten Provider-API-Keys
- alle DSNs/Webhook-Secrets
- Production-`SESSION_SECRET`
- eventuelle OAuth-/Auth-Provider-Secrets
- zusaetzliche DB- oder Queue-Credentials ausserhalb der Render-Referenzen

## Preview-Regeln

- Preview wird im MVP nur manuell erzeugt.
- Preview bekommt nie reale Versand-Credentials.
- Preview fuer Worker ist standardmaessig deaktiviert.
- Preview-Datenbank darf Testdaten enthalten, aber keine Kopie produktiver personenbezogener Daten ohne gesonderte Freigabe.

## Aktivierung der App-Services

Nach Merge der Runtime-Branches werden folgende Stanzas in `render.yaml` ergaenzt:

- `site` als Web-Service mit Start `corepack pnpm --filter @rauchbar/site start`
- `admin` als Web-Service mit Start `corepack pnpm --filter @rauchbar/admin start`
- `worker` als Background-Worker plus separate `scrape`- und `digest`-Cron-Jobs

Bis dahin bleibt die Blueprint-Datei bewusst frei von App-Service-Referenzen, damit sie keine nicht vorhandenen Dockerfiles oder Portannahmen codiert.
