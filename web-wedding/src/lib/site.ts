/**
 * The one place that knows the public address of the website.
 *
 * Nothing else hard-codes a domain: canonical tags, `og:url` and every other
 * absolute URL on the site read it from here.
 *
 * `NEXT_PUBLIC_SITE_URL` still wins (set it as a *build* variable in the
 * Cloudflare dashboard), but the production origin is now also baked in as a
 * fallback. A forgotten build variable used to ship the previous (dead) worker
 * domain in every canonical and in the JSON-LD, so the safe default is the
 * live domain rather than an error or a staging URL. In development the address
 * stays http://localhost:3000.
 */
const LOCALHOST_FALLBACK = 'http://localhost:3000';

/** The live site. Keep in sync with `wrangler.jsonc` (custom domain). */
const PRODUCTION_FALLBACK = 'https://dianavoloshina.com';

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    try {
      // Normalises the value and drops any path/trailing slash:
      // `https://example.com/` → `https://example.com`.
      return new URL(configured).origin;
    } catch {
      // A malformed value must never reach the metadata tags.
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'NEXT_PUBLIC_SITE_URL must be a valid absolute URL, e.g. https://example.com'
        );
      }
    }
  }

  if (process.env.NODE_ENV === 'production') return PRODUCTION_FALLBACK;

  return LOCALHOST_FALLBACK;
}

export const SITE_URL = resolveSiteUrl();

/** Turns an in-app path (`/about`) into a full URL (`https://…/about`). */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
