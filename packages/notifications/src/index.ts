import type {
  Deal,
  DealChannel,
  DealDispatch,
  DealPublicationStatus,
  DealReviewStatus,
  NotificationDecision,
  NotificationDeliveryStatus,
  NotificationPreference,
} from '@rauchbar/deals-core';

export type NotificationTransport = 'email' | 'whatsapp';

export type NotificationKind = 'digest' | 'hot-deal';

export type NotificationAudience = 'member';

export type EmailNotificationChannel = Extract<DealChannel, 'digest' | 'email-hot-deal'>;

export type WhatsappNotificationChannel = Extract<DealChannel, 'whatsapp-hot-deal'>;

export type NotificationChannelContract = {
  channel: DealChannel;
  transport: NotificationTransport;
  kind: NotificationKind;
  audience: NotificationAudience;
  cadence: 'scheduled-batch' | 'immediate';
  allowedReviewStatuses: DealReviewStatus[];
  allowedPublicationStatuses: DealPublicationStatus[];
  requiresMemberWindow: boolean;
  requiresDigestPreference: boolean;
  requiresHotDealPreference: boolean;
  supportsRichContent: boolean;
  maxDealsPerDispatch: number;
};

export type NotificationRecipient = {
  memberId: string;
  email?: string;
  whatsappE164?: string;
  whatsappOptedInAt?: string;
  preferences: NotificationPreference;
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
  deal: Deal;
  dispatchedAt: string;
};

export type NotificationQueueDecision = {
  allowed: boolean;
  reasons: string[];
};

export type NotificationDispatchRecord = DealDispatch & {
  providerMessageId?: string;
  providerStatus?: string;
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

export const NOTIFICATION_CHANNEL_CONTRACTS: Record<DealChannel, NotificationChannelContract> = {
  digest: {
    channel: 'digest',
    transport: 'email',
    kind: 'digest',
    audience: 'member',
    cadence: 'scheduled-batch',
    allowedReviewStatuses: ['approved'],
    allowedPublicationStatuses: ['member-visible', 'public-scheduled', 'public-visible'],
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
    allowedPublicationStatuses: ['member-visible', 'public-scheduled'],
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
    allowedPublicationStatuses: ['member-visible', 'public-scheduled'],
    requiresMemberWindow: true,
    requiresDigestPreference: false,
    requiresHotDealPreference: true,
    supportsRichContent: false,
    maxDealsPerDispatch: 1,
  },
};

export function isDealInMemberWindow(deal: Deal, at: string): boolean {
  if (!deal.visibility.membersOnlyUntil) {
    return false;
  }

  return deal.visibility.membersOnlyUntil > at;
}

export function getNotificationDecision(
  decisions: NotificationDecision[],
  channel: DealChannel,
): NotificationDecision | undefined {
  return decisions.find((decision) => decision.channel === channel);
}

export function canQueueNotification(params: {
  channel: DealChannel;
  deal: Deal;
  decisions: NotificationDecision[];
  recipient: NotificationRecipient;
  at: string;
}): NotificationQueueDecision {
  const { channel, deal, decisions, recipient, at } = params;
  const contract = NOTIFICATION_CHANNEL_CONTRACTS[channel];
  const decision = getNotificationDecision(decisions, channel);
  const reasons: string[] = [];

  if (!deal.channels.includes(channel)) {
    reasons.push('deal-channel-disabled');
  }

  if (!contract.allowedReviewStatuses.includes(deal.reviewStatus)) {
    reasons.push(`review-status:${deal.reviewStatus}`);
  }

  if (!contract.allowedPublicationStatuses.includes(deal.publicationStatus)) {
    reasons.push(`publication-status:${deal.publicationStatus}`);
  }

  if (!decision) {
    reasons.push('notification-decision-missing');
  } else if (decision.eligibility !== 'eligible') {
    reasons.push(`eligibility:${decision.eligibility}`);
  }

  if (contract.requiresMemberWindow && !isDealInMemberWindow(deal, at)) {
    reasons.push('member-window-closed');
  }

  if (contract.requiresDigestPreference && !recipient.preferences.digestEnabled) {
    reasons.push('digest-preference-disabled');
  }

  if (channel === 'email-hot-deal' && !recipient.preferences.hotDealEmailEnabled) {
    reasons.push('hot-deal-email-preference-disabled');
  }

  if (channel === 'whatsapp-hot-deal') {
    if (!recipient.preferences.hotDealWhatsappEnabled) {
      reasons.push('hot-deal-whatsapp-preference-disabled');
    }

    if (!recipient.whatsappE164) {
      reasons.push('whatsapp-number-missing');
    }

    if (!recipient.whatsappOptedInAt) {
      reasons.push('whatsapp-opt-in-missing');
    }
  }

  if (channel !== 'whatsapp-hot-deal' && !recipient.email) {
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
}): NotificationDispatchRecord {
  return {
    id: params.dispatchId,
    dealId: params.dealId,
    channel: params.channel,
    deliveryStatus: 'queued',
  };
}

export function isTerminalDeliveryStatus(status: NotificationDeliveryStatus): boolean {
  return status === 'delivered' || status === 'failed' || status === 'suppressed';
}
