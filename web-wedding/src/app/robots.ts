import type { MetadataRoute } from 'next';
import { ALLOW_INDEXING, absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  if (!ALLOW_INDEXING) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
