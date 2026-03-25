export type ISODateString = string;
export type CurrencyCode = 'EUR';
export type CountryCode = 'DE' | 'AT' | 'CH';

export const dealChannels = ['digest', 'email-hot-deal', 'whatsapp-hot-deal'] as const;
export type DealChannel = (typeof dealChannels)[number];

export const sourceAdapterKinds = ['html', 'rss', 'api', 'manual'] as const;
export type SourceAdapterKind = (typeof sourceAdapterKinds)[number];

export const ingestRunStatuses = ['pending', 'running', 'succeeded', 'partial', 'failed'] as const;
export type IngestRunStatus = (typeof ingestRunStatuses)[number];

export const normalizationStatuses = ['raw', 'normalized', 'needs-review', 'rejected'] as const;
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
] as const;
export type HotDealReasonCode = (typeof hotDealReasonCodes)[number];

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
  deal: NormalizedDealPayload;
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

export type SubscriberDealPreferences = {
  subscriberId: SubscriberId;
  favoriteBrands: string[];
  favoriteVitolas: string[];
  excludedMerchants: MerchantId[];
  minDiscountPercent?: number;
  hotDealChannels: DealChannel[];
  digestEnabled: boolean;
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
