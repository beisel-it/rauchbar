import type { DealChannel, NormalizedDealPayload } from '@rauchbar/deals-core';

export type SiteNotificationPreference = {
  digestEnabled: boolean;
  hotDealEmailEnabled: boolean;
  hotDealWhatsappEnabled: boolean;
};

export type SitePublicationStatus = 'member-visible' | 'public-scheduled' | 'public-visible';

export type SiteDeal = NormalizedDealPayload & {
  title: string;
  publicationStatus: SitePublicationStatus;
  visibility: {
    memberPublishedAt?: string;
    publicScheduledAt?: string;
    publicPublishedAt?: string;
    membersOnlyUntil?: string;
  };
};

const now = new Date('2026-03-25T15:30:00.000Z');
const hour = 60 * 60 * 1000;

const isoHoursAgo = (hours: number) => new Date(now.getTime() - hours * hour).toISOString();
const isoHoursFromNow = (hours: number) => new Date(now.getTime() + hours * hour).toISOString();

const buildDeal = (params: {
  id: string;
  title: string;
  publicationStatus: SitePublicationStatus;
  visibility: SiteDeal['visibility'];
  currentPriceCents: number;
  previousPriceCents: number;
  channels: DealChannel[];
}): SiteDeal => ({
  id: params.id,
  title: params.title,
  merchant: {
    id: `merchant-${params.id}`,
    slug: `merchant-${params.id}`,
    displayName: 'Cigarworld',
    countryCode: 'DE',
    baseUrl: 'https://merchant.example',
    active: true,
  },
  source: {
    id: `source-${params.id}`,
    merchantId: `merchant-${params.id}`,
    adapterKind: 'html',
    label: 'Demo Feed',
    endpoint: `https://merchant.example/deals/${params.id}`,
    active: true,
  },
  product: {
    brand: 'Habanos',
    productName: params.title,
    vitola: 'Robusto',
    quantity: 1,
    limitedEdition: false,
  },
  observation: {
    title: params.title,
    listingUrl: `https://merchant.example/deals/${params.id}`,
    currentPrice: {
      amountCents: params.currentPriceCents,
      currency: 'EUR',
    },
    previousPrice: {
      amountCents: params.previousPriceCents,
      currency: 'EUR',
    },
    availability: 'in-stock',
    observedAt: isoHoursAgo(1),
    discoveredAt: isoHoursAgo(30),
  },
  summary: `${params.title} als Demo-Deal fuer die Site-Vorschau.`,
  normalizationStatus: 'normalized',
  reviewStatus: 'approved',
  lifecycleStatus:
    params.publicationStatus === 'public-visible'
      ? 'published-public'
      : params.publicationStatus === 'public-scheduled'
        ? 'scheduled'
        : 'published-members',
  tags: ['demo', 'site-foundation'],
  publication: {
    memberVisibleAt: params.visibility.memberPublishedAt,
    publicVisibleAt: params.visibility.publicPublishedAt,
    membersVisibleUntil: params.visibility.membersOnlyUntil,
    channels: params.channels,
  },
  publicationStatus: params.publicationStatus,
  visibility: params.visibility,
});

export const sampleDeals: SiteDeal[] = [
  buildDeal({
    id: 'cohiba-reserva',
    title: 'Cohiba Reserva mit 18% Rabatt',
    publicationStatus: 'public-scheduled',
    visibility: {
      memberPublishedAt: isoHoursAgo(5),
      publicScheduledAt: isoHoursFromNow(19),
      membersOnlyUntil: isoHoursFromNow(19),
    },
    currentPriceCents: 2890,
    previousPriceCents: 3520,
    channels: ['email-hot-deal', 'whatsapp-hot-deal'],
  }),
  buildDeal({
    id: 'partagas-serie-d4',
    title: 'Partagas Serie D No. 4 Sampler',
    publicationStatus: 'member-visible',
    visibility: {
      memberPublishedAt: isoHoursAgo(2),
      membersOnlyUntil: isoHoursFromNow(22),
    },
    currentPriceCents: 1790,
    previousPriceCents: 2140,
    channels: ['digest'],
  }),
  buildDeal({
    id: 'romeo-julieta-wide',
    title: 'Romeo y Julieta Wide Churchill Bundle',
    publicationStatus: 'public-visible',
    visibility: {
      memberPublishedAt: isoHoursAgo(32),
      publicScheduledAt: isoHoursAgo(8),
      publicPublishedAt: isoHoursAgo(8),
      membersOnlyUntil: isoHoursAgo(8),
    },
    currentPriceCents: 2390,
    previousPriceCents: 2990,
    channels: ['digest', 'email-hot-deal'],
  }),
];

export const defaultNotificationPreference: SiteNotificationPreference = {
  digestEnabled: true,
  hotDealEmailEnabled: true,
  hotDealWhatsappEnabled: false,
};

export const preferenceOptions = {
  formats: ['Robusto', 'Toro', 'Corona', 'Figurado'],
  brands: ['Cohiba', 'Partagas', 'Hoyo de Monterrey', 'Romeo y Julieta'],
  priceBands: ['unter 15 EUR', '15 bis 30 EUR', '30 bis 60 EUR', '60 EUR+'],
};
