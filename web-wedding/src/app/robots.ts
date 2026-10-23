import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

/**
 * robots.txt for search engines.
 *
 * The site is publicly indexable since the move to dianavoloshina.com: crawling
 * is allowed everywhere except the API routes (the revalidation webhook is not
 * content), and the sitemap is advertised so Google/Bing find every page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
