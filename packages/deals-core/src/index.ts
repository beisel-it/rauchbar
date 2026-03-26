export type ISODateString = string;
export type CurrencyCode = 'EUR';
export type CountryCode = 'DE' | 'AT' | 'CH';

export const dealChannels = ['digest', 'email-hot-deal', 'whatsapp-hot-deal', 'public-site'] as const;
export type DealChannel = (typeof dealChannels)[number];

export type DealVisibility = 'members-only' | 'public';
export type PublicationStatus = 'draft' | 'approved' | 'scheduled' | 'published' | 'suppressed';

export const sourceAdapterKinds = ['html', 'rss', 'api', 'manual', 'xml'] as const;
export type SourceAdapterKind = (typeof sourceAdapterKinds)[number];

export const ingestRunStatuses = ['pending', 'running', 'succeeded', 'partial', 'failed'] as const;
export type IngestRunStatus = (typeof ingestRunStatuses)[number];

export const normalizationStatuses = ['raw', 'normalized', 'needs-review', 'rejected', 'discarded'] as const;
export type NormalizationStatus = (typeof normalizationStatuses)[number];

export const reviewStatuses = ['pending', 'approved', 'rejected'] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];

export const dealLifecycleStatuses = [
  'discovered',
  'normalized',
  'ready-for-review',
  'approved',
  'scheduled',
  'published-members',
  'published-public',
  'archived',
] as const;
export type DealLifecycleStatus = (typeof dealLifecycleStatuses)[number];

export const availabilityStatuses = ['in-stock', 'low-stock', 'out-of-stock', 'unknown'] as const;
export type AvailabilityStatus = (typeof availabilityStatuses)[number];

export const hotDealReasonCodes = [
  'price-drop',
  'new-low',
  'limited-product',
  'member-preference-match',
  'merchant-priority',
  'stock-drop',
  'digest-pick',
  'manual-curation',
] as const;
export type HotDealReasonCode = (typeof hotDealReasonCodes)[number];

export type NotificationChannel = 'email' | 'whatsapp';
export type AlertCadence = 'instant' | 'daily-digest' | 'weekly-digest';
export type PriceSensitivity = 'balanced' | 'deal-hunter' | 'rare-finds';
export type MemberAlertSensitivity = 'nur-grosse-treffer' | 'ausgewogen' | 'moeglichst-viel';
export type MemberLocale = 'de-DE';
export type MemberStatus = 'pending-confirmation' | 'active' | 'paused' | 'unsubscribed';
export type MemberDigestStatus = 'scheduled' | 'sent' | 'delayed' | 'failed';
export type MemberAlertChannelStatus = 'active' | 'muted' | 'pending_verification' | 'failed';
export type PreferenceCompleteness = 'minimal' | 'partial' | 'tuned';
export type ConsentKind = 'digest-email' | 'hot-deal-email' | 'hot-deal-whatsapp' | 'privacy-policy';

export type CigarOrigin =
  | 'cuba'
  | 'dominican-republic'
  | 'honduras'
  | 'nicaragua'
  | 'mixed'
  | 'unknown';

export type ProductFormat =
  | 'robusto'
  | 'corona'
  | 'churchill'
  | 'torpedo'
  | 'toro'
  | 'petit-coro'
  | 'figurado'
  | 'sampler'
  | 'other';

export type Money = {
  amountCents: number;
  currency: CurrencyCode;
};

export type MerchantId = string;
export type SourceId = string;
export type DealId = string;
export type IngestRunId = string;
export type SubscriberId = string;
export type DigestIssueId = string;
export type CatalogEntryId = string;

export type MerchantReference = {
  id: MerchantId;
  slug: string;
  displayName: string;
  countryCode: CountryCode;
  baseUrl: string;
  active: boolean;
};

export type SourceReference = {
  id: SourceId;
  merchantId: MerchantId;
  adapterKind: SourceAdapterKind;
  label: string;
  endpoint: string;
  active: boolean;
};

export type ProductIdentity = {
  brand: string;
  line?: string;
  productName: string;
  vitola?: string;
  originCountry?: string;
  quantity: number;
  limitedEdition: boolean;
};

export type ProductFingerprint = {
  brand: string;
  line?: string;
  vitola?: string;
  format?: ProductFormat;
  origin?: CigarOrigin;
  boxQuantity?: number;
  unitCount?: number;
};

export type ProductCatalogEntry = {
  id: CatalogEntryId;
  canonicalTitle: string;
  fingerprint: ProductFingerprint;
  tags: string[];
};

export type OfferObservation = {
  externalId?: string;
  title: string;
  listingUrl: string;
  imageUrl?: string;
  currentPrice: Money;
  previousPrice?: Money;
  availability: AvailabilityStatus;
  observedAt: ISODateString;
  discoveredAt: ISODateString;
};

export type SourceOffer = {
  id: string;
  merchantId: MerchantId;
  sourceRef: string;
  title: string;
  url: string;
  capturedAt: ISODateString;
  price: Money;
  previousPrice?: Money;
  availability: AvailabilityStatus;
  stockCount?: number;
  catalogHint?: Partial<ProductFingerprint>;
  rawAttributes: Record<string, string>;
};

export type SourceAdapterInput = {
  merchant: MerchantReference;
  source: SourceReference;
  requestedAt: ISODateString;
  fetchedAt: ISODateString;
  requestUrl: string;
  contentType?: string;
  payload: string;
};

export type SourceAdapterOutput = {
  merchant: MerchantReference;
  source: SourceReference;
  observedOffers: OfferObservation[];
  warnings: string[];
};

export type DealPublicationWindow = {
  memberVisibleAt?: ISODateString;
  publicVisibleAt?: ISODateString;
  membersVisibleUntil?: ISODateString;
  channels: DealChannel[];
};

export type NormalizedDealPayload = {
  id: DealId;
  merchant: MerchantReference;
  source: SourceReference;
  product: ProductIdentity;
  observation: OfferObservation;
  summary: string;
  normalizationStatus: NormalizationStatus;
  reviewStatus: ReviewStatus;
  lifecycleStatus: DealLifecycleStatus;
  tags: string[];
  publication: DealPublicationWindow;
};

export type NormalizationDecision = {
  status: Extract<NormalizationStatus, 'normalized' | 'needs-review' | 'rejected' | 'discarded'>;
  confidence: 'low' | 'medium' | 'high';
  reasons: string[];
};

export type NormalizedDealCandidate = {
  id: DealId;
  merchant: MerchantReference;
  source: SourceReference;
  catalogEntry: ProductCatalogEntry;
  sourceOffer: SourceOffer;
  currentPrice: Money;
  referencePrice?: Money;
  savingsAmount?: Money;
  savingsPercent?: number;
  score: number;
  triggers: HotDealReasonCode[];
  normalization: NormalizationDecision;
};

export type DealLifecycle = {
  discoveredAt: ISODateString;
  reviewedAt?: ISODateString;
  approvedAt?: ISODateString;
  publishedAt?: ISODateString;
  membersVisibleUntil?: ISODateString;
  publicVisibleFrom?: ISODateString;
};

export type DealReview = {
  reviewerId: string;
  status: ReviewStatus;
  note?: string;
  reviewedAt: ISODateString;
};

export type PublishedDeal = {
  id: DealId;
  slug: string;
  candidateId: DealId;
  title: string;
  merchantId: MerchantId;
  catalogEntryId: CatalogEntryId;
  url: string;
  currentPrice: Money;
  referencePrice?: Money;
  savingsAmount?: Money;
  savingsPercent?: number;
  score: number;
  channels: DealChannel[];
  visibility: DealVisibility;
  status: PublicationStatus;
  triggers: HotDealReasonCode[];
  lifecycle: DealLifecycle;
  review?: DealReview;
};

export type IngestRun = {
  id: IngestRunId;
  merchantId: MerchantId;
  sourceId: SourceId;
  startedAt: ISODateString;
  finishedAt?: ISODateString;
  status: IngestRunStatus;
  observedCount: number;
  normalizedCount: number;
  createdDeals: number;
  updatedDeals: number;
  warnings: string[];
  errors: string[];
};

export type HotDealReason = {
  code: HotDealReasonCode;
  weight: number;
  message: string;
};

export type HotDealEvaluationInput = {
  deal: NormalizedDealPayload | NormalizedDealCandidate | PublishedDeal;
  historicalLowPrice?: Money;
  typicalPrice?: Money;
  priceDropPercent?: number;
  merchantPriority?: number;
  matchedPreferenceTags: string[];
};

export type HotDealEvaluationResult = {
  isHotDeal: boolean;
  score: number;
  eligibleChannels: DealChannel[];
  reasons: HotDealReason[];
};

export type PreferenceWeight = 'avoid' | 'neutral' | 'prefer';

export type SubscriberDealPreferences = {
  subscriberId: SubscriberId;
  favoriteBrands: string[];
  favoriteVitolas: string[];
  excludedMerchants: MerchantId[];
  minDiscountPercent?: number;
  hotDealChannels: DealChannel[];
  digestEnabled: boolean;
};

export type NotificationPreference = {
  digestEnabled: boolean;
  hotDealEmailEnabled: boolean;
  hotDealWhatsappEnabled: boolean;
};

export type MemberSignupPreferences = {
  favoriteBrands: string[];
  favoriteFormats: string[];
  preferredShops: string[];
  excludedShops: string[];
  priceBand?: string;
  alertSensitivity: MemberAlertSensitivity;
};

export type MemberConsentRecord = {
  kind: ConsentKind;
  granted: boolean;
  grantedAt?: ISODateString;
  source: 'site-signup' | 'member-settings' | 'admin-import' | 'admin-update';
  evidenceRef?: string;
};

export type MemberSignupDraft = {
  email: string;
  consentAccepted: boolean;
  preferences: MemberSignupPreferences;
  notifications: NotificationPreference;
};

export type MemberSignupInput = {
  email: string;
  locale: MemberLocale;
  consents: MemberConsentRecord[];
  preferences: MemberSignupPreferences;
  notifications: NotificationPreference;
  submittedAt: ISODateString;
};

export type SubscriberPreferences = {
  subscriberId: SubscriberId;
  favoriteBrands: Array<{
    brand: string;
    weight: PreferenceWeight;
  }>;
  preferredFormats: Array<{
    format: ProductFormat;
    weight: PreferenceWeight;
  }>;
  preferredOrigins: Array<{
    origin: CigarOrigin;
    weight: PreferenceWeight;
  }>;
  maxPricePerCigarCents?: number;
  minSavingsPercent?: number;
  priceSensitivity: PriceSensitivity;
  mutedMerchantIds: MerchantId[];
};

export type SubscriberChannelPreference = {
  channel: NotificationChannel;
  enabled: boolean;
  cadence: AlertCadence;
  verified: boolean;
};

export type MemberChannelStatus = {
  channel: NotificationChannel;
  status: MemberAlertChannelStatus;
  verifiedAt?: ISODateString;
  lastDeliveredAt?: ISODateString;
  lastFailedAt?: ISODateString;
  failureReason?: string;
};

export type MemberAdminStatus = {
  memberStatus: MemberStatus;
  digestStatus: MemberDigestStatus;
  preferenceCompleteness: PreferenceCompleteness;
  alertChannels: MemberChannelStatus[];
  lastDigestSentAt?: ISODateString;
  lastHotDealSentAt?: ISODateString;
  adminNote?: string;
};

export type MemberProfile = {
  id: SubscriberId;
  email: string;
  locale: MemberLocale;
  status: MemberStatus;
  consents: MemberConsentRecord[];
  signup: {
    submittedAt: ISODateString;
    source: 'site-signup' | 'admin-import';
  };
  preferences: SubscriberPreferences;
  notifications: NotificationPreference;
  channels: SubscriberChannelPreference[];
  adminStatus: MemberAdminStatus;
  whatsappE164?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type Subscription = {
  id: string;
  email: string;
  whatsappE164?: string;
  locale: MemberLocale;
  status: MemberStatus;
  preferences: SubscriberPreferences;
  notifications: NotificationPreference;
  channels: SubscriberChannelPreference[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type HotDealRule = {
  id: string;
  name: string;
  enabled: boolean;
  channels: NotificationChannel[];
  minScore: number;
  minSavingsPercent?: number;
  maxPriceCents?: number;
  requiredTriggers?: HotDealReasonCode[];
  includeMerchantIds?: MerchantId[];
  excludeMerchantIds?: MerchantId[];
};

export type DigestDealEntry = {
  dealId: DealId;
  teaser: string;
  sortScore: number;
};

export type DigestIssue = {
  id: DigestIssueId;
  generatedAt: ISODateString;
  dealEntries: DigestDealEntry[];
};

export type DigestRule = {
  id: string;
  name: string;
  enabled: boolean;
  cadence: 'weekly';
  maxDeals: number;
  minScore: number;
  includeNewOnly: boolean;
};

export type DealMatch = {
  dealId: DealId;
  subscriberId: SubscriberId;
  matchedChannels: NotificationChannel[];
  matchScore: number;
  reasons: string[];
};

export type WorkerContracts = {
  normalizeOffer: {
    input: SourceOffer;
    output: NormalizedDealCandidate;
  };
  evaluateHotDeal: {
    deal: NormalizedDealCandidate | PublishedDeal;
    rules: HotDealRule[];
    matches: DealMatch[];
  };
  buildDigest: {
    deals: PublishedDeal[];
    rule: DigestRule;
    audience: Subscription[];
  };
  ingestMemberSignup: {
    input: MemberSignupInput;
    output: MemberProfile;
  };
};

export type AdminContracts = {
  approveDeal: {
    dealId: DealId;
    review: DealReview;
    status: PublicationStatus;
  };
  schedulePublication: {
    dealId: DealId;
    publishAt: ISODateString;
    publicVisibleFrom: ISODateString;
  };
  manageMerchant: MerchantReference;
  upsertMemberProfile: MemberProfile;
};

export const PUBLIC_ARCHIVE_DELAY_HOURS = 24;
