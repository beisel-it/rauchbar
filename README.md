# Rauchbar

Rauchbar ist ein produktorientiertes Monorepo fuer einen kuratierten Deal-Service rund um Zigarrenangebote deutscher Online-Haendler. Das MVP kombiniert eine oeffentliche Site mit 24h Verzoegerung, einen mitgliederorientierten Signup- und Preference-Flow, eine interne Admin-Konsole fuer Freigaben und Versand, sowie Worker-Pipelines fuer Scraping, Matching und Benachrichtigungen.

## Produktversprechen

- kuratierter Wochen-Digest statt manueller Deal-Jagd
- optionale Hot-Deal-Alerts per E-Mail oder WhatsApp
- Mitglieder sehen relevante Angebote vor der oeffentlichen Freigabe
- klare Trennung zwischen interner Freigabe, Mitgliederfenster und oeffentlicher Publikation

## MVP im Ueberblick

Rauchbar fokussiert sich im ersten Schnitt auf drei Kernoberflaechen und gemeinsame Systembausteine:

- `apps/site`: Homepage, Signup, Preference-Onboarding, Mitgliedereinstieg und zeitverzoegertes Deal-Archiv
- `apps/admin`: Operations-Oberflaeche fuer Shops, Deals, Freigaben, Versand und Monitoring
- `apps/worker`: Scraping, Normalisierung, Hot-Deal-Erkennung, Digest-Erstellung und Versand-Jobs
- `packages/deals-core`: gemeinsame Domainmodelle und Regelgrundlagen
- `packages/design-system`: visuelle Sprache fuer Site, Admin und Mailings
- `packages/notifications`: Kanalabstraktionen fuer E-Mail und WhatsApp

## Nutzer- und Surface-Modell

Das Produkt trennt klar zwischen drei Perspektiven:

- Oeffentliche Besucher verstehen das Angebot schnell, sehen verzoegerte Deals und werden in den Signup gefuehrt.
- Mitglieder erhalten relevante Digests, koennen Alerts steuern und ihre Praeferenzen leicht nachschaerfen.
- Admin-Operatoren pruefen Deals, ueberwachen Shop- und Versandstatus und greifen bei Fehlern gezielt ein.

Leitprinzipien fuer alle Oberflaechen:

- Relevanz vor Browsing-Tiefe
- Mitglieder-Vorteil an jeder passenden Stelle sichtbar machen
- Status, Versand und Freigaben immer explizit darstellen
- eine gemeinsame Designsprache fuer Site, Admin und Notifications nutzen

## Informationsarchitektur

Die aktuelle UX- und Design-Handoff definiert fuer das MVP unter anderem:

- Site-Navigation: `Deals entdecken`, `So funktioniert's`, `Mitglied werden`, `Login`
- Mitgliedsbereich: `Fuer dich`, `Alerts`, `Praeferenzen`, `Konto`
- Admin-Navigation: `Uebersicht`, `Shops`, `Deals`, `Freigaben`, `Versand`
- Homepage mit Hero, Cadence-Proof, "So funktioniert's", Delayed-Deal-Preview, Personalisierungsmodul, Digest/Alert-Erklaerung, FAQ und Final-CTA
- konsistente Lifecycle- und Statussprache fuer Deals, Mitglieder, Shop-Health und Versand

## Repository-Struktur

```text
apps/
  admin/        Interne Operations-Oberflaeche
  site/         Oeffentliche Site und Mitgliedersurface
  worker/       Datenpipeline, Matching und Versand
packages/
  deals-core/   Domainmodelle, Regeln, Normalisierung
  design-system/ Design-Tokens und UI-/Mailing-Sprache
  notifications/ Benachrichtigungskanaele und Versandlogik
docs/
  architecture/ Systemaufbau und Leitplanken
  design/       Eingebettete Design-Guidance fuer Delivery
  product/      PRD und produktnahe Surface-Definitionen
  roadmap/      MVP-Mission und Streams
  ux/           IA, Wireframes, Journeys und State-Maps
```

## Schluesseldokumente

Wenn du neu in das Repo kommst, starte hier:

- [Produktdefinition](docs/product/prd.md)
- [Architekturueberblick](docs/architecture/overview.md)
- [MVP-Roadmap](docs/roadmap/mvp-cycle-001.md)
- [UX-Implementierungssupport](docs/ux/implementation-support.md)
- [Homepage IA und Wireframe](docs/ux/homepage-ia-wireframe.md)
- [Lifecycle- und State-Map](docs/ux/lifecycle-state-map.md)
- [Embedded Design Delivery Guidance](docs/design/embedded-delivery-guidance.md)
- [Admin Surface Definition](docs/product/admin-surface.md)

App-spezifische Readmes bleiben die lokale Einstiegsebene fuer einzelne Workstreams:

- [Site README](apps/site/src/README.md)
- [Admin README](apps/admin/src/README.md)
- [Worker README](apps/worker/src/README.md)

## Entwicklung

Das Monorepo nutzt `pnpm` Workspaces.

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm typecheck
```

Root-Skripte:

- `pnpm dev`: startet aktuell die Site (`@rauchbar/site`)
- `pnpm build`: baut alle Workspace-Pakete
- `pnpm lint`: fuehrt Linting fuer alle Pakete aus
- `pnpm test`: fuehrt alle Tests aus
- `pnpm typecheck`: prueft alle TypeScript-Pakete

## Delivery-Status

Fertig definierte Handoffs liegen fuer Produkt, UX, Admin-Surface und embedded Design vor. Die groessten verbleibenden Integrationsrisiken liegen aktuell bei:

- Notification-Payloads und Template-Vertraegen
- gemeinsamer Status- und Copy-Glossary fuer alle Oberflaechen

## Nicht Teil des ersten Schnitts

- Community-Features
- nativer Mobile-App-Scope
- Checkout oder In-App-Kauf
- vollautomatische Preisprognosen
