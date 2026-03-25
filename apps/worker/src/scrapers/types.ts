import type {
  MerchantReference,
  NormalizedDealPayload,
  SourceAdapterInput,
  SourceAdapterOutput,
  SourceReference,
} from '@rauchbar/deals-core';

export const scraperOrigins = ['newsletter-mail', 'webshop'] as const;
export type ScraperOrigin = (typeof scraperOrigins)[number];

export type ScraperParseResult = {
  adapterOutput: SourceAdapterOutput;
  normalizedDeals: NormalizedDealPayload[];
};

export type ScrapeJob = {
  id: string;
  claimKey: string;
  origin: ScraperOrigin;
  merchant: MerchantReference;
  source: SourceReference;
  requestUrl: string;
  requestedAt: string;
};

export type ScrapeJobPayload = {
  job: ScrapeJob;
  fetchedAt: string;
  contentType?: string;
  payload: string;
};

export type ScrapeJobResult = ScraperParseResult & {
  job: ScrapeJob;
};

export type RegisteredScraper<TOrigin extends ScraperOrigin = ScraperOrigin> = {
  id: string;
  merchantSlug: string;
  displayName: string;
  origin: TOrigin;
  supports(source: SourceReference, merchant?: MerchantReference): boolean;
  scrape(input: SourceAdapterInput): Promise<ScraperParseResult>;
};

export type NewsletterMailScraper = RegisteredScraper<'newsletter-mail'>;
export type WebshopScraper = RegisteredScraper<'webshop'>;
