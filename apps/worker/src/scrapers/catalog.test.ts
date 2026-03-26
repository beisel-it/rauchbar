import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { SourceAdapterInput } from '@rauchbar/deals-core';

import { cigarworldWebshopScraper, normalizeCigarworldOffers, parseCigarworldWebshopHtml } from './cigarworld-webshop.ts';
import { cigarworldMerchant, cigarworldSources, listCrawlerWorkItems } from './catalog.ts';
import { scraperRegistry } from './registry.ts';

const neuheitenSource = cigarworldSources.find((source) => source.id === 'source-cigarworld-neuheiten');

const neuheitenPayload = readFileSync(
  new URL('../__fixtures__/cigarworld-neuheiten.fixture.html', import.meta.url),
  'utf8',
);

function createNeuheitenInput(): SourceAdapterInput {
  assert.ok(neuheitenSource);

  return {
    merchant: cigarworldMerchant,
    source: neuheitenSource,
    requestedAt: '2026-03-26T08:00:00.000Z',
    fetchedAt: '2026-03-26T08:00:03.000Z',
    requestUrl: neuheitenSource.endpoint,
    contentType: 'text/html; charset=utf-8',
    payload: neuheitenPayload,
  };
}

test('crawler work catalog exposes two active webshop work items for Cigarworld', () => {
  const workItems = listCrawlerWorkItems();

  assert.equal(workItems.length, 2);
  assert.deepEqual(
    workItems.map((item) => item.source.id),
    ['source-cigarworld-sonderposten', 'source-cigarworld-neuheiten'],
  );

  const jobs = scraperRegistry.planJobs(workItems, '2026-03-26T08:00:00.000Z');

  assert.equal(jobs.length, 2);
  assert.deepEqual(
    jobs.map((job) => job.claimKey),
    [
      'merchant-cigarworld:source-cigarworld-sonderposten',
      'merchant-cigarworld:source-cigarworld-neuheiten',
    ],
  );
});

test('cigarworld webshop scraper supports the neuheiten source as a second active webshop input', () => {
  assert.ok(neuheitenSource);
  assert.equal(cigarworldWebshopScraper.supports(neuheitenSource, cigarworldMerchant), true);
});

test('parseCigarworldWebshopHtml extracts neuheiten offers from the second webshop fixture', () => {
  const output = parseCigarworldWebshopHtml(createNeuheitenInput());

  assert.equal(output.observedOffers.length, 2);
  assert.deepEqual(output.warnings, []);
  assert.deepEqual(output.observedOffers[0], {
    externalId: '64917',
    title: 'Davidoff Puro Dominicano Perfecto',
    listingUrl:
      'https://www.cigarworld.de/zigarren/dominikanische-republik/davidoff-puro-dominicano-perfecto-90017588_64917',
    imageUrl: 'https://www.cigarworld.de/bilder/detail/16954_64917_201381.jpg',
    currentPrice: {
      amountCents: 2490,
      currency: 'EUR',
    },
    previousPrice: undefined,
    availability: 'out-of-stock',
    observedAt: '2026-03-26T08:00:03.000Z',
    discoveredAt: '2026-03-26T08:00:00.000Z',
  });
});

test('normalizeCigarworldOffers keeps the second webshop source source-scoped for queued execution', () => {
  const normalizedDeals = normalizeCigarworldOffers(parseCigarworldWebshopHtml(createNeuheitenInput()));

  assert.equal(normalizedDeals.length, 2);
  assert.equal(normalizedDeals[0]?.id, 'cigarworld:source-cigarworld-neuheiten:64917');
  assert.equal(normalizedDeals[0]?.source.id, 'source-cigarworld-neuheiten');
  assert.deepEqual(normalizedDeals[0]?.tags, [
    'cigarworld',
    'webshop',
    'special-offer',
    'sold-out',
  ]);
});
