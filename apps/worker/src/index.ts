import type { PublishedDeal } from '@rauchbar/deals-core';
import type {
  WeeklyDigestDealItem,
  WeeklyDigestEmailCommand,
  WeeklyDigestRecipient,
} from '@rauchbar/notifications';

export * from './scrapers/registry.ts';
export * from './scrapers/types.ts';
export * from './scrapers/cigarworld-webshop.ts';

export type WeeklyDigestBuildInput = {
  baseUrl: string;
  deals: PublishedDeal[];
  generatedAt: string;
  recipient: WeeklyDigestRecipient;
  unsubscribeUrl: string;
  weekOf: string;
  merchantDisplayNames?: Record<string, string>;
};

export const WEEKLY_DIGEST_TEMPLATE = 'weekly-digest';

export function selectWeeklyDigestDeals(deals: PublishedDeal[]): PublishedDeal[] {
  return deals.filter((deal) => deal.channels.includes('digest'));
}

export function mapDealToWeeklyDigestItem(
  baseUrl: string,
  deal: PublishedDeal,
  merchantDisplayNames?: Record<string, string>,
): WeeklyDigestDealItem {
  return {
    dealId: deal.id,
    title: deal.title,
    merchantName: merchantDisplayNames?.[deal.merchantId] ?? deal.merchantId,
    currentPriceCents: deal.currentPrice.amountCents,
    previousPriceCents: deal.referencePrice?.amountCents,
    publishedAt: deal.lifecycle.publishedAt,
    sourceUrl: buildDealUrl(baseUrl, deal.slug),
  };
}

export function buildWeeklyDigestEmailCommand(
  input: WeeklyDigestBuildInput,
): WeeklyDigestEmailCommand | null {
  const digestDeals = selectWeeklyDigestDeals(input.deals);

  if (digestDeals.length === 0) {
    return null;
  }

  const items = digestDeals.map((deal) =>
    mapDealToWeeklyDigestItem(input.baseUrl, deal, input.merchantDisplayNames),
  );

  return {
    channel: 'email',
    template: WEEKLY_DIGEST_TEMPLATE,
    subject: buildDigestSubject(items.length),
    previewText: buildDigestPreviewText(items),
    recipient: {
      email: input.recipient.email,
      name: input.recipient.name,
    },
    payload: {
      digestId: buildDigestId(input.recipient.memberId, input.weekOf),
      recipient: input.recipient,
      weekOf: input.weekOf,
      generatedAt: input.generatedAt,
      introLine: buildIntroLine(items.length),
      deals: items,
      totalDeals: items.length,
      unsubscribeUrl: input.unsubscribeUrl,
    },
    metadata: {
      notificationType: 'weekly-digest',
      recipientMemberId: input.recipient.memberId,
      weekOf: input.weekOf,
    },
  };
}

function buildDigestId(memberId: string, weekOf: string): string {
  return `digest-${memberId}-${weekOf}`;
}

function buildDealUrl(baseUrl: string, dealSlug: string): string {
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/deals/${dealSlug}`;
}

function buildIntroLine(dealCount: number): string {
  if (dealCount === 1) {
    return 'Diese Woche wartet 1 relevanter Deal auf dich.';
  }

  return `Diese Woche warten ${dealCount} relevante Deals auf dich.`;
}

function buildDigestSubject(dealCount: number): string {
  if (dealCount === 1) {
    return 'Rauchbar Wochen-Digest: 1 neuer Deal';
  }

  return `Rauchbar Wochen-Digest: ${dealCount} neue Deals`;
}

function buildDigestPreviewText(items: WeeklyDigestDealItem[]): string {
  const leadItem = items[0];

  if (!leadItem) {
    return 'Deine kuratierten Zigarrenangebote der Woche.';
  }

  if (items.length === 1) {
    return `${leadItem.title} ist dein Deal der Woche.`;
  }

  return `${leadItem.title} und ${items.length - 1} weitere Deals diese Woche.`;
}
