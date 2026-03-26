import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { SourceAdapterInput } from '@rauchbar/deals-core';

import {
  cigarworldNewsletterMailScraper,
  cigarworldNewsletterMerchant,
  cigarworldNewsletterSource,
  normalizeCigarworldNewsletterOffers,
  parseCigarworldNewsletterMail,
} from './cigarworld-newsletter-mail.ts';
import { scraperRegistry } from './registry.ts';

const payload = readFileSync(
  new URL('../__fixtures__/cigarworld-newsletter.fixture.html', import.meta.url),
  'utf8',
);

function createInput(): SourceAdapterInput {
  return {
    merchant: cigarworldNewsletterMerchant,
    source: cigarworldNewsletterSource,
    requestedAt: '2026-03-26T18:00:00.000Z',
    fetchedAt: '2026-03-26T18:00:04.000Z',
    requestUrl: cigarworldNewsletterSource.endpoint,
    contentType: 'text/html; charset=utf-8',
    payload,
  };
}

test('registry resolves the cigarworld newsletter scraper by mail source and origin', () => {
  const scraper = scraperRegistry.find(cigarworldNewsletterSource, cigarworldNewsletterMerchant);

  assert.ok(scraper);
  assert.equal(scraper?.id, 'cigarworld-newsletter-mail');
  assert.equal(scraper?.origin, 'newsletter-mail');
  assert.equal(scraperRegistry.listByOrigin('newsletter-mail').length, 1);
});

test('cigarworld newsletter scraper supports mailbox-style html newsletter sources', () => {
  assert.equal(
    cigarworldNewsletterMailScraper.supports(cigarworldNewsletterSource, cigarworldNewsletterMerchant),
    true,
  );
});

test('parseCigarworldNewsletterMail extracts newsletter offer cards into shared observations', () => {
  const output = parseCigarworldNewsletterMail(createInput());

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
    previousPrice: {
      amountCents: 2790,
      currency: 'EUR',
    },
    availability: 'in-stock',
    observedAt: '2026-03-26T18:00:04.000Z',
    discoveredAt: '2026-03-26T18:00:00.000Z',
  });
});

test('normalizeCigarworldNewsletterOffers keeps newsletter deals source-scoped and tagged by origin', () => {
  const normalizedDeals = normalizeCigarworldNewsletterOffers(parseCigarworldNewsletterMail(createInput()));

  assert.equal(normalizedDeals.length, 2);
  assert.equal(normalizedDeals[0]?.id, 'cigarworld:source-cigarworld-newsletter-weekly:64917');
  assert.equal(normalizedDeals[0]?.source.id, cigarworldNewsletterSource.id);
  assert.deepEqual(normalizedDeals[0]?.tags, [
    'cigarworld',
    'newsletter-mail',
    'price-drop',
    'available-now',
  ]);
});

test('registry runJob executes a self-contained newsletter-mail payload', async () => {
  const [job] = scraperRegistry.planJobs(
    [
      {
        merchant: cigarworldNewsletterMerchant,
        source: cigarworldNewsletterSource,
      },
    ],
    '2026-03-26T18:00:00.000Z',
  );

  assert.ok(job);
  assert.equal(job.origin, 'newsletter-mail');

  const result = await scraperRegistry.runJob({
    job,
    fetchedAt: '2026-03-26T18:00:04.000Z',
    contentType: 'text/html; charset=utf-8',
    payload,
  });

  assert.equal(result.normalizedDeals.length, 2);
  assert.equal(result.normalizedDeals[1]?.observation.availability, 'low-stock');
});
