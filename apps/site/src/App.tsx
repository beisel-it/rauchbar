import { useState } from 'react';
import type { Deal, NotificationPreference } from '@rauchbar/deals-core';
import { brandTokens } from '@rauchbar/design-system';
import { defaultNotificationPreference, preferenceOptions, sampleDeals } from './mockData';

type SignupState = {
  email: string;
  formats: string[];
  brands: string[];
  priceBand: string;
  notifications: NotificationPreference;
};

const initialSignupState: SignupState = {
  email: '',
  formats: ['Robusto'],
  brands: ['Partagas'],
  priceBand: '15 bis 30 EUR',
  notifications: defaultNotificationPreference,
};

const currency = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

const dateTime = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const publicationLabels: Record<Deal['publicationStatus'], string> = {
  draft: 'Entwurf',
  'member-visible': 'nur fuer Mitglieder sichtbar',
  'public-scheduled': 'oeffentliche Freigabe geplant',
  'public-visible': 'oeffentlich sichtbar',
  expired: 'abgelaufen',
};

const toggleValue = (values: string[], value: string) =>
  values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];

const formatPrice = (value: number) => currency.format(value / 100);

const formatTimestamp = (value?: string) => (value ? dateTime.format(new Date(value)) : 'offen');

export function App() {
  const [signupState, setSignupState] = useState(initialSignupState);

  const memberDeals = sampleDeals.filter(
    (deal) => deal.publicationStatus === 'member-visible' || deal.publicationStatus === 'public-scheduled',
  );

  const publicArchiveDeals = sampleDeals.filter((deal) => deal.publicationStatus === 'public-visible');

  return (
    <main className="shell">
      <section className="hero panel">
        <div className="hero-copy">
          <p className="eyebrow">Mitglieder zuerst. Oeffentlich 24 Stunden spaeter.</p>
          <h1>Rauchbar trennt Live-Deals fuer Mitglieder sauber vom oeffentlichen Archiv.</h1>
          <p className="lede">
            Die Site liest den gemeinsamen Deal-Vertrag direkt aus `@rauchbar/deals-core` und zeigt nur Deals im
            Status `public-visible` auf der offenen Flaeche. Frische Freigaben bleiben innerhalb des Mitgliederfensters.
          </p>
          <div className="hero-actions">
            <a href="#signup" className="button button-primary">
              Mitglied werden
            </a>
            <a href="#publishing-flow" className="button button-secondary">
              Publishing-Flow ansehen
            </a>
          </div>
        </div>
        <div className="hero-card">
          <span className="hero-card-label">Visibility Contract</span>
          <ol className="contract-list">
            <li>`member-visible`: intern oder im Mitgliederbereich sichtbar</li>
            <li>`public-scheduled`: Oeffnung ist fixiert, aber noch nicht im Archiv</li>
            <li>`public-visible`: Deal darf auf die Homepage und ins Archiv</li>
          </ol>
        </div>
      </section>

      <section className="metrics">
        <article className="metric panel">
          <strong>24h</strong>
          <span>Mitgliederfenster vor jeder oeffentlichen Freigabe</span>
        </article>
        <article className="metric panel">
          <strong>3</strong>
          <span>Deal-Zustaende mit direkter Relevanz fuer die Site</span>
        </article>
        <article className="metric panel">
          <strong>1</strong>
          <span>Gemeinsame Vertragsquelle fuer Site, Worker, Admin und Notifications</span>
        </article>
      </section>

      <section id="signup" className="content-grid">
        <article className="panel">
          <SectionHeading
            eyebrow="Signup + Preferences"
            title="Anmeldung und Praeferenzen in einem Schritt"
            text="Die Praeferenzstrecke legt die Basis fuer Wochen-Digest und Hot-Deal-Alerts, ohne eine zweite Onboarding-Seite zu brauchen."
          />
          <form className="signup-form">
            <label>
              <span>E-Mail</span>
              <input
                type="email"
                placeholder="aficionado@rauchbar.de"
                value={signupState.email}
                onChange={(event) => setSignupState((current) => ({ ...current, email: event.target.value }))}
              />
            </label>

            <div>
              <span className="field-label">Formate</span>
              <div className="chip-row">
                {preferenceOptions.formats.map((format) => (
                  <button
                    key={format}
                    type="button"
                    className={signupState.formats.includes(format) ? 'chip chip-active' : 'chip'}
                    onClick={() =>
                      setSignupState((current) => ({ ...current, formats: toggleValue(current.formats, format) }))
                    }
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="field-label">Marken</span>
              <div className="chip-row">
                {preferenceOptions.brands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    className={signupState.brands.includes(brand) ? 'chip chip-active' : 'chip'}
                    onClick={() =>
                      setSignupState((current) => ({ ...current, brands: toggleValue(current.brands, brand) }))
                    }
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            <label>
              <span>Preisfenster</span>
              <select
                value={signupState.priceBand}
                onChange={(event) => setSignupState((current) => ({ ...current, priceBand: event.target.value }))}
              >
                {preferenceOptions.priceBands.map((priceBand) => (
                  <option key={priceBand} value={priceBand}>
                    {priceBand}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="field-label">Alerts</span>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={signupState.notifications.digestEnabled}
                  onChange={(event) =>
                    setSignupState((current) => ({
                      ...current,
                      notifications: { ...current.notifications, digestEnabled: event.target.checked },
                    }))
                  }
                />
                <span>Wochen-Digest per E-Mail</span>
              </label>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={signupState.notifications.hotDealEmailEnabled}
                  onChange={(event) =>
                    setSignupState((current) => ({
                      ...current,
                      notifications: { ...current.notifications, hotDealEmailEnabled: event.target.checked },
                    }))
                  }
                />
                <span>Hot Deals per E-Mail</span>
              </label>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={signupState.notifications.hotDealWhatsappEnabled}
                  onChange={(event) =>
                    setSignupState((current) => ({
                      ...current,
                      notifications: { ...current.notifications, hotDealWhatsappEnabled: event.target.checked },
                    }))
                  }
                />
                <span>Hot Deals per WhatsApp</span>
              </label>
            </div>
          </form>
        </article>

        <aside className="panel summary-card">
          <SectionHeading
            eyebrow="Payload Preview"
            title="Was der Site-Flow an Backend oder Shared Packages uebergibt"
            text="Die UI bleibt leicht, aber die Nutzerdaten tragen bereits die Routing-Information fuer Digest und Hot-Deal-Kanaele."
          />
          <pre>{JSON.stringify(signupState, null, 2)}</pre>
        </aside>
      </section>

      <section id="publishing-flow" className="panel">
        <SectionHeading
          eyebrow="Members-First Publishing"
          title="Site-Verhalten entlang des Publication-Status"
          text="Die offene Homepage bekommt nur `public-visible`. Der Mitgliederbereich darf `member-visible` und `public-scheduled` sehen, solange das Zeitfenster aktiv ist."
        />
        <div className="flow-grid">
          <article className="flow-step">
            <span>01</span>
            <h3>Review + Freigabe</h3>
            <p>Worker und Admin landen auf `approved`. Die Site zeigt noch nichts, solange der Deal `draft` bleibt.</p>
          </article>
          <article className="flow-step">
            <span>02</span>
            <h3>Mitgliederfenster</h3>
            <p>`member-visible` und `public-scheduled` werden im geschlossenen Bereich ausgespielt und koennen Alerts triggern.</p>
          </article>
          <article className="flow-step">
            <span>03</span>
            <h3>Archiv-Freigabe</h3>
            <p>Erst `public-visible` oeffnet Homepage und Archiv. Die 24h-Verzoegerung kommt aus den Visibility-Timestamps.</p>
          </article>
        </div>
      </section>

      <section className="deals-grid">
        <article className="panel">
          <SectionHeading
            eyebrow="Mitgliederflaeche"
            title="Frische Deals vor der oeffentlichen Freigabe"
            text="Diese Liste zeigt bewusst auch `public-scheduled`, weil die Deal-Oeffnung bereits geplant ist, aber noch nicht auf der offenen Site auftauchen darf."
          />
          <div className="deal-stack">
            {memberDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} audience="members" />
            ))}
          </div>
        </article>
        <article className="panel">
          <SectionHeading
            eyebrow="Oeffentliches Archiv"
            title="Nur bereits freigegebene Deals"
            text="Das Archiv bleibt frei von laufenden Mitgliederfenstern. `public-scheduled` fehlt hier absichtlich bis `publicPublishedAt` gesetzt ist."
          />
          <div className="deal-stack">
            {publicArchiveDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} audience="public" />
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function SectionHeading(props: { eyebrow: string; title: string; text: string }) {
  return (
    <header className="section-heading">
      <p className="eyebrow">{props.eyebrow}</p>
      <h2>{props.title}</h2>
      <p>{props.text}</p>
    </header>
  );
}

function DealCard(props: { deal: Deal; audience: 'members' | 'public' }) {
  const { deal, audience } = props;

  return (
    <article className="deal-card">
      <div className="deal-header">
        <div>
          <p className="deal-kicker">{deal.brand ?? 'Unbekannte Marke'}</p>
          <h3>{deal.title}</h3>
        </div>
        <span className={audience === 'members' ? 'badge badge-members' : 'badge badge-public'}>
          {publicationLabels[deal.publicationStatus]}
        </span>
      </div>
      <p className="deal-price">
        {formatPrice(deal.currentPriceCents)}
        <span>{formatPrice(deal.previousPriceCents ?? deal.currentPriceCents)}</span>
      </p>
      <dl className="deal-meta">
        <div>
          <dt>Member Publish</dt>
          <dd>{formatTimestamp(deal.visibility.memberPublishedAt)}</dd>
        </div>
        <div>
          <dt>Public Schedule</dt>
          <dd>{formatTimestamp(deal.visibility.publicScheduledAt)}</dd>
        </div>
        <div>
          <dt>Public Publish</dt>
          <dd>{formatTimestamp(deal.visibility.publicPublishedAt)}</dd>
        </div>
      </dl>
      <p className="deal-footnote">
        Kanaele: {deal.channels.join(', ')}. Source of truth bleibt `publicationStatus` plus `visibility`.
      </p>
    </article>
  );
}

document.documentElement.style.setProperty('--font-display', brandTokens.fontDisplay);
document.documentElement.style.setProperty('--font-body', brandTokens.fontBody);
