import type { MerchantReference, SourceReference } from '@rauchbar/deals-core';

export const cigarworldMerchant: MerchantReference = {
  id: 'merchant-cigarworld',
  slug: 'cigarworld',
  displayName: 'Cigarworld',
  countryCode: 'DE',
  baseUrl: 'https://www.cigarworld.de',
  active: true,
};

export const cigarworldSources: SourceReference[] = [
  {
    id: 'source-cigarworld-sonderposten',
    merchantId: cigarworldMerchant.id,
    adapterKind: 'html',
    label: 'Cigarworld Sonderposten Zigarren',
    endpoint: 'https://www.cigarworld.de/shop/sonderposten/zigarren',
    active: true,
  },
  {
    id: 'source-cigarworld-neuheiten',
    merchantId: cigarworldMerchant.id,
    adapterKind: 'html',
    label: 'Cigarworld Neuheiten Zigarren',
    endpoint: 'https://www.cigarworld.de/shop/neuheiten/zigarren',
    active: true,
  },
];

export function listCrawlerWorkItems(): Array<{
  merchant: MerchantReference;
  source: SourceReference;
}> {
  return cigarworldSources.map((source) => ({
    merchant: cigarworldMerchant,
    source,
  }));
}
