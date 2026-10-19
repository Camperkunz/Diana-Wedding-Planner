/**
 * Cache tags for Sanity reads.
 *
 * Every document type gets one tag (`sanity:album`, `sanity:service`, …) and every
 * query also carries the global `sanity:all` tag, so `/api/revalidate` can flush
 * either a single type after a webhook or the entire content layer when the
 * payload cannot be attributed to a type (deletes arrive without `_type`).
 *
 * OpenNext turns these into tag-cache entries (`open-next.config.ts`); without a
 * tag cache configured `revalidateTag()` writes nowhere and nothing is purged.
 */

/** Flushes every page that reads from Sanity. Keep it on every fetch. */
export const SANITY_ALL_TAG = 'sanity:all';

/** Tag for a single Sanity document type, e.g. `sanity:album`. */
export function sanityTag(type: string): string {
  return `sanity:${type}`;
}

/**
 * Third argument for `client.fetch`: `next: { tags }` is forwarded by
 * `@sanity/client` straight to `fetch`, which is what Next.js records the cache
 * entry under.
 *
 * @example client.fetch(query, { slug }, sanityFetchOptions('album'))
 */
export function sanityFetchOptions(...types: string[]): { next: { tags: string[] } } {
  return { next: { tags: [SANITY_ALL_TAG, ...new Set(types.map(sanityTag))] } };
}
