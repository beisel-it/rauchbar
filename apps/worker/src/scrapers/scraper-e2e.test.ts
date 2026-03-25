import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { MerchantReference, SourceReference } from '@rauchbar/deals-core';

import { scraperRegistry } from './registry.ts';

const merchant: MerchantReference = {
  id: 'merchant-cigarworld',
  slug: 'cigarworld',
  displayName: 'Cigarworld',
  countryCode: 'DE',
  baseUrl: 'https://www.cigarworld.de',
  active: true,
};

const source: SourceReference = {
  id: 'source-cigarworld-sonderposten',
  merchantId: merchant.id,
  adapterKind: 'html',
  label: 'Cigarworld Sonderposten',
  endpoint: 'https://www.cigarworld.de/shop/sonderposten/zigarren',
  active: true,
};

const payload = readFileSync(new URL('../__fixtures__/cigarworld-sonderposten.fixture.html', import.meta.url), 'utf8');

test('end-to-end queued scrape job plans, executes, and normalizes deterministically', async () => {
  const [job] = scraperRegistry.planJobs([{ merchant, source }], '2026-03-25T09:00:00.000Z');

  assert.ok(job);
  assert.equal(job.origin, 'webshop');
  assert.equal(job.claimKey, 'merchant-cigarworld:source-cigarworld-sonderposten');
  assert.equal(job.requestUrl, source.endpoint);

  const result = await scraperRegistry.runJob({
    job,
    fetchedAt: '2026-03-25T09:00:02.000Z',
    contentType: 'text/html; charset=utf-8',
    payload,
  });

  assert.equal(result.adapterOutput.observedOffers.length, 2);
  assert.equal(result.normalizedDeals.length, 2);
  assert.equal(result.normalizedDeals[0]?.id, 'cigarworld:source-cigarworld-sonderposten:60786');
  assert.equal(result.normalizedDeals[0]?.observation.currentPrice.amountCents, 1250);
  assert.equal(result.normalizedDeals[0]?.observation.previousPrice?.amountCents, 1350);
  assert.deepEqual(result.normalizedDeals[0]?.tags, [
    'cigarworld',
    'webshop',
    'price-drop',
    'available-now',
  ]);
});
