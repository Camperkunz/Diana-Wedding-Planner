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

/**
 * Widths used for the responsive `srcSet` of full-bleed hero photos.
 * Capped at 1920 because the largest photo in the Studio is 2000px wide: a
 * 2400 entry would only make the CDN upscale (more bytes, no extra detail).
 */
export const HERO_IMAGE_WIDTHS = [640, 960, 1280, 1600, 1920] as const;

/** Widths used for photos that sit inside the page content (cards, galleries). */
export const CONTENT_IMAGE_WIDTHS = [480, 640, 800, 960, 1200, 1600, 1920] as const;

/**
 * Hero photo blur, baked into the CDN URL so the browser never runs a CSS
 * filter over a full-viewport image (that filter used to cost paint time on
 * every hero). Sanity accepts 0–100 but ignores values below 5 (verified:
 * blur=2..4 returns byte-identical image), so values used here start at 5.
 * 15 is the value the design was signed off with. Because the blur is part of
 * the URL, the CDN caches the result for 30 days — and a blurred file is ~40%
 * lighter than the sharp one (110 KB vs 172 KB at 1920px), so it helps the LCP
 * rather than hurting it. Lower it towards 5 for a crisper look.
 */
export const HERO_BLUR = 15;

/**
 * Appends the blur parameter to an already-built CDN URL (some data getters
 * resolve URLs to strings before they reach a component).
 */
function appendBlur(url: string, blur?: number): string {
  if (!blur) return url;
  return `${url}${url.includes('?') ? '&' : '?'}blur=${blur}`;
}

/** `…-2000x1333.webp` → 2000 × 1333: Sanity puts the original size in the file name. */
const ASSET_SIZE_IN_NAME = /-(\d{2,5})x(\d{2,5})\.[a-z0-9]+$/i;

function dimensionsFromUrl(url: string): { width: number; height: number } | undefined {
  const match = ASSET_SIZE_IN_NAME.exec(url.split('?')[0]);
  if (!match) return undefined;
  return { width: Number(match[1]), height: Number(match[2]) };
}

/**
 * Builds a `srcSet` for a photo URL that is already resolved.
 *
 * Only plain Sanity CDN images are rewritten, and only when the URL carries a
 * `w=` parameter and is not cropped (`h=` / `fit=`), so a square browser icon or
 * a cropped thumbnail can never be stretched. Entries wider than the uploaded
 * file are dropped — the CDN would only upscale them.
 */
function srcSetFromUrl(url: string, widths: readonly number[]): string | undefined {
  if (!/^https:\/\/cdn\.sanity\.io\/images\//.test(url)) return undefined;

  const [base, query = ''] = url.split('?');
  const params = new URLSearchParams(query);
  if (!params.has('w') || params.has('h') || params.has('fit')) return undefined;

  params.delete('w');
  const originalWidth = dimensionsFromUrl(base)?.width;
  const entries = widths
    .filter((width) => (originalWidth ? width <= originalWidth : true))
    .map((width) => {
      const sized = new URLSearchParams(params);
      sized.set('w', String(width));
      return `${base}?${sized.toString()} ${width}w`;
    });

  // Fewer than two entries means there is nothing responsive to say: the plain
  // `src` already covers it.
  return entries.length > 1 ? entries.join(', ') : undefined;
}

/**
 * Intrinsic size of a photo, used for the `width`/`height` attributes so the
 * browser reserves the space before the file arrives (no layout shift).
 * Available for resolved CDN URLs (the size is in the file name) and for raw
 * Sanity objects that were queried together with `asset->metadata.dimensions`.
 */
export function imageDimensions(
  source: ImageSource
): { width: number; height: number } | undefined {
  if (!source) return undefined;
  if (typeof source === 'string') return dimensionsFromUrl(source);

  const dimensions = (
    source as {
      asset?: { metadata?: { dimensions?: { width?: unknown; height?: unknown } } };
    }
  )?.asset?.metadata?.dimensions;

  if (typeof dimensions?.width === 'number' && typeof dimensions?.height === 'number') {
    return { width: dimensions.width, height: dimensions.height };
  }
  return undefined;
}

/**
 * Builds one image URL.
 *
 * @returns a sanitised URL, or `undefined` when the value is missing, malformed or
 * uses a scheme we do not render. A bad image must never break a page: a malformed
 * object in the CMS used to throw inside the url builder and take the route down.
 */
export function sanityImage(
  source: ImageSource,
  width = 1920,
  blur?: number,
  options?: { height?: number; fit?: 'crop' | 'clip' | 'fill' | 'scale' }
): string | undefined {
  if (!source) return undefined;

  // Strings are already-built URLs and go through the same allow-list as everything
  // else. Bare Sanity asset refs (`image-abc-1920x1080-jpg`) are not supported here.
  if (typeof source === 'string') {
    const safe = safeImageSrc(source);
    return safe ? appendBlur(safe, blur) : undefined;
  }

  try {
    let builder = urlFor(source).width(width);
    // `height` + `fit: 'crop'` is only used for the square browser icon.
    if (options?.height) builder = builder.height(options.height);
    if (options?.fit) builder = builder.fit(options.fit);
    if (blur) builder = builder.blur(blur);
    return safeImageSrc(builder.auto('format').url());
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
  widths: readonly number[] = HERO_IMAGE_WIDTHS,
  blur?: number
): string | undefined {
  if (!source) return undefined;

  // Already-built CDN URLs (album covers, service photos, the homepage quote…)
  // get a srcSet as well — see `srcSetFromUrl` below.
  if (typeof source === 'string') return srcSetFromUrl(source, widths);

  try {
    const entries = widths
      .map((width) => {
        const url = sanityImage(source, width, blur);
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