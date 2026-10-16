/**
 * Allow-list based URL helpers.
 *
 * Every value that reaches an `href` or `src` on this site is authored in Sanity
 * Studio, i.e. it is editable content, not code. React escapes attributes for us,
 * but content still has to be treated as untrusted input:
 *
 *  - `javascript:` / `data:` / `vbscript:` targets must never reach an anchor
 *    (a Studio paste would otherwise be stored XSS waiting for a click),
 *  - a malformed value must degrade to *nothing* instead of breaking a hero photo
 *    (`src=""` makes the browser re-request the current page),
 *  - links opened in a new tab must carry `rel="noopener noreferrer"`
 *    so the target page cannot reach back through `window.opener`
 *    (reverse tabnabbing).
 *
 * Only the shapes this site actually uses are allowed: same-origin paths,
 * `http(s)` URLs, `mailto:` and `tel:`. Everything else is rejected.
 */

/**
 * Browsers ignore control characters while parsing URLs, so `java\nscript:alert(1)`
 * is executed as `javascript:alert(1)`. Strip them before inspecting a value.
 */
const CONTROL_CHARS = /[\u0000-\u001f\u007f-\u009f]/g;

/** Root-relative same-origin path. `//evil.com` and `/\evil.com` are protocol-relative, not paths. */
const SAME_ORIGIN_PATH = /^\/(?![/\\])/;

/** Protocol-relative URL pointing at a plausible host, e.g. `//cdn.sanity.io/images/...`. */
const PROTOCOL_RELATIVE = /^\/\/[a-z0-9-]+(\.[a-z0-9-]+)+(?=[/?#]|$)/i;

/** Deliberately narrow `mailto:` shape — no headers, no query injection (`?body=`). */
const MAILTO = /^mailto:[^\s:,;<>"'?&]+@[^\s:,;<>"'?&]+\.[a-z]{2,}$/i;

/** `tel:` with digits, spaces and the usual punctuation only. */
const TEL = /^tel:\+?[0-9().\-\s]{5,20}$/;

/** Removes control characters and surrounding whitespace from a candidate URL. */
export function normalizeUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(CONTROL_CHARS, '').trim();
}

/** Lower-cased scheme (`https`, `mailto`, …) or `null` for relative URLs. */
export function getUrlScheme(value: string): string | null {
  const match = /^([a-z][a-z0-9+.\-]*):/i.exec(value);
  return match ? match[1].toLowerCase() : null;
}

/** `true` when the value is a safe `src` for an `<img>`/`<iframe>` on this site. */
export function isSafeImageSrc(value: unknown): boolean {
  const url = normalizeUrl(value);
  if (!url) return false;
  if (SAME_ORIGIN_PATH.test(url) || PROTOCOL_RELATIVE.test(url)) return true;

  const scheme = getUrlScheme(url);
  return scheme === 'https' || scheme === 'http';
}

/**
 * Sanitised image URL.
 *
 * @returns the normalised URL, or `undefined` when it is missing, malformed or uses
 * a scheme we do not render (`data:`, `blob:`, `javascript:`, …).
 */
export function safeImageSrc(value: unknown): string | undefined {
  const url = normalizeUrl(value);
  return isSafeImageSrc(url) ? url : undefined;
}

export type SafeLinkTarget = {
  /** Sanitised target, always safe to place in an `href`. */
  href: string;
  /** `true` for another site — render with `target="_blank" rel="noopener noreferrer"`. */
  isExternal: boolean;
  /** `true` for in-app links (`/about`, `/`, `#anchor`) — render with `next/link`. */
  isInternal: boolean;
};

function resolveFallback(fallback: string): SafeLinkTarget {
  const url = normalizeUrl(fallback);

  if (SAME_ORIGIN_PATH.test(url) || url.startsWith('#')) {
    return { href: url, isExternal: false, isInternal: true };
  }

  const scheme = getUrlScheme(url);
  if (scheme === 'https' || scheme === 'http') {
    return { href: url, isExternal: true, isInternal: false };
  }

  return { href: '/', isExternal: false, isInternal: true };
}

/**
 * Validates a link coming from the CMS and tells the caller how to render it.
 *
 * @param value   Raw href from content (or from a component default).
 * @param fallback Same-origin fallback used when `value` is empty or not allowed.
 */
export function safeLinkTarget(value: unknown, fallback = '/'): SafeLinkTarget {
  const url = normalizeUrl(value);
  if (!url) return resolveFallback(fallback);

  if (url.startsWith('#')) return { href: url, isExternal: false, isInternal: true };
  if (SAME_ORIGIN_PATH.test(url)) return { href: url, isExternal: false, isInternal: true };
  if (MAILTO.test(url) || TEL.test(url)) return { href: url, isExternal: false, isInternal: false };

  const scheme = getUrlScheme(url);
  if (scheme === 'https' || scheme === 'http') {
    return { href: url, isExternal: true, isInternal: false };
  }

  return resolveFallback(fallback);
}

/**
 * Builds a `mailto:` href from an e-mail address stored in the CMS.
 *
 * @returns the href, or `undefined` when the address looks unsafe — the caller then
 * renders the address as plain text instead of a link.
 */
export function safeMailtoHref(email: unknown): string | undefined {
  const value = normalizeUrl(email);
  if (!value) return undefined;

  const href = `mailto:${value}`;
  return MAILTO.test(href) ? href : undefined;
}

/**
 * Builds a `tel:` href from a phone number stored in the CMS.
 *
 * @returns the href, or `undefined` when the value looks unsafe — the caller then
 * renders the number as plain text instead of a link.
 */
export function safeTelHref(phone: unknown): string | undefined {
  const value = normalizeUrl(phone);
  if (!value) return undefined;

  const href = `tel:${value}`;
  return TEL.test(href) ? href : undefined;
}

/**
 * Sanitised canonical URL for `<link rel="canonical">` and the Open Graph `url`.
 *
 * A relative or malformed value in `seo.canonicalUrl` can deindex or misattribute
 * a page, so only absolute `http(s)` URLs are ever emitted.
 *
 * @returns the normalised URL, or `undefined` when it is missing or not an
 * absolute http(s) URL — the caller then omits the canonical tag entirely.
 */
export function safeCanonicalUrl(value: unknown): string | undefined {
  const url = normalizeUrl(value);
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
  } catch {
    return undefined;
  }

  return url;
}
