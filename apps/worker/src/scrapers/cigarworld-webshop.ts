import type {
  AvailabilityStatus,
  MerchantReference,
  Money,
  NormalizedDealPayload,
  OfferObservation,
  ProductIdentity,
  SourceAdapterInput,
  SourceAdapterOutput,
  SourceReference,
} from '@rauchbar/deals-core';

import {
  decodeHtmlEntities,
  extractAllTexts,
  extractAttribute,
  extractText,
  normalizeWhitespace,
  parseEuroAmountToCents,
} from './html.ts';
import type { WebshopScraper } from './types.ts';

type ParsedCigarworldCard = {
  externalId?: string;
  title: string;
  brand: string;
  productName: string;
  listingUrl: string;
  imageUrl?: string;
  currentPrice: Money;
  previousPrice?: Money;
  availability: AvailabilityStatus;
  observedAt: string;
  discoveredAt: string;
  tags: string[];
  quantity: number;
};

const PRODUCT_CARD_PATTERN = /<a\s+class="search-result-item-inner"[\s\S]*?<\/a>/gi;

function normalizeCigarworldListingUrl(href: string, merchant: MerchantReference): string {
  return new URL(href, merchant.baseUrl).toString();
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

function buildExternalId(listingUrl: string, remark?: string): string | undefined {
  const trailingId = listingUrl.match(/_(\d+)(?:\/)?$/);

  if (trailingId) {
    return trailingId[1];
  }

  if (remark && remark !== 'B-Ware') {
    return remark;
  }

  return undefined;
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
    return `${productName} aktuell fuer ${current} EUR bei Cigarworld.`;
  }

  const previous = (previousPrice.amountCents / 100).toFixed(2);
  return `${productName} reduziert von ${previous} EUR auf ${current} EUR bei Cigarworld.`;
}

export function parseCigarworldWebshopHtml(input: SourceAdapterInput): SourceAdapterOutput {
  const warnings: string[] = [];
  const observedOffers: OfferObservation[] = [];

  for (const match of input.payload.matchAll(PRODUCT_CARD_PATTERN)) {
    const cardMarkup = match[0];
    const href = extractAttribute(cardMarkup, /href="([^"]+)"/i);
    const rawTitle = extractAttribute(cardMarkup, /title="([^"]+)"/i);
    const brand = extractText(cardMarkup, 'brand');
    const productName = extractText(cardMarkup, 'name');
    const currentPriceRaw = extractAttribute(cardMarkup, /<span data-eurval="([^"]+)">/i);

    if (!href || !rawTitle || !brand || !productName || !currentPriceRaw) {
      warnings.push(`Skipped malformed Cigarworld card '${decodeHtmlEntities(rawTitle ?? 'unknown')}'`);
      continue;
    }

    const remark = extractText(cardMarkup, 'remark');
    const imagePath = extractAttribute(cardMarkup, /data-src="([^"]+)"/i);
    const availabilityLabel = extractAttribute(cardMarkup, /item-availability[^>]*title="([^"]+)"/i);
    const previousPriceRaw = extractAttribute(
      cardMarkup,
      /<del class="altpreis"><span data-eurval="([^"]+)">/i,
    );
    const tags = extractAllTexts(cardMarkup, /<span class="product-badge[^"]*">([\s\S]*?)<\/span>/gi).map((tag) =>
      tag.toLowerCase().replace(/\s+/g, '-'),
    );
    const listingUrl = normalizeCigarworldListingUrl(href, input.merchant);

    observedOffers.push({
      externalId: buildExternalId(listingUrl, remark),
      title: normalizeWhitespace(decodeHtmlEntities(rawTitle)),
      listingUrl,
      imageUrl: imagePath ? new URL(imagePath, input.merchant.baseUrl).toString() : undefined,
      currentPrice: moneyFromEurValue(currentPriceRaw),
      previousPrice: previousPriceRaw ? moneyFromEurValue(previousPriceRaw) : undefined,
      availability: inferAvailability(availabilityLabel),
      observedAt: input.fetchedAt,
      discoveredAt: input.requestedAt,
    });

    if (tags.length === 0) {
      warnings.push(`Offer '${productName}' had no product badges.`);
    }
  }

  if (observedOffers.length === 0) {
    warnings.push('No Cigarworld webshop offers were parsed from the provided payload.');
  }

  return {
    merchant: input.merchant,
    source: input.source,
    observedOffers,
    warnings,
  };
}

export function normalizeCigarworldOffers(output: SourceAdapterOutput): NormalizedDealPayload[] {
  return output.observedOffers.map((offer) => {
    const parsed = parseOfferIdentity(offer);
    const id = `${output.merchant.slug}:${output.source.id}:${offer.externalId ?? slugify(offer.title)}`;

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

function parseOfferIdentity(offer: OfferObservation): { product: ProductIdentity; tags: string[] } {
  const title = offer.title;
  const brand = extractLeadingBrand(title);
  const productName = title.startsWith(`${brand} `) ? title.slice(brand.length).trim() : title;
  const tags = [
    'cigarworld',
    'webshop',
    offer.previousPrice ? 'price-drop' : 'special-offer',
    availabilityTag(offer.availability),
  ];

  return {
    product: {
      brand,
      productName,
      quantity: inferQuantity(title),
      limitedEdition: false,
    },
    tags,
  };
}

function extractLeadingBrand(title: string): string {
  const words = title.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return 'Unknown';
  }

  if (words.length === 1) {
    return words[0];
  }

  return words[0];
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const cigarworldWebshopScraper: WebshopScraper = {
  id: 'cigarworld-webshop',
  merchantSlug: 'cigarworld',
  displayName: 'Cigarworld webshop scraper',
  origin: 'webshop',
  supports(source: SourceReference, merchant?: MerchantReference): boolean {
    return (
      source.adapterKind === 'html' &&
      merchant?.slug === 'cigarworld' &&
      source.endpoint.includes('cigarworld.de')
    );
  },
  async scrape(input: SourceAdapterInput) {
    const adapterOutput = parseCigarworldWebshopHtml(input);

    return {
      adapterOutput,
      normalizedDeals: normalizeCigarworldOffers(adapterOutput),
    };
  },
};
