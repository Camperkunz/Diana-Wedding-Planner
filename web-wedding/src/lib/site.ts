/**
 * The one place that knows the public address of the website.
 *
 * Nothing else hard-codes a domain: canonical tags, `og:url` and every other
 * absolute URL on the site read it from here. Set `NEXT_PUBLIC_SITE_URL` as a
 * *build* variable in the Cloudflare dashboard (Worker -> Settings -> Variables
 * and Secrets) and every URL follows — no code change, no redeploy of the content.
 *
 * There is deliberately NO built-in production domain:
 *  - in development the address falls back to http://localhost:3000;
 *  - a production build without a valid value fails fast, so a forgotten
 *    variable can never ship wrong canonical/og URLs.
 */
const LOCALHOST_FALLBACK = 'http://localhost:3000';

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
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL is not set. Provide the public origin of the site ' +
        '(e.g. https://example.com) before building for production.'
    );
  }

  return LOCALHOST_FALLBACK;
}

export const SITE_URL = resolveSiteUrl();

/** Turns an in-app path (`/about`) into a full URL (`https://…/about`). */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Search-engine indexing switch. On by default; set `NEXT_PUBLIC_ALLOW_INDEXING=false`
 * (e.g. on a staging/workers.dev deployment) to serve `noindex` meta tags and a
 * `Disallow: /` robots.txt with no code change.
 */
export const ALLOW_INDEXING = process.env.NEXT_PUBLIC_ALLOW_INDEXING?.trim().toLowerCase() !== 'false';
