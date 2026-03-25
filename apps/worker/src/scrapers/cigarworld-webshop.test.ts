import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { MerchantReference, SourceAdapterInput, SourceReference } from '@rauchbar/deals-core';

import { scraperRegistry } from './registry.ts';
import { normalizeCigarworldOffers, parseCigarworldWebshopHtml } from './cigarworld-webshop.ts';

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

function createInput(): SourceAdapterInput {
  return {
    merchant,
    source,
    requestedAt: '2026-03-25T09:00:00.000Z',
    fetchedAt: '2026-03-25T09:00:02.000Z',
    requestUrl: source.endpoint,
    contentType: 'text/html; charset=utf-8',
    payload,
  };
}

test('registry resolves the cigarworld webshop scraper by merchant and source', () => {
  const scraper = scraperRegistry.find(source, merchant);

  assert.ok(scraper);
  assert.equal(scraper?.id, 'cigarworld-webshop');
  assert.equal(scraper?.origin, 'webshop');
});

test('registry plans deterministic queue jobs that can be consumed by multiple workers', () => {
  const jobs = scraperRegistry.planJobs(
    [
      { merchant, source },
      {
        merchant,
        source: {
          ...source,
          id: 'source-cigarworld-sonderposten-page-2',
          endpoint: 'https://www.cigarworld.de/shop/sonderposten/zigarren?page=2',
        },
      },
    ],
    '2026-03-25T09:00:00.000Z',
  );

  assert.equal(jobs.length, 2);
  assert.equal(jobs[0]?.origin, 'webshop');
  assert.equal(jobs[0]?.claimKey, 'merchant-cigarworld:source-cigarworld-sonderposten');
  assert.equal(
    jobs[1]?.claimKey,
    'merchant-cigarworld:source-cigarworld-sonderposten-page-2',
  );
  assert.notEqual(jobs[0]?.id, jobs[1]?.id);
});

test('parseCigarworldWebshopHtml extracts offer observations from fixture markup', () => {
  const output = parseCigarworldWebshopHtml(createInput());

  assert.equal(output.observedOffers.length, 2);
  assert.deepEqual(output.warnings, []);

  assert.deepEqual(output.observedOffers[0], {
    externalId: '60786',
    title: 'Classic Zigarren-Aschenbecher Keramik schwarz-marmoriert mit 3 Ablagen (6610033)',
    listingUrl:
      'https://www.cigarworld.de/zigarrenzubehoer/aschenbecher/classic-zigarren-aschenbecher-keramik-schwarz-marmoriert-mit-3-ablagen-6610033-02012075_60786',
    imageUrl: 'https://www.cigarworld.de/bilder/detail/2060_60786_171595.jpg',
    currentPrice: {
      amountCents: 1250,
      currency: 'EUR',
    },
    previousPrice: {
      amountCents: 1350,
      currency: 'EUR',
    },
    availability: 'in-stock',
    observedAt: '2026-03-25T09:00:02.000Z',
    discoveredAt: '2026-03-25T09:00:00.000Z',
  });
});

test('normalizeCigarworldOffers maps observations into shared normalized deal payloads', () => {
  const normalizedDeals = normalizeCigarworldOffers(parseCigarworldWebshopHtml(createInput()));

  assert.equal(normalizedDeals.length, 2);
  assert.equal(normalizedDeals[0]?.merchant.slug, 'cigarworld');
  assert.equal(normalizedDeals[0]?.source.id, source.id);
  assert.equal(normalizedDeals[0]?.product.brand, 'Classic');
  assert.equal(normalizedDeals[0]?.product.quantity, 1);
  assert.equal(normalizedDeals[0]?.normalizationStatus, 'normalized');
  assert.equal(normalizedDeals[0]?.reviewStatus, 'pending');
  assert.equal(normalizedDeals[0]?.lifecycleStatus, 'normalized');
  assert.deepEqual(normalizedDeals[0]?.publication.channels, []);
  assert.match(normalizedDeals[0]?.summary ?? '', /reduziert von 13\.50 EUR auf 12\.50 EUR/i);
});

test('registry scrape returns adapter output plus normalized deals', async () => {
  const result = await scraperRegistry.scrape(createInput());

  assert.equal(result.adapterOutput.observedOffers.length, 2);
  assert.equal(result.normalizedDeals.length, 2);
});

test('registry runJob executes a self-contained queue payload without shared process state', async () => {
  const job = scraperRegistry.planJobs([{ merchant, source }], '2026-03-25T09:00:00.000Z')[0];

  assert.ok(job);

  const result = await scraperRegistry.runJob({
    job,
    fetchedAt: '2026-03-25T09:00:02.000Z',
    contentType: 'text/html; charset=utf-8',
    payload,
  });

  assert.equal(result.job.id, job.id);
  assert.equal(result.adapterOutput.observedOffers.length, 2);
  assert.equal(result.normalizedDeals.length, 2);
});
