import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * Tells crawlers what they may index and where the sitemap lives.
 *
 * Nothing is disallowed: every route on this site is public marketing content.
 * `/backstage` and the album pages are included deliberately.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
