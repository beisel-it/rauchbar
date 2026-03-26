import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAdminDispatchRunReadModel,
  deriveAdminDispatchRunStatus,
  type NotificationDispatchRecord,
} from '@rauchbar/notifications';

const dispatches: NotificationDispatchRecord[] = [
  {
    id: 'dispatch-001',
    dealId: 'deal-001',
    channel: 'digest',
    deliveryStatus: 'delivered',
    recipientMemberId: 'member-001',
    providerStatus: 'delivered',
  },
  {
    id: 'dispatch-002',
    dealId: 'deal-002',
    channel: 'digest',
    deliveryStatus: 'failed',
    recipientMemberId: 'member-002',
    providerStatus: 'bounce',
    failureReason: 'mailbox-unavailable',
  },
];

test('deriveAdminDispatchRunStatus distinguishes planned, sent, partial failure, failed, and paused runs', () => {
  assert.equal(
    deriveAdminDispatchRunStatus({
      deliveryCounts: {
        queued: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        suppressed: 0,
        total: 0,
      },
    }),
    'planned',
  );

  assert.equal(
    deriveAdminDispatchRunStatus({
      deliveryCounts: {
        queued: 1,
        sent: 0,
        delivered: 0,
        failed: 0,
        suppressed: 0,
        total: 1,
      },
    }),
    'sending',
  );

  assert.equal(
    deriveAdminDispatchRunStatus({
      deliveryCounts: {
        queued: 0,
        sent: 0,
        delivered: 2,
        failed: 0,
        suppressed: 0,
        total: 2,
      },
      completedAt: '2026-03-27T08:15:00.000Z',
    }),
    'sent',
  );

  assert.equal(
    deriveAdminDispatchRunStatus({
      deliveryCounts: {
        queued: 0,
        sent: 0,
        delivered: 1,
        failed: 1,
        suppressed: 0,
        total: 2,
      },
      completedAt: '2026-03-27T08:15:00.000Z',
    }),
    'partial_failure',
  );

  assert.equal(
    deriveAdminDispatchRunStatus({
      deliveryCounts: {
        queued: 0,
        sent: 0,
        delivered: 0,
        failed: 2,
        suppressed: 0,
        total: 2,
      },
      completedAt: '2026-03-27T08:15:00.000Z',
    }),
    'failed',
  );

  assert.equal(
    deriveAdminDispatchRunStatus({
      deliveryCounts: {
        queued: 0,
        sent: 1,
        delivered: 0,
        failed: 0,
        suppressed: 0,
        total: 1,
      },
      pausedAt: '2026-03-27T08:05:00.000Z',
    }),
    'paused',
  );
});

test('buildAdminDispatchRunReadModel summarizes digest dispatch outcomes for admin runtime consumers', () => {
  const readModel = buildAdminDispatchRunReadModel({
    runId: 'digest-run-2026-W13',
    channel: 'digest',
    dispatches,
    startedAt: '2026-03-27T08:00:00.000Z',
    completedAt: '2026-03-27T08:15:00.000Z',
    dealCount: 2,
    recipientCount: 2,
  });

  assert.equal(readModel.kind, 'digest');
  assert.equal(readModel.status, 'partial_failure');
  assert.equal(readModel.deliveryCounts.delivered, 1);
  assert.equal(readModel.deliveryCounts.failed, 1);
  assert.equal(readModel.failureCount, 1);
  assert.deepEqual(readModel.latestProviderStatuses, ['delivered', 'bounce']);
  assert.equal(readModel.failures[0]?.failureReason, 'mailbox-unavailable');
});
