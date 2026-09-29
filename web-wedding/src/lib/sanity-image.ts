// lib/sanity-image.ts
import { urlFor } from '@/app/sanity/image';

export function sanityImage(source: any, width = 1920) {
    if (!source) return undefined;

    // TEMPORARY: keeps pages that still pass a ready URL string working.
    // Delete this line once every image comes from Sanity.
    if (typeof source === 'string') return source;

    return urlFor(source).width(width).auto('format').url();
}