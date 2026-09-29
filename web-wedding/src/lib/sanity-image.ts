// lib/sanity-image.ts
import type { SanityImageSource } from '@sanity/image-url';
import { urlFor } from '@/app/sanity/image';
import { safeImageSrc } from '@/lib/safe-url';

/**
 * Anything a hero photo can arrive as:
 * a raw Sanity image object straight from a `client.fetch` call, or an already
 * built CDN URL string (some data getters resolve the URL for us).
 */
export type ImageSource = SanityImageSource | null | undefined;

/** Widths used for the responsive `srcSet` of full-bleed hero photos. */
export const HERO_IMAGE_WIDTHS = [640, 960, 1280, 1600, 1920, 2400] as const;

/**
 * Builds one image URL.
 *
 * @returns a sanitised URL, or `undefined` when the value is missing, malformed or
 * uses a scheme we do not render. A bad image must never break a page: a malformed
 * object in the CMS used to throw inside the url builder and take the route down.
 */
export function sanityImage(source: ImageSource, width = 1920): string | undefined {
  if (!source) return undefined;

  // Strings are already-built URLs and go through the same allow-list as everything
  // else. Bare Sanity asset refs (`image-abc-1920x1080-jpg`) are not supported here.
  if (typeof source === 'string') return safeImageSrc(source);

  try {
    return safeImageSrc(urlFor(source).width(width).auto('format').url());
  } catch {
    return undefined;
  }
}

/**
 * Responsive `srcSet` so phones do not download a 2400px hero photo.
 * Returns `undefined` for values that already are a single fixed URL.
 */
export function sanityImageSrcSet(
  source: ImageSource,
  widths: readonly number[] = HERO_IMAGE_WIDTHS
): string | undefined {
  if (!source || typeof source === 'string') return undefined;

  try {
    const entries = widths
      .map((width) => {
        const url = sanityImage(source, width);
        return url ? `${url} ${width}w` : null;
      })
      .filter((entry): entry is string => Boolean(entry));

    return entries.length ? entries.join(', ') : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Honours the focal point an editor picked in Studio ("hotspot") as a CSS
 * `object-position`, so hero photos stay centred on the important part of the frame.
 *
 * Only finite numbers are read, so the result can never inject anything into `style`.
 */
export function imageObjectPosition(source: ImageSource): string | undefined {
  if (!source || typeof source === 'string') return undefined;

  const hotspot = (source as { hotspot?: { x?: unknown; y?: unknown } }).hotspot;
  if (!hotspot) return undefined;
  if (typeof hotspot.x !== 'number' || typeof hotspot.y !== 'number') return undefined;

  const toPercent = (value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    return `${Math.round(clamped * 100)}%`;
  };

  return `${toPercent(hotspot.x)} ${toPercent(hotspot.y)}`;
}