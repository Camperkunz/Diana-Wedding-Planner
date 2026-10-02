/**
 * The one place that knows the public address of the website.
 *
 * Nothing else hard-codes a domain: canonical tags, `og:url`, the sitemap and
 * `robots.txt` all read it from here. When the real domain is connected, set
 * `NEXT_PUBLIC_SITE_URL` in the hosting dashboard (project → Settings →
 * Environment Variables) and every URL follows — no code change, no redeploy of
 * the content.
 */
const DEFAULT_SITE_URL = 'https://dianaweddings.ca';

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      // Normalises the value and drops any path/trailing slash:
      // `https://example.com/` → `https://example.com`.
      return new URL(configured).origin;
    } catch {
      // A malformed value must not break the build — fall back to the default.
    }
  }
  return DEFAULT_SITE_URL;
}

export const SITE_URL = resolveSiteUrl();

/** Turns an in-app path (`/about`) into a full URL (`https://…/about`). */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
