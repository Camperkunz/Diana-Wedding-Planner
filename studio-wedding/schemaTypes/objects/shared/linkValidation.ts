import type { StringRule } from 'sanity'

/**
 * Shared validation for free-text link fields (button links, menu destinations…).
 *
 * Sanity's `StringRule` has no `.uri()` — that method only exists on `url`-typed
 * fields — so this mirrors, at Studio level, exactly what the website's
 * `web-wedding/src/lib/safe-url.ts` will accept at render time. Anything the
 * consumer would silently replace with the site root is now a visible error in
 * the Studio instead of a dead link on the live site:
 *
 *  - `/about` — a site path (but not protocol-relative `//evil.com`),
 *  - `#team` — an in-page anchor,
 *  - `https://example.com` — an absolute http(s) URL,
 *  - `mailto:hello@example.com` / `tel:+16135550123` — direct contacts.
 *
 * A bare `about` or `www.example.com` (no leading slash, no scheme) is rejected:
 * it looks like a link but resolves nowhere.
 */
const SAME_ORIGIN_PATH = /^\/(?![/\\])/
const MAILTO = /^mailto:[^\s:,;<>"'?&]+@[^\s:,;<>"'?&]+\.[a-z]{2,}$/i
const TEL = /^tel:\+?[0-9().\-\s]{5,20}$/

const LINK_ERROR =
  'Use a page path starting with "/" (e.g. /contact), an anchor like "#team", ' +
  'or a full URL like "https://example.com".'

export function validLink(rule: StringRule): StringRule {
  return rule.custom((value) => {
    if (!value || !value.trim()) return true
    const target = value.trim()

    if (target.startsWith('#') || SAME_ORIGIN_PATH.test(target)) return true
    if (MAILTO.test(target) || TEL.test(target)) return true

    try {
      const url = new URL(target)
      return url.protocol === 'http:' || url.protocol === 'https:' || LINK_ERROR
    } catch {
      return LINK_ERROR
    }
  })
}
