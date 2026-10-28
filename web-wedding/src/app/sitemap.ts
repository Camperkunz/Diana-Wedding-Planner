import type { MetadataRoute } from 'next';
import { client } from '@/app/sanity/client';
import { sanityFetchOptions } from '@/lib/sanity-tags';
import { sanityImage, type ImageSource } from '@/lib/sanity-image';
import { absoluteUrl } from '@/lib/site';

// Re-rendered hourly. Album edits do not force a sitemap rebuild (the webhook
// deliberately skips it — see app/api/revalidate/route.ts), so a new album shows
// up here within the hour while its page is already live via on-demand ISR.
export const revalidate = 3600;

/** Static routes and the Studio document whose last edit dates each of them. */
const STATIC_PAGES: [path: string, type: string][] = [
  ['/', 'homePage'],
  ['/portfolio', 'portfolioPage'],
  ['/services', 'servicesPage'],
  ['/about', 'aboutPage'],
  ['/faq', 'faqPage'],
  ['/backstage', 'backstagePage'],
  ['/contact', 'contactPage'],
  ['/privacy', 'privacyPolicy'],
];

type AlbumRow = {
  slug?: string;
  _updatedAt?: string;
  images?: (ImageSource | null)[];
};

/** How many gallery photos per album go into the image sitemap. */
const SITEMAP_IMAGES_PER_ALBUM = 6;

/**
 * Next writes sitemap values into the XML verbatim — no escaping at all (see
 * `resolve-route-data.js`). Sanity image URLs carry `&auto=format`, which is
 * invalid XML unescaped, so every value goes through this first.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let albums: AlbumRow[] = [];
  const pageUpdatedAt = new Map<string, string>();
  try {
    const pages: { _type: string; _updatedAt: string }[] =
      (await client.fetch(
        `*[_type in $types]{ _type, _updatedAt }`,
        { types: STATIC_PAGES.map(([, type]) => type) },
        sanityFetchOptions(...STATIC_PAGES.map(([, type]) => type))
      )) || [];
    // Newest edit wins when a type has more than one document.
    for (const page of pages) {
      const known = pageUpdatedAt.get(page._type);
      if (!known || page._updatedAt > known) pageUpdatedAt.set(page._type, page._updatedAt);
    }
  } catch (error) {
    console.error('Sitemap: could not load page dates from Sanity.', error);
  }

  try {
    albums =
      (await client.fetch(
        // Albums the editor hid from search engines are left out, exactly like
        // their `noindex` meta tag. The cover (or the first gallery photo) plus
        // the first few gallery images feed the image sitemap, which is what
        // actually brings wedding-photo traffic from Google Images.
        `*[_type == "album" && defined(slug.current) && seo.noIndex != true]{
          "slug": slug.current,
          _updatedAt,
          "images": array::compact([
            coalesce(coverImage, photos[defined(image.asset)][0].image)
          ]) + photos[defined(image.asset)][0...$imageLimit].image
        }`,
        { imageLimit: SITEMAP_IMAGES_PER_ALBUM },
        sanityFetchOptions('album')
      )) || [];
  } catch (error) {
    // Never fail the whole sitemap because the CMS hiccuped.
    console.error('Sitemap: could not load albums from Sanity.', error);
  }

  return [
    ...STATIC_PAGES.map(([path, type]) => {
      const updatedAt = pageUpdatedAt.get(type);
      return {
        url: escapeXml(absoluteUrl(path)),
        lastModified: updatedAt ? new Date(updatedAt) : undefined,
        priority: path === '/' ? 1 : 0.7,
      };
    }),
    ...albums
      .filter((album): album is Required<Pick<AlbumRow, 'slug'>> & AlbumRow => Boolean(album.slug))
      .map((album) => {
        const images = [
          ...new Set(
            (album.images || [])
              .map((image) => sanityImage(image, 1200))
              .filter((url): url is string => Boolean(url))
          ),
        ];

        return {
          url: escapeXml(absoluteUrl(`/portfolio/${encodeURIComponent(album.slug)}`)),
          lastModified: album._updatedAt ? new Date(album._updatedAt) : undefined,
          priority: 0.6,
          ...(images.length ? { images: images.map(escapeXml) } : {}),
        };
      }),
  ];
}
