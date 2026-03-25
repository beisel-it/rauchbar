# Release- und Rollback-Runbook

Stand: 2026-03-25

Dieses Dokument ist die erste Betriebsgrundlage fuer Staging- und Produktionsdeployments auf Basis von `render.yaml`. Es ist bewusst knapp, aber konkret genug fuer die naechste Delivery-Stufe.

## Voraussetzungen

- `main` ist gruen in CI.
- `render.yaml` ist synchron zum aktuellen Repo-Stand.
- Dockerfiles und Startskripte der Zielservices existieren.
- Secrets und Environment Groups sind fuer das Ziel-Environment gepflegt.
- Datenbankmigrationen sind vorab geprueft.

## Staging-Release

1. Merge auf `main` nur bei gruener CI.
2. Render synced `staging` mit `autoDeployTrigger: checksPass`.
3. Nach Deploy pruefen:
   - `site`: `GET /health/live`, `GET /health/ready`
   - `admin`: `GET /health/live`, `GET /health/ready`
   - `worker`: `GET /healthz`, `GET /readyz`
4. Einen Smoke-Test fuer Signup, Admin-Login und einen Worker-Pfad ausfuehren.
5. Bestaetigen, dass `ALLOW_REAL_EMAIL_SEND=false` und `ALLOW_REAL_WHATSAPP_SEND=false` aktiv sind.

## Produktions-Release

1. Freigabe auf Basis eines bekannten `main`-Commits erteilen.
2. In Render den Produktions-Deploy manuell triggern oder ueber einen dedizierten Release-Tag promoten.
3. Vor dem Traffic-Check sicherstellen:
   - geplante Migration ist ausgefuehrt
   - Provider-Secrets sind vorhanden
   - Domains und TLS sind gesund
4. Nach Deploy pruefen:
   - `https://rauchbar.de/health/live`
   - `https://rauchbar.de/health/ready`
   - `https://admin.rauchbar.de/health/live`
   - `https://admin.rauchbar.de/health/ready`
   - Worker-Service intern auf `/healthz` und `/readyz`
5. Einen manuellen E2E-Smoketest durchfuehren:
   - Signup / Session
   - Deal-Seite oder Mitgliederbereich
   - Admin-Grundnavigation
   - ein kontrollierter Worker-Lauf ohne Fehler

## Datenbankmigrationen

- Migrationen werden nicht implizit beim Web-Start ausgefuehrt.
- Standardpfad:
  1. One-off Job oder Shell im Ziel-Environment starten
  2. `corepack pnpm --filter @rauchbar/worker migrate:deploy` ausfuehren
  3. Ergebnis und DB-Status pruefen
- Bei destruktiven Migrationen sind Backup/PITR-Fenster vorab zu bestaetigen.

## Rollback

### Applikations-Rollback

1. In Render auf die letzte bekannte gesunde Version des betroffenen Services zurueckrollen.
2. Health-Endpunkte erneut pruefen.
3. Fehlertracking und Logs fuer Wiederauftreten beobachten.
4. Falls nur ein Surface betroffen ist, selektiv rollbacken statt die ganze Plattform zurueckzudrehen.

### Datenbank-Rollback

- Bevorzugt ueber vorwaertskompatible Hotfix-Migration statt hartem Restore.
- Wenn Restore unvermeidbar ist:
  1. Incident eroefnen
  2. Schreibzugriffe stoppen oder Maintenance aktivieren
  3. letzten brauchbaren Backup-/PITR-Punkt bestimmen
  4. Restore in isolierter DB pruefen, dann kontrolliert umschalten

## Versand-Sicherheit

- Nie auf Staging oder Preview deployen, wenn reale Versand-Secrets gesetzt sind.
- Vor jedem Produktions-Release die Safety-Flags explizit pruefen.
- Testnachrichten gehen nur an interne Listen oder Provider-Sandboxes.

## Mindestmonitoring nach Release

- Render-Deploy-Status
- Uptime-Checks fuer Site/Admin
- Sentry Error Rate
- Worker-/Cron-Fehlerrate
- Versandfehler bei E-Mail und WhatsApp

## Bekannte Luecken

- Die konkreten Worker-Artefakte liegen upstream bereits vor, sind aber in diesem Branch noch nicht enthalten.
- Site/Admin-Vertragsdetails liegen upstream auf einem bereinigten Branch vor und muessen vor dem ersten echten Render-Sync integriert werden.
- Worker-, Site- und Admin-Dockerfiles muessen vor erstem echten Sync gegen `render.yaml` gemeinsam in einem integrierten Branch getestet werden.
- Ein separates Restore-Runbook fuer Postgres-PITR fehlt noch und ist als naechster Ops-Schritt einzuplanen.
