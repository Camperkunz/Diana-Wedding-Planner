import type { MetadataRoute } from 'next';
import { client } from '@/app/sanity/client';
import { sanityFetchOptions } from '@/lib/sanity-tags';
import { ALLOW_INDEXING, absoluteUrl } from '@/lib/site';

// Refreshed by the Sanity webhook (album tag + path); this is the safety net.
export const revalidate = 3600;

const STATIC_PATHS = ['/', '/portfolio', '/services', '/about', '/faq', '/backstage', '/contact', '/privacy'];

type AlbumRow = { slug?: string; _updatedAt?: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!ALLOW_INDEXING) return [];

  let albums: AlbumRow[] = [];
  try {
    albums =
      (await client.fetch(
        `*[_type == "album" && defined(slug.current) && seo.noIndex != true]{ "slug": slug.current, _updatedAt }`,
        {},
        sanityFetchOptions('album')
      )) || [];
  } catch (error) {
    // Never fail the whole sitemap because the CMS hiccuped.
    console.error('Sitemap: could not load albums from Sanity.', error);
  }

  return [
    ...STATIC_PATHS.map((path) => ({
      url: absoluteUrl(path),
      priority: path === '/' ? 1 : 0.7,
    })),
    ...albums
      .filter((album): album is Required<AlbumRow> => Boolean(album.slug))
      .map((album) => ({
        url: absoluteUrl(`/portfolio/${encodeURIComponent(album.slug)}`),
        lastModified: album._updatedAt ? new Date(album._updatedAt) : undefined,
        priority: 0.6,
      })),
  ];
}
