import { SITE_URL, absoluteUrl } from '@/lib/site';

/**
 * schema.org builders shared by the pages (rendered through `JsonLd`).
 *
 * Every node points back at the same three entities by `@id`, so search
 * engines and AI answer engines read one connected graph instead of loose
 * fragments: the business, the website and Diana herself.
 */
export const BUSINESS_ID = `${SITE_URL}/#business`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const PERSON_ID = `${SITE_URL}/#diana`;

/**
 * `serviceArea` is authored as one line ("Ottawa · Gatineau · Eastern Ontario").
 * schema.org expects places, so it is split on `·`, `,`, `|` and `/`.
 */
export function areaServed(serviceArea?: string | null) {
  const places = (serviceArea || '')
    .split(/[·,|/]/)
    .map((place) => place.trim())
    .filter(Boolean);
  if (!places.length) return undefined;
  return places.map((name) => ({
    // "Eastern Ontario", "Ontario", "Quebec" are regions; everything else a city.
    '@type': /ontario|quebec|québec|region|county/i.test(name) ? 'AdministrativeArea' : 'City',
    name,
  }));
}

/** Home › … › current page. Each crumb is `[name, path]`. */
export function breadcrumbList(crumbs: [string, string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(([name, path], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  };
}

/**
 * Pulls a number out of a free-text price ("From $3,500", "$1 200+").
 * Returns `undefined` unless exactly one amount is present, so a range or a
 * sentence never produces a misleading `price`.
 */
export function parsePrice(text?: string | null): number | undefined {
  const amounts = (text || '').match(/\d[\d,\s]*(?:\.\d+)?/g);
  if (!amounts || amounts.length !== 1) return undefined;
  const value = Number(amounts[0].replace(/[,\s]/g, ''));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}
