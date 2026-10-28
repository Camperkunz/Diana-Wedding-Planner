import type { MetadataRoute } from 'next';
import { getSiteDesign, getSiteSettings } from '@/lib/sanity-data';
import { sanityImage } from '@/lib/sanity-image';

// Same freshness as the pages that rarely change; the Sanity webhook purges it
// earlier through the siteSettings/siteDesign tags.
export const revalidate = 21600;

/**
 * Web app manifest: name, colours and home-screen icons when the site is saved
 * to a phone. Icons are cut from the favicon uploaded in the Studio.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [settings, design] = await Promise.all([getSiteSettings(), getSiteDesign()]);
  const name = settings?.name || 'Diana — Wedding Planner';
  const background = design?.colors?.background || '#ffffff';

  return {
    name,
    short_name: name.length > 12 ? name.split(/\s+/)[0] : name,
    description: settings?.seo?.metaDescription || settings?.tagline || undefined,
    start_url: '/',
    display: 'browser',
    background_color: background,
    theme_color: background,
    icons: settings?.favicon
      ? [
          { src: settings.favicon, sizes: '96x96' },
          ...(settings.appleIcon ? [{ src: settings.appleIcon, sizes: '180x180' }] : []),
        ]
      : [],
  };
}
