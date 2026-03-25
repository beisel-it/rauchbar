import type { Deal, DealPublicationStatus, NotificationPreference } from '@rauchbar/deals-core';

const now = new Date('2026-03-25T15:30:00.000Z');
const hour = 60 * 60 * 1000;

const isoHoursAgo = (hours: number) => new Date(now.getTime() - hours * hour).toISOString();
const isoHoursFromNow = (hours: number) => new Date(now.getTime() + hours * hour).toISOString();

const buildDeal = (
  id: string,
  title: string,
  publicationStatus: DealPublicationStatus,
  visibility: Deal['visibility'],
  currentPriceCents: number,
  previousPriceCents: number,
  channels: Deal['channels'],
): Deal => ({
  id,
  merchantId: `merchant-${id}`,
  sourceUrl: `https://merchant.example/deals/${id}`,
  title,
  brand: 'Habanos',
  format: 'Robusto',
  currentPriceCents,
  previousPriceCents,
  currencyCode: 'EUR',
  availability: 'in-stock',
  reviewStatus: 'approved',
  publicationStatus,
  visibility,
  channels,
  createdAt: isoHoursAgo(30),
  updatedAt: isoHoursAgo(1),
});

export const sampleDeals: Deal[] = [
  buildDeal(
    'cohiba-reserva',
    'Cohiba Reserva mit 18% Rabatt',
    'public-scheduled',
    {
      memberPublishedAt: isoHoursAgo(5),
      publicScheduledAt: isoHoursFromNow(19),
      membersOnlyUntil: isoHoursFromNow(19),
    },
    2890,
    3520,
    ['email-hot-deal', 'whatsapp-hot-deal'],
  ),
  buildDeal(
    'partagas-serie-d4',
    'Partagas Serie D No. 4 Sampler',
    'member-visible',
    {
      memberPublishedAt: isoHoursAgo(2),
      membersOnlyUntil: isoHoursFromNow(22),
    },
    1790,
    2140,
    ['digest'],
  ),
  buildDeal(
    'romeo-julieta-wide',
    'Romeo y Julieta Wide Churchill Bundle',
    'public-visible',
    {
      memberPublishedAt: isoHoursAgo(32),
      publicScheduledAt: isoHoursAgo(8),
      publicPublishedAt: isoHoursAgo(8),
      membersOnlyUntil: isoHoursAgo(8),
    },
    2390,
    2990,
    ['digest', 'email-hot-deal'],
  ),
];

export const defaultNotificationPreference: NotificationPreference = {
  digestEnabled: true,
  hotDealEmailEnabled: true,
  hotDealWhatsappEnabled: false,
};

export const preferenceOptions = {
  formats: ['Robusto', 'Toro', 'Corona', 'Figurado'],
  brands: ['Cohiba', 'Partagas', 'Hoyo de Monterrey', 'Romeo y Julieta'],
  priceBands: ['unter 15 EUR', '15 bis 30 EUR', '30 bis 60 EUR', '60 EUR+'],
};
