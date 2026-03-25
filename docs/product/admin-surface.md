# Admin Surface

## Ziel

Die Admin-Konsole ist das interne Operations-Werkzeug fuer Rauchbar. Sie verbindet drei Arbeitsbereiche:

- Merchant Operations fuer Shop-Onboarding und Crawler-Steuerung
- Approval Operations fuer Deal-Qualitaet, Freigaben und Publikationskontrolle
- Dispatch Operations fuer Digest- und Hot-Deal-Versand

Der MVP fokussiert sich auf Transparenz, manuelle Kontrollpunkte und schnelle Eingriffe. Vollautomatische Steuerung ist kein Ziel im ersten Schnitt.

## Nutzerrollen im MVP

- Operator: pflegt Shops, prueft Fehler, startet Wiederholungen
- Editor: bewertet Deals, setzt Freigaben und Sperren
- Dispatch Manager: ueberwacht und korrigiert Versandlaeufe

Eine getrennte Rechteverwaltung ist spaeter moeglich, fuer den MVP reicht ein gemeinsamer interner Zugang mit klaren Bereichen.

## Navigation

Die Admin-Oberflaeche besteht aus sechs Kernseiten:

1. Dashboard
2. Merchants
3. Incoming Deals
4. Approval Queue
5. Dispatch Runs
6. Audit Log

## 1. Dashboard

Das Dashboard gibt einen taeglichen Operations-Ueberblick:

- aktive Shops und letzter erfolgreicher Crawl
- Anzahl neuer Deals seit dem letzten Lauf
- offene Freigaben mit Alter und Prioritaet
- anstehende Digest-Runs
- fehlgeschlagene Versand- oder Scraping-Jobs
- Hinweise auf blockierte Shops oder pausierte Kanaele

Primare Aktionen:

- zu problematischen Shops springen
- offene Freigaben filtern
- letzten Digest- oder Alert-Lauf oeffnen

## 2. Merchants

Die Merchant-Verwaltung ist die Quelle fuer Shop-Betrieb und Monitoring.

### Liste

Die Liste zeigt pro Shop:

- Name
- Status: active, paused, draft
- Crawl-Frequenz
- letzter erfolgreicher Lauf
- letzter Fehler
- Anzahl eingehender Deals in 7 Tagen

### Detailansicht

Die Detailansicht deckt den gesamten Merchant-Lebenszyklus ab:

- Stammdaten: Name, Basis-URL, Land, Notizen
- Crawler-Konfiguration: Startpunkte, erwartete Kategorien, Polling-Frequenz
- Monitoring: letzte Laeufe, Fehlerraten, HTML-Aenderungen, Retry-Historie
- Deal-Qualitaet: Duplikatquote, Anteil abgelehnter Deals, zuletzt freigegebene Deals

### Aktionen

- Merchant anlegen oder pausieren
- Crawl manuell anstossen
- fehlerhaften Lauf erneut ausfuehren
- Merchant fuer Publikation sperren, ohne Scraping zu deaktivieren

## 3. Incoming Deals

Incoming Deals ist die operative Inbox fuer frisch normalisierte Angebote vor der finalen Freigabe.

Die Liste zeigt:

- Deal-Titel
- Merchant
- aktueller Preis und optional vorheriger Preis
- erkannte Kanaele
- Zeitpunkt der Erkennung
- Systemstatus: neu, unsicher, duplikatverdaechtig, regelgetriggert

Operatoren koennen hier schnell triagieren:

- offensichtliche Duplikate markieren
- falsche Preisparser oder Metadatenfehler erkennen
- einen Deal direkt in die Approval Queue schicken oder verwerfen

## 4. Approval Queue

Die Approval Queue ist der zentrale redaktionelle Kontrollpunkt.

### Freigabestatus

- pending
- approved_for_members
- scheduled_for_public_site
- rejected
- needs_revision

### Entscheidungsgrundlagen

Die Freigabeansicht zeigt:

- Originaldaten des Shops
- normalisierte Deal-Daten
- Preisveraenderung und Deal-Staerke
- Zielkanaele: Digest, E-Mail Hot Deal, WhatsApp Hot Deal
- Vorschau fuer Mitgliederfenster und oeffentliche Publikation
- Begruendung bei Regeltriggern

### Aktionen

- fuer Mitglieder freigeben
- Hot-Deal-Kanaele einzeln aktivieren oder deaktivieren
- Deal ablehnen mit Grund
- Deal zur Nachbearbeitung markieren
- Sichtbarkeit manuell zurueckziehen

Jede Freigabe erzeugt einen Audit-Eintrag.

## 5. Dispatch Runs

Dispatch Runs buendelt den Versandstatus fuer Digests und sofortige Alerts.

### Ansichten

- geplante Runs
- laufende Runs
- abgeschlossene Runs
- fehlgeschlagene Runs

### Pro Run sichtbar

- Kanal
- Startzeit
- Umfang: Anzahl Deals und Empfaenger
- Status je Provider
- Fehlerrate
- Wiederholungsversuche

### Aktionen

- Run pausieren, wenn Inhalt oder Provider problematisch ist
- fehlgeschlagenen Run wiederholen
- Vorschau vor Versand oeffnen
- einzelne Kanaele temporar deaktivieren

Fuer den MVP gilt: Versand darf nur fuer bereits freigegebene Deals starten.

## 6. Audit Log

Das Audit Log dokumentiert kritische Admin-Aktionen:

- Merchant erstellt, geaendert, pausiert
- Crawl manuell gestartet oder wiederholt
- Deal freigegeben, abgelehnt oder zurueckgezogen
- Dispatch gestartet, pausiert, wiederholt

Minimalfelder:

- Zeitstempel
- interner Nutzer
- Objekt-Typ
- Objekt-ID
- Aktion
- optionaler Kommentar

## Wichtige Workflows

### Merchant Incident

1. Fehler auf dem Dashboard erkennen
2. Merchant-Detailansicht oeffnen
3. letzten Crawl und Fehlermeldung pruefen
4. Merchant pausieren oder Retry ausfuehren

### Deal Approval

1. neuen Deal aus Incoming Deals oeffnen
2. Preis und Metadaten validieren
3. Kanaele und Mitgliederfenster bestaetigen
4. Deal freigeben oder ablehnen

### Dispatch Recovery

1. fehlgeschlagenen Run in Dispatch Runs identifizieren
2. Provider- oder Inhaltsproblem eingrenzen
3. betroffenen Kanal pausieren oder Run wiederholen
4. Ergebnis im Audit Log nachvollziehen

## Datenobjekte fuer die UI

Die Admin-Konsole braucht im MVP mindestens diese Objekte:

- Merchant
- CrawlRun
- IncomingDeal
- ApprovalDecision
- DispatchRun
- AuditEvent

`packages/deals-core` liefert bereits eine erste `Deal`-Basis und sollte spaeter um die fuer Approval und Dispatch noetigen Statusfelder erweitert werden.

## Nicht Teil des MVP

- fein granulare Rollen- und Rechteverwaltung
- Bulk-Editing fuer hunderte Merchants
- automatische Freigabe ohne menschlichen Kontrollpunkt
- tiefe BI-Auswertungen fuer Umsatz oder Conversion
