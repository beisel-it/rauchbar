import { useEffect, useMemo, useState } from 'react';
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

const getPathname = () => {
  if (typeof window === 'undefined') {
    return '/';
  }

  return window.location.pathname || '/';
};

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
  const pathname = getPathname();

  if (pathname === '/' || pathname === '/notify') {
    return <NotifyPage />;
  }

  if (pathname === '/signup') {
    return <HomePage initialSection="signup" />;
  }

  if (pathname === '/home') {
    return <HomePage />;
  }

  return <NotifyPage />;
}

function HomePage(props: { initialSection?: 'signup' }) {
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

  useEffect(() => {
    if (props.initialSection !== 'signup') {
      return;
    }

    const target = document.getElementById('signup');
    target?.scrollIntoView({ block: 'start' });
  }, [props.initialSection]);

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
          <p className="eyebrow">Zigarren-Deals fuer deutsche Shops</p>
          <h1>Gute Angebote frueher sehen, statt sie zwischen Shop-Newslettern zu verpassen.</h1>
          <p className="lede">
            Rauchbar beobachtet deutsche Shops, kuratiert relevante Zigarren-Deals und gibt Mitgliedern 24 Stunden
            Vorsprung vor dem oeffentlichen Archiv. Wochen-Digest ist Standard, Hot-Deal-Alerts bleiben optional.
          </p>
          <div className="hero-actions">
            <a href="/signup" className="button button-primary">
              Mitglied werden
            </a>
            <a href="#archive-preview" className="button button-secondary">
              Verzoegerte Deals ansehen
            </a>
          </div>
        </div>
        <div className="hero-card">
          <span className="hero-card-label">Mitgliederwert</span>
          <ol className="contract-list">
            <li>deutsche Shop-Deals an einem Ort statt verteiltem Monitoring</li>
            <li>frueherer Zugang vor der oeffentlichen Freigabe im Archiv</li>
            <li>relevante Hinweise nach Marken, Formaten und Preisrahmen</li>
          </ol>
        </div>
      </section>

      <section className="metrics">
        <article className="metric panel">
          <strong>9 Shops</strong>
          <span>deutsche Haendler im MVP-Fokus fuer kuratierte Deal-Signale</span>
        </article>
        <article className="metric panel">
          <strong>taeglich</strong>
          <span>Monitoring statt manueller Preisjagd durch mehrere Webshops</span>
        </article>
        <article className="metric panel">
          <strong>24h Vorsprung</strong>
          <span>Mitglieder sehen frische Freigaben vor dem oeffentlichen Archiv</span>
        </article>
      </section>

      <section id="publishing-flow" className="panel archive-explainer">
        <div className="section-heading">
          <p className="eyebrow">So funktioniert's</p>
          <h2>Mitglied werden, Relevanz festlegen, bessere Deals frueher bekommen.</h2>
          <p>
            Rauchbar bleibt fuer den MVP bewusst schlank: E-Mail rein, Praeferenzen setzen, Digest aktivieren und nur
            bei Bedarf Hot-Deal-Alerts zuschalten.
          </p>
        </div>
        <div className="archive-state-grid">
          <article className="archive-state-card">
            <span className="badge badge-members">1. Mitglied werden</span>
            <h3>Mit E-Mail starten</h3>
            <p>Der Einstieg bleibt leicht: Wochen-Digest aktivieren und den Zugang zum Mitgliederfenster sichern.</p>
          </article>
          <article className="archive-state-card">
            <span className="badge badge-pending">2. Relevanz steuern</span>
            <h3>Marken, Formate und Shops angeben</h3>
            <p>So landen nur die Deals im Fokus, die zu deinem Geschmack und Preisrahmen passen.</p>
          </article>
          <article className="archive-state-card">
            <span className="badge badge-public">3. Frueher informiert sein</span>
            <h3>Digest standard, Alerts optional</h3>
            <p>Mitglieder sehen passende Angebote frueher, waehrend das oeffentliche Archiv zeitversetzt bleibt.</p>
          </article>
        </div>
        <div className="timeline-banner">
          <strong>Mitglieder zuerst</strong>
          <span>personalisierte Relevanz</span>
          <span>oeffentliche Deals spaeter</span>
        </div>
      </section>

      <section id="signup" className="content-grid">
        <article className="panel">
          <SectionHeading
            eyebrow="Praeferenzen ohne Reibung"
            title="Der Einstieg sammelt nur das, was fuer bessere Empfehlungen wirklich hilft"
            text="Digest-Zustimmung ist Pflicht, alles andere bleibt leicht, skippable und spaeter aenderbar. So bleibt der erste Schritt kurz, aber der Nutzen direkt sichtbar."
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
                    <span className="field-label">Dein Mitglieds-Setup</span>
                    <SignupPreview draft={signupState} />
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
            eyebrow={isSubmitted ? 'Mitglieds-Setup' : 'Was du steuern kannst'}
            title={isSubmitted ? 'Gespeicherter MVP-Scope fuer Digest und Alerts' : 'Rauchbar passt sich an deine Deal-Vorlieben an'}
            text="Statt technischer Rohdaten zeigt die Homepage jetzt den echten Mehrwert: welche Marken, Shops, Preiszonen und Kanaele das Erlebnis fuer dich filtern."
          />
          <SignupPreview draft={signupState} />
        </aside>
      </section>

      <section className="panel">
        <SectionHeading
          eyebrow="Digest und Alerts"
          title="Der Digest ist gesetzt. Hot-Deals kommen nur, wenn sie fuer dich relevant sind."
          text="Wochen-Digest bleibt der verlässliche Kern. Hot-Deal-Alerts per E-Mail oder WhatsApp springen nur bei stark passenden Treffern an."
        />
        <div className="flow-grid">
          <article className="flow-step">
            <span>01</span>
            <h3>Digest jede Woche</h3>
            <p>Ein kuratierter Rueckblick auf die besten Treffer statt unzaehliger einzelner Shop-Mails.</p>
          </article>
          <article className="flow-step">
            <span>02</span>
            <h3>Alerts nur bei Bedarf</h3>
            <p>Aktiviere Hot-Deal-E-Mail oder WhatsApp nur dann, wenn du schnelle Treffer wirklich willst.</p>
          </article>
          <article className="flow-step">
            <span>03</span>
            <h3>Weniger Rauschen</h3>
            <p>Marken, Formate, Shops und Preisrahmen halten den Signalwert hoch und die Inbox sauber.</p>
          </article>
        </div>
      </section>

      <section id="archive-preview" className="deals-grid">
        <article className="panel">
          <SectionHeading
            eyebrow="Mitglieder zuerst"
            title="Mitglieder sehen diese Angebote, bevor sie im offenen Archiv auftauchen"
            text="Das Mitgliederfenster schafft echten Vorsprung. Neue Treffer erscheinen zuerst dort und wandern erst spaeter in die oeffentliche Ansicht."
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
            title="Diese Deals sind jetzt oeffentlich, Mitglieder sahen sie frueher"
            text="Das offene Archiv dokumentiert freigegebene Treffer mit Verzoegerung. So bleibt die oeffentliche Flaeche klar, waehrend Mitglieder frueher reagieren koennen."
          />
          <div className="deal-stack">
            {publicArchiveDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} audience="public" />
            ))}
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <SectionHeading
            eyebrow="FAQ"
            title="Was Besucher vor dem Start wissen wollen"
            text="Die wichtigsten Fragen zum MVP sind direkt auf der Homepage beantwortet, damit der Einstieg nicht an Unsicherheit scheitert."
          />
          <ul className="summary-list">
            <li>Mitglieder sehen neue Deals 24 Stunden vor dem oeffentlichen Archiv.</li>
            <li>WhatsApp ist optional. Der Wochen-Digest per E-Mail bleibt der Standard.</li>
            <li>Praeferenzen fuer Marken, Formate, Preisrahmen und Shops lassen sich spaeter anpassen.</li>
            <li>Nicht jeder Deal wird sofort oeffentlich sichtbar, weil das Archiv bewusst verzoegert ist.</li>
          </ul>
        </article>
        <aside className="panel panel-contrast">
          <SectionHeading
            eyebrow="Mitglied werden"
            title="Weniger suchen. Mehr passende Zigarren-Deals rechtzeitig sehen."
            text="Wenn du deutsche Shop-Deals nicht mehr manuell verfolgen willst, ist Rauchbar der leichteste Start in kuratierten Deal-Zugang mit Mitglieder-Vorsprung."
          />
          <a href="/signup" className="button button-primary">
            Jetzt Mitglied werden
          </a>
        </aside>
      </section>
    </main>
  );
}

<<<<<<< HEAD
=======
function NotifyPage() {
  const [email, setEmail] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <main className="shell notify-shell">
      <section className="notify-hero panel">
        <div className="notify-copy">
          <p className="eyebrow">Notify / Keep Me Informed</p>
          <h1>Rauchbar oeffnet den fruehen Zugang in kleinen Schritten.</h1>
          <p className="lede">
            Die vollstaendige Homepage und der Signup-Flow werden gerade auf MVP-Niveau zusammengezogen. Bis dahin
            kannst du hier dein Interesse vormerken und wir melden uns, sobald die ersten Mitgliederplaetze oeffnen.
          </p>
          <div className="notify-pills">
            <span className="badge badge-public">woechentlicher Digest</span>
            <span className="badge badge-members">Mitglieder zuerst</span>
            <span className="badge badge-pending">Hot-Deal Alerts folgen</span>
          </div>
          <form
            className="notify-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (email.trim()) {
                setIsConfirmed(true);
              }
            }}
          >
            <label>
              <span>E-Mail fuer die Warteliste</span>
              <input
                type="email"
                placeholder="aficionado@rauchbar.de"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setIsConfirmed(false);
                }}
              />
            </label>
            <button type="submit" className="button button-primary">
              Keep me informed
            </button>
          </form>
          <div className={isConfirmed ? 'info-callout info-callout-success' : 'info-callout'}>
            <strong>{isConfirmed ? 'Vorgemerkt fuer den MVP-Start' : 'Temporarer Einstieg fuer den Soft Launch'}</strong>
            <p>
              {isConfirmed
                ? 'Deine Adresse ist lokal vorgemerkt. Der produktive Mitglieder- und Signup-Start folgt mit dem naechsten Site-Update.'
                : 'Diese Zwischenstation ersetzt noch nicht den finalen Signup. Sie gibt uns aber einen klaren Einstiegspunkt fuer Pre-Launch-Traffic.'}
            </p>
          </div>
        </div>

        <aside className="notify-side panel panel-contrast">
          <p className="hero-card-label">Was als Naechstes kommt</p>
          <ol className="contract-list">
            <li>oeffentliche Produktseite mit klarem Mitgliedervorteil</li>
            <li>leichtes Signup fuer E-Mail, Praeferenzen und Alert-Kanaele</li>
            <li>verzoegertes Archiv fuer `public-visible` Deals</li>
          </ol>
          <div className="notify-links">
            <a href="/home" className="button button-secondary">
              aktuelle Startseite ansehen
            </a>
            <a href="/signup" className="button button-secondary">
              Signup-Scope ansehen
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}

>>>>>>> 600261d (Route default traffic to notify page)
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

function SignupPreview(props: { draft: SignupDraft }) {
  const { draft } = props;

  return (
    <div className="signup-preview">
      <div className="info-callout">
        <strong>Lieblingsmarken und Formate</strong>
        <p>{[...draft.brands, ...draft.formats].join(' · ')}</p>
      </div>
      <div className="info-callout">
        <strong>Preisrahmen und Shops</strong>
        <p>{`${draft.priceBand} · ${draft.preferredShops.join(', ') || 'Shops folgen spaeter'}`}</p>
      </div>
      <div className="info-callout">
        <strong>Kanaele</strong>
        <p>
          Wochen-Digest aktiv
          {draft.notifications.hotDealEmailEnabled ? ' · Hot-Deals per E-Mail' : ''}
          {draft.notifications.hotDealWhatsappEnabled ? ' · Hot-Deals per WhatsApp' : ''}
        </p>
      </div>
    </div>
  );
}

document.documentElement.style.setProperty('--font-display', brandTokens.fontDisplay);
document.documentElement.style.setProperty('--font-body', brandTokens.fontBody);
