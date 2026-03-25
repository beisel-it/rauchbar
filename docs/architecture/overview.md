# Architekturueberblick

Rauchbar wird als produktorientiertes Monorepo mit vier Hauptkomponenten aufgesetzt:

## 1. Site

- Homepage
- Mitglieder-Registrierung
- Preference-Onboarding
- oeffentliches Deal-Archiv mit 24h Delay

## 2. Admin

- Shop-Management
- Feed-/Crawler-Status
- Deal-Freigabe und Qualitaetskontrolle
- Newsletter- und Alert-Operations

## 3. Worker

- Shop-Scraper und Preis-Monitoring
- Deal-Normalisierung
- Hot-Deal-Erkennung
- Digest-Generierung
- Versand-Jobs

## 4. Shared Packages

- `deals-core`: Entitaeten, Rules, Normalisierung
- `design-system`: UI- und Mailing-Sprache
- `notifications`: Provider-Abstraktionen fuer E-Mail und WhatsApp

## Leitplanken

- deutsche Shops zuerst
- schnelle Iteration vor Plattformkomplexitaet
- klare Trennung zwischen interner Freigabe und oeffentlicher Publikation
- gleiche Designsprache fuer Site, Admin und Mailings

