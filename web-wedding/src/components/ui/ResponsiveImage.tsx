import type { CSSProperties } from 'react';
import {
  CONTENT_IMAGE_WIDTHS,
  imageDimensions,
  imageObjectPosition,
  sanityImage,
  sanityImageSrcSet,
  type ImageSource,
} from '@/lib/sanity-image';

type ResponsiveImageProps = {
  /** Raw Sanity image object, or a URL that a data getter already resolved. */
  source: ImageSource | string;
  alt?: string | null;
  /**
   * How wide the photo is rendered on screen — this is what lets the browser
   * pick a small file for a phone. Think of it as "the width of the box", e.g.
   * `(min-width: 1024px) 33vw, 100vw`.
   */
  sizes?: string;
  widths?: readonly number[];
  blur?: number;
  className?: string;
  style?: CSSProperties;
  /** Above the fold: load immediately with high priority. */
  priority?: boolean;
  /** Overrides the hotspot position stored in the Studio. */
  objectPosition?: string;
};

/**
 * The one `<img>` used for photos that sit *inside* the page (cards, galleries,
 * the quote band). Full-bleed heroes use `HeroBackground`, which shares the same
 * URL builder.
 *
 * Every photo gets:
 *  - a responsive `srcSet`, so a phone never downloads a desktop-sized file,
 *  - `sizes`, so the browser knows which entry to use,
 *  - `width`/`height` where known, so the layout cannot shift while loading,
 *  - the hotspot the editor picked in the Studio as `object-position`.
 *
 * Photos are requested without a referrer (the page URL never leaks to the image
 * CDN) and render nothing at all when the value is missing or malformed — a bad
 * image can never break a page.
 */
export default function ResponsiveImage({
  source,
  alt,
  sizes = '100vw',
  widths = CONTENT_IMAGE_WIDTHS,
  blur,
  className,
  style,
  priority = false,
  objectPosition,
}: ResponsiveImageProps) {
  const dimensions = imageDimensions(source);
  const requestedWidth = widths[widths.length - 1] ?? 1920;
  const src = sanityImage(source, dimensions?.width ? Math.min(dimensions.width, requestedWidth) : requestedWidth, blur);
  if (!src) return null;

  const srcSet = sanityImageSrcSet(source, widths, blur);
  const position = objectPosition ?? imageObjectPosition(source);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt || ''}
      width={dimensions?.width}
      height={dimensions?.height}
      style={position ? { objectPosition: position, ...style } : style}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}
