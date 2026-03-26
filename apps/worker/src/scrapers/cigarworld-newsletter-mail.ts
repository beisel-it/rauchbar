import type {
  AvailabilityStatus,
  Money,
  NormalizedDealPayload,
  OfferObservation,
  ProductIdentity,
  SourceAdapterInput,
  SourceAdapterOutput,
  SourceReference,
  MerchantReference,
} from '@rauchbar/deals-core';

import {
  decodeHtmlEntities,
  extractAttribute,
  normalizeWhitespace,
  parseEuroAmountToCents,
  stripTags,
} from './html.ts';
import type { NewsletterMailScraper } from './types.ts';

const NEWSLETTER_CARD_PATTERN = /<table\s+class="newsletter-offer-card"[\s\S]*?<\/table>/gi;

function extractNewsletterText(block: string, className: string): string | undefined {
  const pattern = new RegExp(`<(?:div|td|span) class="${className}">([\\s\\S]*?)</(?:div|td|span)>`, 'i');
  const match = block.match(pattern);

  if (!match) {
    return undefined;
  }

  const text = normalizeWhitespace(decodeHtmlEntities(stripTags(match[1])));
  return text === '' ? undefined : text;
}

function inferAvailability(rawValue?: string): AvailabilityStatus {
  if (!rawValue) {
    return 'unknown';
  }

  const normalized = rawValue
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (
    normalized.includes('nicht verfugbar') ||
    normalized.includes('nicht verfuegbar') ||
    normalized.includes('ausverkauft')
  ) {
    return 'out-of-stock';
  }

  if (normalized.includes('wenige') || normalized.includes('restbestand')) {
    return 'low-stock';
  }

  if (normalized.includes('sofort') || normalized.includes('verfugbar') || normalized.includes('verfuegbar')) {
    return 'in-stock';
  }

  return 'unknown';
}

function inferQuantity(title: string): number {
  const quantityMatch = title.match(/\b(\d+)\s*(?:er|x)\b/i);
  return quantityMatch ? Number.parseInt(quantityMatch[1], 10) : 1;
}

function buildExternalId(listingUrl: string, cardId?: string): string | undefined {
  const trailingId = listingUrl.match(/_(\d+)(?:\/)?$/);

  if (trailingId) {
    return trailingId[1];
  }

  return cardId;
}

function moneyFromEurValue(rawValue: string): Money {
  return {
    amountCents: parseEuroAmountToCents(rawValue),
    currency: 'EUR',
  };
}

function summarizeDeal(productName: string, currentPrice: Money, previousPrice?: Money): string {
  const current = (currentPrice.amountCents / 100).toFixed(2);

  if (!previousPrice) {
    return `${productName} aktuell fuer ${current} EUR im Cigarworld Newsletter.`;
  }

  const previous = (previousPrice.amountCents / 100).toFixed(2);
  return `${productName} reduziert von ${previous} EUR auf ${current} EUR im Cigarworld Newsletter.`;
}

function availabilityTag(availability: AvailabilityStatus): string {
  switch (availability) {
    case 'in-stock':
      return 'available-now';
    case 'low-stock':
      return 'limited-stock';
    case 'out-of-stock':
      return 'sold-out';
    default:
      return 'availability-unknown';
  }
}

function parseOfferIdentity(offer: OfferObservation): { product: ProductIdentity; tags: string[] } {
  const title = offer.title;
  const words = title.split(/\s+/).filter(Boolean);
  const brand = words[0] ?? 'Unknown';
  const productName = title.startsWith(`${brand} `) ? title.slice(brand.length).trim() : title;

  return {
    product: {
      brand,
      productName,
      quantity: inferQuantity(title),
      limitedEdition: false,
    },
    tags: [
      'cigarworld',
      'newsletter-mail',
      offer.previousPrice ? 'price-drop' : 'special-offer',
      availabilityTag(offer.availability),
    ],
  };
}

export function parseCigarworldNewsletterMail(input: SourceAdapterInput): SourceAdapterOutput {
  const warnings: string[] = [];
  const observedOffers: OfferObservation[] = [];

  for (const match of input.payload.matchAll(NEWSLETTER_CARD_PATTERN)) {
    const cardMarkup = match[0];
    const href = extractAttribute(cardMarkup, /class="newsletter-offer-link"[^>]*href="([^"]+)"/i);
    const rawTitle = extractAttribute(cardMarkup, /class="newsletter-offer-link"[^>]*title="([^"]+)"/i);
    const imageUrl = extractAttribute(cardMarkup, /<img[^>]*src="([^"]+)"/i);
    const brand = extractNewsletterText(cardMarkup, 'brand');
    const productName = extractNewsletterText(cardMarkup, 'name');
    const availabilityLabel = extractNewsletterText(cardMarkup, 'availability');
    const currentPriceRaw = extractNewsletterText(cardMarkup, 'current-price');
    const previousPriceRaw = extractNewsletterText(cardMarkup, 'previous-price');
    const cardId = extractAttribute(cardMarkup, /data-offer-id="([^"]+)"/i);

    if (!href || !rawTitle || !brand || !productName || !currentPriceRaw) {
      warnings.push(`Skipped malformed Cigarworld newsletter card '${decodeHtmlEntities(rawTitle ?? 'unknown')}'`);
      continue;
    }

    observedOffers.push({
      externalId: buildExternalId(href, cardId),
      title: normalizeWhitespace(decodeHtmlEntities(rawTitle)),
      listingUrl: href,
      imageUrl,
      currentPrice: moneyFromEurValue(currentPriceRaw),
      previousPrice: previousPriceRaw ? moneyFromEurValue(previousPriceRaw) : undefined,
      availability: inferAvailability(availabilityLabel),
      observedAt: input.fetchedAt,
      discoveredAt: input.requestedAt,
    });
  }

  if (observedOffers.length === 0) {
    warnings.push('No Cigarworld newsletter offers were parsed from the provided payload.');
  }

  return {
    merchant: input.merchant,
    source: input.source,
    observedOffers,
    warnings,
  };
}

export function normalizeCigarworldNewsletterOffers(output: SourceAdapterOutput): NormalizedDealPayload[] {
  return output.observedOffers.map((offer) => {
    const parsed = parseOfferIdentity(offer);
    const id = `${output.merchant.slug}:${output.source.id}:${offer.externalId ?? offer.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    return {
      id,
      merchant: output.merchant,
      source: output.source,
      product: parsed.product,
      observation: offer,
      summary: summarizeDeal(parsed.product.productName, offer.currentPrice, offer.previousPrice),
      normalizationStatus: 'normalized',
      reviewStatus: 'pending',
      lifecycleStatus: 'normalized',
      tags: parsed.tags,
      publication: {
        channels: [],
      },
    };
  });
}

export const cigarworldNewsletterMerchant: MerchantReference = {
  id: 'merchant-cigarworld',
  slug: 'cigarworld',
  displayName: 'Cigarworld',
  countryCode: 'DE',
  baseUrl: 'https://www.cigarworld.de',
  active: true,
};

export const cigarworldNewsletterSource: SourceReference = {
  id: 'source-cigarworld-newsletter-weekly',
  merchantId: cigarworldNewsletterMerchant.id,
  adapterKind: 'html',
  label: 'Cigarworld Newsletter Weekly HTML',
  endpoint: 'mailbox://cigarworld/newsletter/weekly',
  active: true,
};

export const cigarworldNewsletterMailScraper: NewsletterMailScraper = {
  id: 'cigarworld-newsletter-mail',
  merchantSlug: 'cigarworld',
  displayName: 'Cigarworld newsletter mail scraper',
  origin: 'newsletter-mail',
  supports(source: SourceReference, merchant?: MerchantReference): boolean {
    return (
      source.adapterKind === 'html' &&
      merchant?.slug === 'cigarworld' &&
      source.endpoint.startsWith('mailbox://cigarworld/newsletter/')
    );
  },
  async scrape(input: SourceAdapterInput) {
    const adapterOutput = parseCigarworldNewsletterMail(input);

    return {
      adapterOutput,
      normalizedDeals: normalizeCigarworldNewsletterOffers(adapterOutput),
    };
  },
};
