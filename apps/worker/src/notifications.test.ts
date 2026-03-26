import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { PublishedDeal } from '@rauchbar/deals-core';
import type { HotDealRecipient, NotificationDecision } from '@rauchbar/notifications';

import { buildHotDealDispatchPlans } from './index.ts';

const publishedDeal: PublishedDeal = {
  id: 'deal-001',
  slug: 'partagas-serie-d-no-4',
  candidateId: 'candidate-001',
  title: 'Partagas Serie D No. 4',
  merchantId: 'merchant-cigarworld',
  catalogEntryId: 'catalog-001',
  url: 'https://merchant.example/deal-001',
  currentPrice: {
    amountCents: 1299,
    currency: 'EUR',
  },
  referencePrice: {
    amountCents: 1699,
    currency: 'EUR',
  },
  savingsPercent: 24,
  score: 91,
  channels: ['email-hot-deal', 'whatsapp-hot-deal'],
  visibility: 'members-only',
  status: 'approved',
  triggers: ['price-drop'],
  lifecycle: {
    discoveredAt: '2026-03-26T08:00:00.000Z',
    approvedAt: '2026-03-26T08:10:00.000Z',
    membersVisibleUntil: '2026-03-27T08:10:00.000Z',
  },
  review: {
    reviewerId: 'admin-001',
    status: 'approved',
    reviewedAt: '2026-03-26T08:10:00.000Z',
  },
};

const hotDealRecipient: HotDealRecipient = {
  memberId: 'member-001',
  locale: 'de-DE',
  email: 'member@example.com',
  whatsappE164: '+491701234567',
  whatsappOptedInAt: '2026-03-20T10:00:00.000Z',
  preferences: {
    digestEnabled: true,
    hotDealEmailEnabled: true,
    hotDealWhatsappEnabled: true,
  },
};

const eligibleDecisions: NotificationDecision[] = [
  {
    channel: 'email-hot-deal',
    eligibility: 'eligible',
  },
  {
    channel: 'whatsapp-hot-deal',
    eligibility: 'eligible',
  },
];

test('buildHotDealDispatchPlans emits email and whatsapp commands for eligible recipients', () => {
  const plans = buildHotDealDispatchPlans({
    baseUrl: 'https://rauchbar.de',
    deal: publishedDeal,
    decisions: eligibleDecisions,
    dispatchedAt: '2026-03-26T09:00:00.000Z',
    recipient: hotDealRecipient,
    unsubscribeUrl: 'https://rauchbar.de/unsubscribe',
    merchantDisplayNames: {
      'merchant-cigarworld': 'Cigarworld',
    },
  });

  assert.equal(plans.length, 2);
  assert.deepEqual(
    plans.map((plan) => plan.channel),
    ['email-hot-deal', 'whatsapp-hot-deal'],
  );
  assert.equal(plans[0]?.dispatch.deliveryStatus, 'queued');
  assert.equal(plans[0]?.command.channel, 'email');
  assert.equal(plans[1]?.command.channel, 'whatsapp');
});

test('buildHotDealDispatchPlans suppresses whatsapp when opt-in evidence is missing', () => {
  const plans = buildHotDealDispatchPlans({
    baseUrl: 'https://rauchbar.de',
    deal: publishedDeal,
    decisions: eligibleDecisions,
    dispatchedAt: '2026-03-26T09:00:00.000Z',
    recipient: {
      ...hotDealRecipient,
      whatsappOptedInAt: undefined,
    },
    unsubscribeUrl: 'https://rauchbar.de/unsubscribe',
  });

  assert.equal(plans.length, 1);
  assert.equal(plans[0]?.channel, 'email-hot-deal');
  assert.equal(plans[0]?.command.channel, 'email');
});
