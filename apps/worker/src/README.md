# Worker

Scraping, Monitoring, Deal-Pipeline, Digest-Jobs und Hot-Deal-Detection.

## Scraper-Struktur

Die Worker-Scraper sind nach Herkunft des Rohmaterials organisiert:

- `newsletter-mail`: Parser fuer eingehende Angebots-Mails und Newsletter-Feeds
- `webshop`: HTML- oder API-Scraper direkt gegenueber Shop-Katalogen

Die Registry liegt in `src/scrapers/registry.ts` und liefert genau einen Scraper fuer eine Kombination aus `merchant` und `source`.
Sie plant ausserdem deterministische `ScrapeJob`s, damit mehrere Queue-Worker denselben Job-Typ parallel bearbeiten koennen, ohne sich eine gemeinsame In-Memory-Orchestrierung zu teilen.

## Cigarworld Webshop

Der erste produktive Webshop-Scraper liegt in `src/scrapers/cigarworld-webshop.ts`.

- erwartet HTML fuer `https://www.cigarworld.de/shop/sonderposten/zigarren`
- extrahiert Angebotskarten in `SourceAdapterOutput.observedOffers`
- normalisiert anschliessend in `NormalizedDealPayload` aus `@rauchbar/deals-core`
- laeuft queue-freundlich ueber `planJobs(...)` und `runJob(...)`, sodass einzelne Source-Jobs horizontal auf mehrere Worker verteilt werden koennen

Fixture-basierte Parser-Tests liegen unter `src/scrapers/*.test.ts` und `src/__fixtures__/`.
Die aktuelle Abdeckung umfasst Parser-Assertions fuer Cigarworld-Angebotskarten sowie einen End-to-End-Test vom queuebaren `ScrapeJob` bis zu den normalisierten Deals.

Siehe `docs/architecture/worker-ingestion-blueprint.md` fuer die implementierbare Pipeline-Grenze zwischen Source-Adaptern, `@rauchbar/deals-core`, Monitoring und Hot-Deal-Handoff.
Siehe `docs/architecture/worker-runtime-contract.md` fuer den deployment-relevanten Start-, Health- und Logging-Vertrag.

## Runtime Contract

- Start: `pnpm --filter @rauchbar/worker start`
- Health: `GET /healthz`
- Readiness: `GET /readyz`
- Logs: newline-delimited JSON auf stdout/stderr
- Docker runtime: `apps/worker/Dockerfile`

## MVP Weekly Digest

- Der Worker baut fuer den MVP einen provider-faehigen E-Mail-Command fuer den Wochen-Digest.
- Versand-Seitenwirkungen liegen ausserhalb des Workers und ausserhalb des Digest-Builders.
- Nur Deals mit dem Channel `digest` landen im woechentlichen E-Mail-Digest.

## MVP Hot Deals

- Der Worker baut fuer den MVP provider-faehige Commands fuer `email-hot-deal` und `whatsapp-hot-deal`.
- Queue-Time-Gating laeuft ueber `canQueueNotification(...)`, damit Deal-Channel, Review-/Publikationsstatus, Mitgliederfenster und Empfaenger-Praeferenzen vor dem Versand geprueft werden.
- Pro Deal und Empfaenger entsteht hoechstens ein Dispatch pro Hot-Deal-Kanal.
