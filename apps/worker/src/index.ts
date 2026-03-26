import type { PublishedDeal } from '@rauchbar/deals-core';
import type {
  HotDealDealItem,
  HotDealEmailCommand,
  HotDealRecipient,
  HotDealWhatsappCommand,
  NotificationDecision,
  NotificationDispatchRecord,
  WhatsappNotificationChannel,
  WeeklyDigestDealItem,
  WeeklyDigestEmailCommand,
  WeeklyDigestRecipient,
} from '@rauchbar/notifications';
import { canQueueNotification, createQueuedDispatch } from '@rauchbar/notifications';

export * from './scrapers/registry.ts';
export * from './scrapers/types.ts';
export * from './scrapers/cigarworld-webshop.ts';

const HOT_DEAL_EMAIL_CHANNEL = 'email-hot-deal';
const HOT_DEAL_WHATSAPP_CHANNEL: WhatsappNotificationChannel = 'whatsapp-hot-deal';

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
export const HOT_DEAL_EMAIL_TEMPLATE = 'hot-deal-email';
export const HOT_DEAL_WHATSAPP_TEMPLATE = 'hot-deal-whatsapp';

export type HotDealBuildInput = {
  baseUrl: string;
  deal: PublishedDeal;
  decisions: NotificationDecision[];
  dispatchedAt: string;
  recipient: HotDealRecipient;
  unsubscribeUrl: string;
  merchantDisplayNames?: Record<string, string>;
};

export type HotDealDispatchPlan = {
  channel: typeof HOT_DEAL_EMAIL_CHANNEL | typeof HOT_DEAL_WHATSAPP_CHANNEL;
  dispatch: NotificationDispatchRecord;
  command: HotDealEmailCommand | HotDealWhatsappCommand;
};

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

export function buildHotDealDispatchPlans(input: HotDealBuildInput): HotDealDispatchPlan[] {
  const plans: HotDealDispatchPlan[] = [];
  const hotDealItem = mapDealToHotDealItem(input.baseUrl, input.deal, input.merchantDisplayNames);

  if (
    canQueueNotification({
      channel: HOT_DEAL_EMAIL_CHANNEL,
      deal: input.deal,
      decisions: input.decisions,
      recipient: input.recipient,
      at: input.dispatchedAt,
    }).allowed
  ) {
    plans.push({
      channel: HOT_DEAL_EMAIL_CHANNEL,
      dispatch: createQueuedDispatch({
        dispatchId: buildHotDealDispatchId(input.recipient.memberId, input.deal.id, HOT_DEAL_EMAIL_CHANNEL),
        dealId: input.deal.id,
        channel: HOT_DEAL_EMAIL_CHANNEL,
      }),
      command: buildHotDealEmailCommand(input, hotDealItem),
    });
  }

  if (
    canQueueNotification({
      channel: HOT_DEAL_WHATSAPP_CHANNEL,
      deal: input.deal,
      decisions: input.decisions,
      recipient: input.recipient,
      at: input.dispatchedAt,
    }).allowed
  ) {
    plans.push({
      channel: HOT_DEAL_WHATSAPP_CHANNEL,
      dispatch: createQueuedDispatch({
        dispatchId: buildHotDealDispatchId(
          input.recipient.memberId,
          input.deal.id,
          HOT_DEAL_WHATSAPP_CHANNEL,
        ),
        dealId: input.deal.id,
        channel: HOT_DEAL_WHATSAPP_CHANNEL,
      }),
      command: buildHotDealWhatsappCommand(input, hotDealItem),
    });
  }

  return plans;
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

function mapDealToHotDealItem(
  baseUrl: string,
  deal: PublishedDeal,
  merchantDisplayNames?: Record<string, string>,
): HotDealDealItem {
  return {
    dealId: deal.id,
    title: deal.title,
    merchantName: merchantDisplayNames?.[deal.merchantId] ?? deal.merchantId,
    currentPriceCents: deal.currentPrice.amountCents,
    previousPriceCents: deal.referencePrice?.amountCents,
    savingsPercent: deal.savingsPercent,
    score: deal.score,
    sourceUrl: buildDealUrl(baseUrl, deal.slug),
  };
}

function buildHotDealEmailCommand(
  input: HotDealBuildInput,
  deal: HotDealDealItem,
): HotDealEmailCommand {
  return {
    channel: 'email',
    template: HOT_DEAL_EMAIL_TEMPLATE,
    subject: `Rauchbar Hot Deal: ${deal.title}`,
    previewText: buildHotDealPreviewText(deal),
    recipient: {
      email: input.recipient.email ?? '',
    },
    payload: {
      alertId: buildHotDealAlertId(input.recipient.memberId, input.deal.id, HOT_DEAL_EMAIL_CHANNEL),
      recipient: input.recipient,
      dispatchedAt: input.dispatchedAt,
      deal,
      unsubscribeUrl: input.unsubscribeUrl,
    },
    metadata: {
      notificationType: HOT_DEAL_EMAIL_CHANNEL,
      recipientMemberId: input.recipient.memberId,
      dealId: input.deal.id,
    },
  };
}

function buildHotDealWhatsappCommand(
  input: HotDealBuildInput,
  deal: HotDealDealItem,
): HotDealWhatsappCommand {
  return {
    channel: 'whatsapp',
    template: HOT_DEAL_WHATSAPP_TEMPLATE,
    recipient: {
      e164: input.recipient.whatsappE164 ?? '',
    },
    payload: {
      alertId: buildHotDealAlertId(input.recipient.memberId, input.deal.id, HOT_DEAL_WHATSAPP_CHANNEL),
      recipient: {
        memberId: input.recipient.memberId,
        locale: input.recipient.locale,
        whatsappE164: input.recipient.whatsappE164,
      },
      dispatchedAt: input.dispatchedAt,
      deal,
      optInRecordedAt: input.recipient.whatsappOptedInAt ?? '',
    },
    metadata: {
      notificationType: HOT_DEAL_WHATSAPP_CHANNEL,
      recipientMemberId: input.recipient.memberId,
      dealId: input.deal.id,
    },
  };
}

function buildHotDealDispatchId(memberId: string, dealId: string, channel: string): string {
  return `dispatch-${memberId}-${dealId}-${channel}`;
}

function buildHotDealAlertId(memberId: string, dealId: string, channel: string): string {
  return `alert-${memberId}-${dealId}-${channel}`;
}

function buildHotDealPreviewText(deal: HotDealDealItem): string {
  if (deal.previousPriceCents) {
    return `${deal.title} jetzt fuer ${formatCents(deal.currentPriceCents)} statt ${formatCents(deal.previousPriceCents)}.`;
  }

  return `${deal.title} ist jetzt als Hot Deal verfuegbar.`;
}

function formatCents(amountCents: number): string {
  return `${(amountCents / 100).toFixed(2)} EUR`;
}
