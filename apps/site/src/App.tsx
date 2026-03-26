import { useMemo, useState } from 'react';
import { brandTokens } from '@rauchbar/design-system';
import {
  initialSignupDraft,
  preferenceOptions,
  sampleDeals,
  type SignupDraft,
  type SiteDeal,
  type SiteNotificationPreference,
} from './mockData';

type SignupStepId = 'email' | 'preferences' | 'channels' | 'complete';

type SignupStep = {
  id: SignupStepId;
  label: string;
  description: string;
};

const signupSteps: SignupStep[] = [
  {
    id: 'email',
    label: 'E-Mail',
    description: 'Adresse und Zustimmung erfassen',
  },
  {
    id: 'preferences',
    label: 'Praeferenzen',
    description: 'Marken, Formate, Shops und Preisrahmen',
  },
  {
    id: 'channels',
    label: 'Alerts',
    description: 'Sensitivitaet und Versandkanaele',
  },
  {
    id: 'complete',
    label: 'Fertig',
    description: 'Erwartungen und Zusammenfassung',
  },
];

type SignupErrors = {
  email?: string;
  consentAccepted?: string;
};

const currency = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

const dateTime = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const publicationLabels: Record<SiteDeal['publicationStatus'], string> = {
  'member-visible': 'nur fuer Mitglieder sichtbar',
  'public-scheduled': 'oeffentliche Freigabe geplant',
  'public-visible': 'oeffentlich sichtbar',
};

const toggleValue = (values: string[], value: string) =>
  values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];

const formatPrice = (value: number) => currency.format(value / 100);

const formatTimestamp = (value?: string) => (value ? dateTime.format(new Date(value)) : 'offen');

const getStepIndex = (step: SignupStepId) => signupSteps.findIndex((entry) => entry.id === step);

const nextStep = (step: SignupStepId): SignupStepId =>
  signupSteps[Math.min(getStepIndex(step) + 1, signupSteps.length - 1)]!.id;

const previousStep = (step: SignupStepId): SignupStepId =>
  signupSteps[Math.max(getStepIndex(step) - 1, 0)]!.id;

const buildSignupPayload = (draft: SignupDraft) => ({
  email: draft.email,
  consentAccepted: draft.consentAccepted,
  preferences: {
    favoriteBrands: draft.brands,
    favoriteFormats: draft.formats,
    preferredShops: draft.preferredShops,
    excludedShops: draft.excludedShops,
    priceBand: draft.priceBand,
    alertSensitivity: draft.alertSensitivity,
  },
  notifications: {
    digestEnabled: true,
    hotDealEmailEnabled: draft.notifications.hotDealEmailEnabled,
    hotDealWhatsappEnabled: draft.notifications.hotDealWhatsappEnabled,
  },
});

export function App() {
  const [signupState, setSignupState] = useState<SignupDraft>(initialSignupDraft);
  const [currentStep, setCurrentStep] = useState<SignupStepId>('email');
  const [signupErrors, setSignupErrors] = useState<SignupErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const memberDeals = sampleDeals.filter(
    (deal) => deal.publicationStatus === 'member-visible' || deal.publicationStatus === 'public-scheduled',
  );

  const publicArchiveDeals = sampleDeals.filter((deal) => deal.publicationStatus === 'public-visible');
  const delayedArchiveStates = [
    {
      title: 'Nur fuer Mitglieder',
      badgeClass: 'badge badge-members',
      badgeLabel: 'member_visible',
      description:
        'Freigegeben, aber oeffentlich noch unsichtbar. Die Homepage kommuniziert hier nur den Vorsprung, nicht die volle Dealkarte.',
    },
    {
      title: 'Oeffentlich geplant',
      badgeClass: 'badge badge-pending',
      badgeLabel: 'public_scheduled',
      description:
        'Mitglieder sehen den Deal bereits. Die oeffentliche Karte darf erst nach Ablauf des 24h-Fensters erscheinen.',
    },
    {
      title: 'Im verzoegerten Archiv',
      badgeClass: 'badge badge-public',
      badgeLabel: 'public_visible',
      description:
        'Jetzt wird der gleiche Deal oeffentlich dokumentiert, inklusive Preis, Shop und verzoegertem Freigabezeitpunkt.',
    },
  ];

  const signupPayload = useMemo(() => buildSignupPayload(signupState), [signupState]);
  const currentStepIndex = getStepIndex(currentStep);

  const validateEmailStep = () => {
    const nextErrors: SignupErrors = {};

    if (!signupState.email.trim()) {
      nextErrors.email = 'Bitte hinterlege eine E-Mail fuer Digest und Einstellungen.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupState.email)) {
      nextErrors.email = 'Bitte gib eine gueltige E-Mail-Adresse ein.';
    }

    if (!signupState.consentAccepted) {
      nextErrors.consentAccepted = 'Fuer den MVP brauchen wir die Zustimmung zum Versand des Wochen-Digests.';
    }

    setSignupErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (currentStep === 'email' && !validateEmailStep()) {
      return;
    }

    if (currentStep === 'channels') {
      setCurrentStep('complete');
      setIsSubmitted(true);
      return;
    }

    setCurrentStep(nextStep(currentStep));
  };

  const handleBack = () => {
    if (currentStep === 'email') {
      return;
    }

    setCurrentStep(previousStep(currentStep));
  };

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
          <strong>4 Schritte</strong>
          <span>E-Mail, Praeferenzen, Alerts und Abschluss im MVP-Flow</span>
        </article>
        <article className="metric panel">
          <strong>1 Digest</strong>
          <span>E-Mail-Digest ist der verpflichtende Kernkanal, Hot-Deals bleiben optional</span>
        </article>
      </section>

      <section className="panel archive-explainer">
        <div className="section-heading">
          <p className="eyebrow">Delayed Archive States</p>
          <h2>Die Homepage zeigt nur den verzoegerten Ausschnitt des Dealstroms.</h2>
          <p>
            Mitglieder sehen neue Freigaben zuerst. Die oeffentliche Homepage dokumentiert denselben Deal erst nach dem
            Vorsprung und macht die Zustandswechsel explizit lesbar.
          </p>
        </div>
        <div className="archive-state-grid">
          {delayedArchiveStates.map((state) => (
            <article key={state.title} className="archive-state-card">
              <span className={state.badgeClass}>{state.badgeLabel}</span>
              <h3>{state.title}</h3>
              <p>{state.description}</p>
            </article>
          ))}
        </div>
        <div className="timeline-banner">
          <strong>Mitglieder jetzt</strong>
          <span>24h Vorsprung</span>
          <span>Oeffentliches Archiv spaeter</span>
        </div>
      </section>

      <section id="signup" className="content-grid">
        <article className="panel">
          <SectionHeading
            eyebrow="MVP Signup"
            title="E-Mail und Deal-Praeferenzen in einem klaren Onboarding-Fluss"
            text="Der MVP startet mit Pflichtfeldern fuer E-Mail und Digest-Zustimmung. Alles andere bleibt leicht editierbar und weitgehend skippable."
          />

          <div className="signup-progress" aria-label="Signup-Fortschritt">
            {signupSteps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isReached = index <= currentStepIndex;
              return (
                <div key={step.id} className={isReached ? 'progress-step progress-step-active' : 'progress-step'}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{step.label}</strong>
                    <small>{step.description}</small>
                  </div>
                </div>
              );
            })}
          </div>

          <form className="signup-form" onSubmit={(event) => event.preventDefault()}>
            {currentStep === 'email' && (
              <div className="signup-stage">
                <label>
                  <span>E-Mail</span>
                  <input
                    type="email"
                    placeholder="aficionado@rauchbar.de"
                    value={signupState.email}
                    onChange={(event) => {
                      const email = event.target.value;
                      setSignupState((current) => ({ ...current, email }));
                      setSignupErrors((current) => ({ ...current, email: undefined }));
                    }}
                  />
                  {signupErrors.email ? <small className="field-error">{signupErrors.email}</small> : null}
                </label>

                <label className="consent-row">
                  <input
                    type="checkbox"
                    checked={signupState.consentAccepted}
                    onChange={(event) => {
                      const consentAccepted = event.target.checked;
                      setSignupState((current) => ({ ...current, consentAccepted }));
                      setSignupErrors((current) => ({ ...current, consentAccepted: undefined }));
                    }}
                  />
                  <span>
                    Ich moechte den Wochen-Digest per E-Mail erhalten und verstehe, dass ich die Einstellungen spaeter
                    im Mitgliederbereich anpassen kann.
                  </span>
                </label>
                {signupErrors.consentAccepted ? (
                  <small className="field-error">{signupErrors.consentAccepted}</small>
                ) : null}

                <div className="info-callout">
                  <strong>Pflicht im MVP</strong>
                  <p>
                    E-Mail plus Zustimmung sind die Mindestdaten fuer den kuratierten Wochen-Digest. Hot-Deal-Kanaele
                    bleiben optional.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 'preferences' && (
              <div className="signup-stage">
                <div>
                  <span className="field-label">Lieblingsmarken</span>
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

                <div>
                  <span className="field-label">Bevorzugte Formate</span>
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

                <div className="dual-choice-grid">
                  <div>
                    <span className="field-label">Bevorzugte Shops</span>
                    <div className="chip-row">
                      {preferenceOptions.shops.map((shop) => (
                        <button
                          key={shop}
                          type="button"
                          className={signupState.preferredShops.includes(shop) ? 'chip chip-active' : 'chip'}
                          onClick={() =>
                            setSignupState((current) => ({
                              ...current,
                              preferredShops: toggleValue(current.preferredShops, shop),
                              excludedShops: current.excludedShops.filter((entry) => entry !== shop),
                            }))
                          }
                        >
                          {shop}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="field-label">Shops ausblenden</span>
                    <div className="chip-row">
                      {preferenceOptions.shops.map((shop) => (
                        <button
                          key={`exclude-${shop}`}
                          type="button"
                          className={signupState.excludedShops.includes(shop) ? 'chip chip-active' : 'chip'}
                          onClick={() =>
                            setSignupState((current) => ({
                              ...current,
                              excludedShops: toggleValue(current.excludedShops, shop),
                              preferredShops: current.preferredShops.filter((entry) => entry !== shop),
                            }))
                          }
                        >
                          {shop}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <label>
                  <span>Preisrahmen</span>
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

                <small className="field-hint">Diese Angaben sind skippable und koennen spaeter inline geaendert werden.</small>
              </div>
            )}

            {currentStep === 'channels' && (
              <div className="signup-stage">
                <div className="sensitivity-list">
                  {preferenceOptions.sensitivities.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={
                        signupState.alertSensitivity === option.value
                          ? 'sensitivity-card sensitivity-card-active'
                          : 'sensitivity-card'
                      }
                      onClick={() => setSignupState((current) => ({ ...current, alertSensitivity: option.value }))}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.description}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <span className="field-label">Kanaele</span>
                  <label className="toggle-row toggle-row-locked">
                    <input type="checkbox" checked readOnly />
                    <span>Wochen-Digest per E-Mail ist fuer den MVP immer aktiv.</span>
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
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="signup-stage completion-stage">
                <div className="info-callout info-callout-success">
                  <strong>Onboarding abgeschlossen</strong>
                  <p>
                    Dein Wochen-Digest ist vorbereitet. Hot-Deal-Alerts werden gemaess deinen Kanal- und Sensitivitaetsregeln ausgeloest.
                  </p>
                </div>

                <div className="completion-grid">
                  <div>
                    <span className="field-label">Was als Naechstes passiert</span>
                    <ul className="summary-list">
                      <li>Die erste Digest-Ausspielung folgt im naechsten geplanten Wochenfenster.</li>
                      <li>Hot-Deal-Alerts laufen nur fuer aktivierte Kanaele.</li>
                      <li>Praeferenzen bleiben spaeter im Mitgliederbereich leicht editierbar.</li>
                    </ul>
                  </div>
                  <div>
                    <span className="field-label">Erfasster MVP-Payload</span>
                    <pre>{JSON.stringify(signupPayload, null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}

            <div className="signup-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={handleBack}
                disabled={currentStep === 'email'}
              >
                Zurueck
              </button>
              {currentStep !== 'complete' ? (
                <button type="button" className="button button-primary" onClick={handleContinue}>
                  {currentStep === 'channels' ? 'Signup abschliessen' : 'Weiter'}
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => {
                    setSignupState(initialSignupDraft);
                    setSignupErrors({});
                    setCurrentStep('email');
                    setIsSubmitted(false);
                  }}
                >
                  Flow neu starten
                </button>
              )}
            </div>
          </form>
        </article>

        <aside className="panel summary-card">
          <SectionHeading
            eyebrow={isSubmitted ? 'Completion Summary' : 'Payload Preview'}
            title={isSubmitted ? 'Gespeicherter MVP-Scope fuer Digest und Alerts' : 'Was der Signup-Flow aktuell erfassen wuerde'}
            text="Die Zusammenfassung bleibt absichtlich nah am Produktvertrag: E-Mail, Consent, Deal-Praeferenzen und Kanalsteuerung."
          />
          <pre>{JSON.stringify(signupPayload, null, 2)}</pre>
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
            <p>Worker und Admin landen auf `approved`. Die Site zeigt noch nichts, solange der Deal intern bleibt.</p>
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
            eyebrow="Mitglieder zuerst"
            title="Was im Mitgliederfenster sichtbar ist, bevor die Homepage reagieren darf"
            text="`member-visible` und `public-scheduled` gehoeren zum members-first Strom. Sie bleiben ausserhalb des oeffentlichen Archivs, bis die Verzoegerung abgelaufen ist."
          />
          <div className="deal-stack">
            {memberDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} audience="members" />
            ))}
          </div>
        </article>
        <article className="panel">
          <SectionHeading
            eyebrow="Verzoegertes Archiv"
            title="Nur bereits freigegebene Deals erscheinen oeffentlich"
            text="Das Archiv bleibt frei von laufenden Mitgliederfenstern. Erst `public-visible` oeffnet die volle Karte fuer nicht eingeloggte Besucher."
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

function DealCard(props: { deal: SiteDeal; audience: 'members' | 'public' }) {
  const { deal, audience } = props;
  const currentPrice = deal.observation.currentPrice.amountCents;
  const previousPrice = deal.observation.previousPrice?.amountCents;

  return (
    <article className="deal-card">
      <div className="deal-header">
        <div>
          <p className="deal-kicker">{deal.product.brand}</p>
          <h3>{deal.title}</h3>
        </div>
        <span className={audience === 'members' ? 'badge badge-members' : 'badge badge-public'}>
          {publicationLabels[deal.publicationStatus]}
        </span>
      </div>
      <p className="deal-price">
        {formatPrice(currentPrice)}
        <span>{formatPrice(previousPrice ?? currentPrice)}</span>
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
        Kanaele: {deal.publication.channels.join(', ')}. Mitgliederfenster bis {formatTimestamp(deal.visibility.membersOnlyUntil)}.
      </p>
    </article>
  );
}

document.documentElement.style.setProperty('--font-display', brandTokens.fontDisplay);
document.documentElement.style.setProperty('--font-body', brandTokens.fontBody);
