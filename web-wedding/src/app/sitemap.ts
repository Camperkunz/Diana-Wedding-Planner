import type { MetadataRoute } from 'next';
import { getAlbums } from '@/lib/sanity-data';
import { absoluteUrl } from '@/lib/site';

// Every top-level route of the marketing site. Kept as a plain list on purpose:
// a route only belongs here once it really exists, so this never advertises a
// URL that would 404.
const STATIC_ROUTES = [
  '/',
  '/about',
  '/services',
  '/portfolio',
  '/faq',
  '/backstage',
  '/contact',
] as const;

/**
 * One entry for the home page, every static route and every published album.
 *
 * `lastModified` is "now" for static routes because their content can change at
 * any time through the Studio (the site revalidates every 60 seconds) — a real
 * per-page timestamp is not available without a build-time full render.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A Sanity hiccup must not break the sitemap: the static routes still go out.
  const albums = await getAlbums().catch(() => []);
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));

  const albumEntries: MetadataRoute.Sitemap = albums
    .filter((album) => album.slug)
    .map((album) => ({
      url: absoluteUrl(`/portfolio/${album.slug}`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  return [...staticEntries, ...albumEntries];
}
