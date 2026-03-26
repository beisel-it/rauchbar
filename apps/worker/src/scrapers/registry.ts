import type {
  MerchantReference,
  SourceAdapterInput,
  SourceReference,
} from '@rauchbar/deals-core';

import { cigarworldNewsletterMailScraper } from './cigarworld-newsletter-mail.ts';
import { cigarworldWebshopScraper } from './cigarworld-webshop.ts';
import type {
  RegisteredScraper,
  ScrapeJob,
  ScrapeJobPayload,
  ScrapeJobResult,
  ScraperOrigin,
} from './types.ts';

export type ScraperWorkItem = {
  merchant: MerchantReference;
  source: SourceReference;
};

function buildJobId(claimKey: string, requestedAt: string): string {
  return `${claimKey}:${requestedAt}`;
}

export class ScraperRegistry {
  readonly #scrapers: RegisteredScraper[];

  constructor(scrapers: RegisteredScraper[]) {
    const seenIds = new Set<string>();

    for (const scraper of scrapers) {
      if (seenIds.has(scraper.id)) {
        throw new Error(`Duplicate scraper id: ${scraper.id}`);
      }

      seenIds.add(scraper.id);
    }

    this.#scrapers = [...scrapers];
  }

  list(): RegisteredScraper[] {
    return [...this.#scrapers];
  }

  listByOrigin(origin: ScraperOrigin): RegisteredScraper[] {
    return this.#scrapers.filter((scraper) => scraper.origin === origin);
  }

  find(source: SourceReference, merchant?: MerchantReference): RegisteredScraper | undefined {
    return this.#scrapers.find((scraper) => scraper.supports(source, merchant));
  }

  planJobs(workItems: ScraperWorkItem[], requestedAt: string): ScrapeJob[] {
    return workItems.map(({ merchant, source }) => {
      const scraper = this.find(source, merchant);

      if (!scraper) {
        throw new Error(
          `No scraper registered for merchant '${merchant.slug}' and source '${source.id}' (${source.endpoint})`,
        );
      }

      const claimKey = `${merchant.id}:${source.id}`;

      return {
        id: buildJobId(claimKey, requestedAt),
        claimKey,
        origin: scraper.origin,
        merchant,
        source,
        requestUrl: source.endpoint,
        requestedAt,
      };
    });
  }

  async scrape(input: SourceAdapterInput): Promise<ScrapeJobResult> {
    const plannedJob = this.planJobs(
      [
        {
          merchant: input.merchant,
          source: input.source,
        },
      ],
      input.requestedAt,
    )[0];

    return this.runJob({
      job: plannedJob,
      fetchedAt: input.fetchedAt,
      contentType: input.contentType,
      payload: input.payload,
    });
  }

  async runJob(input: ScrapeJobPayload): Promise<ScrapeJobResult> {
    const scraper = this.find(input.job.source, input.job.merchant);

    if (!scraper) {
      throw new Error(
        `No scraper registered for merchant '${input.job.merchant.slug}' and source '${input.job.source.id}' (${input.job.source.endpoint})`,
      );
    }

    const sourceInput: SourceAdapterInput = {
      merchant: input.job.merchant,
      source: input.job.source,
      requestedAt: input.job.requestedAt,
      fetchedAt: input.fetchedAt,
      requestUrl: input.job.requestUrl,
      contentType: input.contentType,
      payload: input.payload,
    };
    const result = await scraper.scrape(sourceInput);

    return {
      job: input.job,
      ...result,
    };
  }
}

export const scraperRegistry = new ScraperRegistry([
  cigarworldWebshopScraper,
  cigarworldNewsletterMailScraper,
]);
