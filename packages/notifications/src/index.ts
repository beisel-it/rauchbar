import type { DealChannel, PublicationStatus, PublishedDeal, ReviewStatus } from '@rauchbar/deals-core';

export type NotificationTransport = 'email' | 'whatsapp' | 'site';

export type NotificationKind = 'digest' | 'hot-deal' | 'publication';

export type NotificationAudience = 'member' | 'public';

export type NotificationCadence = 'scheduled-batch' | 'immediate' | 'scheduled-release';

export type NotificationEligibility = 'eligible' | 'suppressed' | 'blocked-review' | 'blocked-policy';

export type NotificationDeliveryStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'suppressed';

export type EmailNotificationChannel = Extract<DealChannel, 'digest' | 'email-hot-deal'>;

export type WhatsappNotificationChannel = Extract<DealChannel, 'whatsapp-hot-deal'>;

export type AdminDispatchChannel = Extract<DealChannel, 'digest' | 'email-hot-deal' | 'whatsapp-hot-deal'>;

export type AdminDispatchRunStatus =
  | 'planned'
  | 'sending'
  | 'sent'
  | 'partial_failure'
  | 'failed'
  | 'paused';

export type NotificationChannelContract = {
  channel: DealChannel;
  transport: NotificationTransport;
  kind: NotificationKind;
  audience: NotificationAudience;
  cadence: NotificationCadence;
  allowedReviewStatuses: ReviewStatus[];
  allowedPublicationStatuses: PublicationStatus[];
  requiresMemberWindow: boolean;
  requiresDigestPreference: boolean;
  requiresHotDealPreference: boolean;
  supportsRichContent: boolean;
  maxDealsPerDispatch: number;
};

export type NotificationPreferences = {
  digestEnabled: boolean;
  hotDealEmailEnabled: boolean;
  hotDealWhatsappEnabled: boolean;
};

export type NotificationRecipient = {
  memberId: string;
  email?: string;
  whatsappE164?: string;
  whatsappOptedInAt?: string;
  preferences: NotificationPreferences;
};

export type NotificationDecision = {
  channel: DealChannel;
  eligibility: NotificationEligibility;
  reason?: string;
};

export type DigestDealItem = {
  dealId: string;
  title: string;
  merchantName: string;
  currentPriceCents: number;
  previousPriceCents?: number;
  sourceUrl: string;
};

export type EmailDigestNotification = {
  channel: 'digest';
  recipient: NotificationRecipient;
  digestId: string;
  periodStart: string;
  periodEnd: string;
  deals: DigestDealItem[];
};

export type HotDealNotification = {
  channel: EmailNotificationChannel | WhatsappNotificationChannel;
  recipient: NotificationRecipient;
  deal: PublishedDeal;
  dispatchedAt: string;
};

export type NotificationQueueDecision = {
  allowed: boolean;
  reasons: string[];
};

export type NotificationDispatchRecord = {
  id: string;
  dealId: string;
  channel: DealChannel;
  deliveryStatus: NotificationDeliveryStatus;
  recipientMemberId?: string;
  dispatchedAt?: string;
  updatedAt?: string;
  providerMessageId?: string;
  providerStatus?: string;
  failureReason?: string;
};

export type DispatchDeliveryCounts = Record<NotificationDeliveryStatus, number> & {
  total: number;
};

export type AdminDispatchFailure = {
  dispatchId: string;
  dealId: string;
  recipientMemberId?: string;
  providerStatus?: string;
  failureReason?: string;
};

export type AdminDispatchRunReadModel = {
  runId: string;
  channel: AdminDispatchChannel;
  kind: Extract<NotificationKind, 'digest' | 'hot-deal'>;
  status: AdminDispatchRunStatus;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  dealCount: number;
  recipientCount: number;
  deliveryCounts: DispatchDeliveryCounts;
  failureCount: number;
  latestProviderStatuses: string[];
  failures: AdminDispatchFailure[];
};

export type EmailAddress = {
  email: string;
  name?: string;
};

export type EmailDeliveryCommand<TPayload> = {
  channel: 'email';
  template: string;
  subject: string;
  previewText?: string;
  recipient: EmailAddress;
  payload: TPayload;
  metadata?: Record<string, string>;
};

export type WhatsappAddress = {
  e164: string;
};

export type WhatsappDeliveryCommand<TPayload> = {
  channel: 'whatsapp';
  template: string;
  recipient: WhatsappAddress;
  payload: TPayload;
  metadata?: Record<string, string>;
};

export type WeeklyDigestRecipient = EmailAddress & {
  memberId: string;
  locale: 'de-DE';
  timezone: string;
};

export type WeeklyDigestDealItem = {
  dealId: string;
  title: string;
  merchantName: string;
  currentPriceCents: number;
  previousPriceCents?: number;
  publishedAt?: string;
  sourceUrl: string;
};

export type WeeklyDigestEmailPayload = {
  digestId: string;
  recipient: WeeklyDigestRecipient;
  weekOf: string;
  generatedAt: string;
  introLine: string;
  deals: WeeklyDigestDealItem[];
  totalDeals: number;
  unsubscribeUrl: string;
};

export type WeeklyDigestEmailCommand = EmailDeliveryCommand<WeeklyDigestEmailPayload> & {
  template: 'weekly-digest';
};

export type HotDealRecipient = {
  memberId: string;
  locale: 'de-DE';
  email?: string;
  whatsappE164?: string;
  whatsappOptedInAt?: string;
  preferences: NotificationPreferences;
};

export type HotDealDealItem = {
  dealId: string;
  title: string;
  merchantName: string;
  currentPriceCents: number;
  previousPriceCents?: number;
  savingsPercent?: number;
  score: number;
  sourceUrl: string;
};

export type HotDealEmailPayload = {
  alertId: string;
  recipient: HotDealRecipient;
  dispatchedAt: string;
  deal: HotDealDealItem;
  unsubscribeUrl: string;
};

export type HotDealEmailCommand = EmailDeliveryCommand<HotDealEmailPayload> & {
  template: 'hot-deal-email';
};

export type HotDealWhatsappPayload = {
  alertId: string;
  recipient: Pick<HotDealRecipient, 'memberId' | 'locale' | 'whatsappE164'>;
  dispatchedAt: string;
  deal: HotDealDealItem;
  optInRecordedAt: string;
};

export type HotDealWhatsappCommand = WhatsappDeliveryCommand<HotDealWhatsappPayload> & {
  template: 'hot-deal-whatsapp';
};

export const NOTIFICATION_CHANNEL_CONTRACTS: Record<DealChannel, NotificationChannelContract> = {
  digest: {
    channel: 'digest',
    transport: 'email',
    kind: 'digest',
    audience: 'member',
    cadence: 'scheduled-batch',
    allowedReviewStatuses: ['approved'],
    allowedPublicationStatuses: ['approved', 'scheduled', 'published'],
    requiresMemberWindow: false,
    requiresDigestPreference: true,
    requiresHotDealPreference: false,
    supportsRichContent: true,
    maxDealsPerDispatch: 50,
  },
  'email-hot-deal': {
    channel: 'email-hot-deal',
    transport: 'email',
    kind: 'hot-deal',
    audience: 'member',
    cadence: 'immediate',
    allowedReviewStatuses: ['approved'],
    allowedPublicationStatuses: ['approved', 'scheduled'],
    requiresMemberWindow: true,
    requiresDigestPreference: false,
    requiresHotDealPreference: true,
    supportsRichContent: true,
    maxDealsPerDispatch: 1,
  },
  'whatsapp-hot-deal': {
    channel: 'whatsapp-hot-deal',
    transport: 'whatsapp',
    kind: 'hot-deal',
    audience: 'member',
    cadence: 'immediate',
    allowedReviewStatuses: ['approved'],
    allowedPublicationStatuses: ['approved', 'scheduled'],
    requiresMemberWindow: true,
    requiresDigestPreference: false,
    requiresHotDealPreference: true,
    supportsRichContent: false,
    maxDealsPerDispatch: 1,
  },
  'public-site': {
    channel: 'public-site',
    transport: 'site',
    kind: 'publication',
    audience: 'public',
    cadence: 'scheduled-release',
    allowedReviewStatuses: ['approved'],
    allowedPublicationStatuses: ['scheduled', 'published'],
    requiresMemberWindow: false,
    requiresDigestPreference: false,
    requiresHotDealPreference: false,
    supportsRichContent: true,
    maxDealsPerDispatch: 1,
  },
};

export function isDealInMemberWindow(deal: PublishedDeal, at: string): boolean {
  if (!deal.lifecycle.membersVisibleUntil) {
    return false;
  }

  return deal.lifecycle.membersVisibleUntil > at;
}

export function getNotificationDecision(
  decisions: NotificationDecision[],
  channel: DealChannel,
): NotificationDecision | undefined {
  return decisions.find((decision) => decision.channel === channel);
}

export function canQueueNotification(params: {
  channel: DealChannel;
  deal: PublishedDeal;
  decisions: NotificationDecision[];
  recipient?: NotificationRecipient;
  at: string;
}): NotificationQueueDecision {
  const { channel, deal, decisions, recipient, at } = params;
  const contract = NOTIFICATION_CHANNEL_CONTRACTS[channel];
  const decision = getNotificationDecision(decisions, channel);
  const reasons: string[] = [];
  const reviewStatus = deal.review?.status ?? 'pending';

  if (!deal.channels.includes(channel)) {
    reasons.push('deal-channel-disabled');
  }

  if (!contract.allowedReviewStatuses.includes(reviewStatus)) {
    reasons.push(`review-status:${reviewStatus}`);
  }

  if (!contract.allowedPublicationStatuses.includes(deal.status)) {
    reasons.push(`publication-status:${deal.status}`);
  }

  if (!decision) {
    reasons.push('notification-decision-missing');
  } else if (decision.eligibility !== 'eligible') {
    reasons.push(`eligibility:${decision.eligibility}`);
  }

  if (contract.requiresMemberWindow && !isDealInMemberWindow(deal, at)) {
    reasons.push('member-window-closed');
  }

  if (contract.requiresDigestPreference && !recipient?.preferences.digestEnabled) {
    reasons.push('digest-preference-disabled');
  }

  if (channel === 'email-hot-deal' && !recipient?.preferences.hotDealEmailEnabled) {
    reasons.push('hot-deal-email-preference-disabled');
  }

  if (channel === 'whatsapp-hot-deal') {
    if (!recipient?.preferences.hotDealWhatsappEnabled) {
      reasons.push('hot-deal-whatsapp-preference-disabled');
    }

    if (!recipient?.whatsappE164) {
      reasons.push('whatsapp-number-missing');
    }

    if (!recipient?.whatsappOptedInAt) {
      reasons.push('whatsapp-opt-in-missing');
    }
  }

  if ((channel === 'digest' || channel === 'email-hot-deal') && !recipient?.email) {
    reasons.push('email-missing');
  }

  return {
    allowed: reasons.length === 0,
    reasons,
  };
}

export function createQueuedDispatch(params: {
  dispatchId: string;
  dealId: string;
  channel: DealChannel;
  recipientMemberId?: string;
  dispatchedAt?: string;
}): NotificationDispatchRecord {
  return {
    id: params.dispatchId,
    dealId: params.dealId,
    channel: params.channel,
    deliveryStatus: 'queued',
    recipientMemberId: params.recipientMemberId,
    dispatchedAt: params.dispatchedAt,
  };
}

export function isTerminalDeliveryStatus(status: NotificationDeliveryStatus): boolean {
  return status === 'delivered' || status === 'failed' || status === 'suppressed';
}

export function buildDispatchDeliveryCounts(
  dispatches: NotificationDispatchRecord[],
): DispatchDeliveryCounts {
  const counts: DispatchDeliveryCounts = {
    queued: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    suppressed: 0,
    total: dispatches.length,
  };

  for (const dispatch of dispatches) {
    counts[dispatch.deliveryStatus] += 1;
  }

  return counts;
}

export function deriveAdminDispatchRunStatus(params: {
  deliveryCounts: DispatchDeliveryCounts;
  completedAt?: string;
  pausedAt?: string;
}): AdminDispatchRunStatus {
  const { deliveryCounts, completedAt, pausedAt } = params;

  if (pausedAt) {
    return 'paused';
  }

  if (deliveryCounts.total === 0) {
    return 'planned';
  }

  if (!completedAt) {
    return 'sending';
  }

  if (deliveryCounts.failed === deliveryCounts.total) {
    return 'failed';
  }

  if (deliveryCounts.failed > 0) {
    return 'partial_failure';
  }

  return 'sent';
}

export function buildAdminDispatchRunReadModel(params: {
  runId: string;
  channel: AdminDispatchChannel;
  dispatches: NotificationDispatchRecord[];
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  dealCount: number;
  recipientCount: number;
}): AdminDispatchRunReadModel {
  const deliveryCounts = buildDispatchDeliveryCounts(params.dispatches);
  const failures = params.dispatches
    .filter((dispatch) => dispatch.deliveryStatus === 'failed')
    .map((dispatch) => ({
      dispatchId: dispatch.id,
      dealId: dispatch.dealId,
      recipientMemberId: dispatch.recipientMemberId,
      providerStatus: dispatch.providerStatus,
      failureReason: dispatch.failureReason,
    }));
  const latestProviderStatuses = Array.from(
    new Set(
      params.dispatches
        .map((dispatch) => dispatch.providerStatus)
        .filter((providerStatus): providerStatus is string => Boolean(providerStatus)),
    ),
  );

  return {
    runId: params.runId,
    channel: params.channel,
    kind: getAdminDispatchKind(params.channel),
    status: deriveAdminDispatchRunStatus({
      deliveryCounts,
      completedAt: params.completedAt,
      pausedAt: params.pausedAt,
    }),
    startedAt: params.startedAt,
    completedAt: params.completedAt,
    pausedAt: params.pausedAt,
    dealCount: params.dealCount,
    recipientCount: params.recipientCount,
    deliveryCounts,
    failureCount: failures.length,
    latestProviderStatuses,
    failures,
  };
}

function getAdminDispatchKind(channel: AdminDispatchChannel): Extract<NotificationKind, 'digest' | 'hot-deal'> {
  return channel === 'digest' ? 'digest' : 'hot-deal';
}
