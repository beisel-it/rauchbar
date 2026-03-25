const namedHtmlEntities: Record<string, string> = {
  amp: '&',
  apos: "'",
  auml: 'a',
  Auml: 'A',
  bdquo: '"',
  copy: '(c)',
  deg: 'deg',
  euro: 'EUR',
  gt: '>',
  hellip: '...',
  laquo: '"',
  ldquo: '"',
  lsquo: "'",
  lt: '<',
  mdash: '-',
  middot: ' ',
  nbsp: ' ',
  ndash: '-',
  ouml: 'o',
  Ouml: 'O',
  raquo: '"',
  rdquo: '"',
  reg: '(r)',
  rsquo: "'",
  shy: '',
  szlig: 'ss',
  thinsp: ' ',
  uuml: 'u',
  Uuml: 'U',
};

export function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_, entity: string) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }

    if (entity.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }

    return namedHtmlEntities[entity] ?? `&${entity};`;
  });
}

export function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, ' ');
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function extractText(block: string, className: string): string | undefined {
  const pattern = new RegExp(`<div class="${className}">([\\s\\S]*?)</div>`, 'i');
  const match = block.match(pattern);

  if (!match) {
    return undefined;
  }

  const text = normalizeWhitespace(decodeHtmlEntities(stripTags(match[1])));
  return text === '' ? undefined : text;
}

export function extractAttribute(block: string, pattern: RegExp): string | undefined {
  const match = block.match(pattern);
  return match?.[1];
}

export function extractAllTexts(block: string, pattern: RegExp): string[] {
  return [...block.matchAll(pattern)]
    .map((match) => normalizeWhitespace(decodeHtmlEntities(stripTags(match[1]))))
    .filter((text) => text.length > 0);
}

export function parseEuroAmountToCents(rawValue: string): number {
  const cleaned = rawValue.replace(/[^\d.,-]/g, '');
  const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned;
  const parsed = Number.parseFloat(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Unable to parse euro amount from '${rawValue}'`);
  }

  return Math.round(parsed * 100);
}
