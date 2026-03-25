export type DealChannel = 'digest' | 'email-hot-deal' | 'whatsapp-hot-deal';

export type Deal = {
  id: string;
  title: string;
  merchant: string;
  currentPriceCents: number;
  previousPriceCents?: number;
  publishedAt: string;
  membersVisibleUntil?: string;
  channels: DealChannel[];
};

