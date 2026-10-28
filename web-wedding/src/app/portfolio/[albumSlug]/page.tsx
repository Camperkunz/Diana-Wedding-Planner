import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LuArrowRight as ArrowRight, LuArrowLeft as ArrowLeft, LuMapPin as MapPin, LuCalendar as Calendar } from 'react-icons/lu';
import { getAlbum, getAlbums, getSiteSettings } from '@/lib/sanity-data';
import { safeCanonicalUrl } from '@/lib/safe-url';
import { absoluteUrl } from '@/lib/site';
import HeroSection from '@/components/ui/HeroSection';
import { ALBUM_PAGE_SIZE } from '@/lib/album-paging';
import AlbumGallery from '@/components/album-gallery';
import { JsonLd } from '@/components/json-ld';
import { BUSINESS_ID, breadcrumbList } from '@/lib/structured-data';

/** Photos listed in the ImageGallery markup (the gallery itself pages further). */
const JSON_LD_PHOTOS = 12;

/**
 * Fallback description when the editor wrote neither an SEO description nor a
 * story: names the couple, the kind of wedding, the place and the planner.
 */
function albumFallbackDescription(album: { title: string; category?: string; venue?: string; location?: string }) {
  const place = [album.venue, album.location].filter(Boolean).join(', ');
  return [
    album.title,
    album.category?.trim() ? ` — ${album.category.trim()}` : ' — wedding',
    place ? ` at ${place}` : '',
    ', planned by Diana Voloshina, Ottawa wedding planner.',
  ].join('');
}

/** A machine-readable date for <time>, only when the value is ISO (YYYY-MM-DD). */
function isoDate(value?: string) {
  return value && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : undefined;
}

// ISR: album edits appear within this window, no redeploy needed.
export const revalidate = 21600;

export function generateStaticParams() {
  return getAlbums().then((albums) => albums.map((album) => ({ albumSlug: album.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ albumSlug: string }>;
}): Promise<Metadata> {
  const { albumSlug } = await params;
  const [album, settings] = await Promise.all([getAlbum(albumSlug), getSiteSettings()]);
  if (!album) return { title: 'Album Not Found' };

  const title =
    album.seo?.metaTitle ||
    `${album.title}${album.category ? ` — ${album.category}` : ''} | Diana, Ottawa Wedding Planner`;
  const description =
    album.seo?.metaDescription || (album.story || albumFallbackDescription(album)).slice(0, 160);
  // Album cover doubles as the share image when the editor set none.
  const image = album.seo?.ogImage || album.coverImage || settings?.seo?.ogImage;
  // Only an absolute http(s) URL may become a canonical — see safe-url.ts. When
  // the editor set none, the album canonicalises to itself, so tracking
  // parameters and the www host are not indexed as separate albums.
  const url =
    safeCanonicalUrl(album.seo?.canonicalUrl) ||
    absoluteUrl(`/portfolio/${encodeURIComponent(albumSlug)}`);

  // openGraph/twitter are always present — omitting them would wipe the
  // site-wide tags inherited from the root layout (Next.js replaces the whole
  // object per key, it does not merge field by field).
  return {
    title,
    description,
    alternates: url ? { canonical: url } : undefined,
    robots: album.seo?.noIndex ? { index: false, follow: !album.seo?.noFollow } : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: settings?.name || undefined,
      locale: 'en_CA',
      url,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ albumSlug: string }>;
}) {
  const { albumSlug } = await params;
  const album = await getAlbum(albumSlug);
  if (!album) notFound();

  const path = `/portfolio/${encodeURIComponent(albumSlug)}`;
  const jsonLd = [
    breadcrumbList([
      ['Home', '/'],
      ['Portfolio', '/portfolio'],
      [album.title, path],
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: album.title,
      url: absoluteUrl(path),
      description: album.story?.slice(0, 300) || albumFallbackDescription(album),
      dateCreated: isoDate(album.date),
      contentLocation: album.venue || album.location
        ? { '@type': 'Place', name: [album.venue, album.location].filter(Boolean).join(', ') }
        : undefined,
      author: { '@id': BUSINESS_ID },
      image: album.photos.slice(0, JSON_LD_PHOTOS).map((photo) => ({
        '@type': 'ImageObject',
        contentUrl: photo.src,
        caption: photo.caption || photo.alt || undefined,
        width: photo.width,
        height: photo.height,
      })),
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* Hero */}
      <HeroSection
        eyebrow={album.category}
        heading={album.title}
        image={album.coverImage}
        imageAlt={album.coverImageAlt || album.title}
      >
        {album.date || album.venue || album.location ? (
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 mt-6 text-white/90 text-sm">
            {album.date ? (
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <time dateTime={isoDate(album.date)}>{album.date}</time>
              </span>
            ) : null}
            {album.venue || album.location ? (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                {[album.venue, album.location].filter(Boolean).join(', ')}
              </span>
            ) : null}
          </div>
        ) : null}
      </HeroSection>

      {/* Story — only when the editor actually wrote one; otherwise the page
          starts straight with the gallery. */}
      {album.story ? (
        <section className="py-16 md:py-20 bg-background">
          <div className="container-narrow">
            <div className="max-w-3xl mx-auto">
              <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
                The Story
              </p>
              <p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed">
                {album.story}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Gallery — CSS multi-column masonry: every photo keeps its own aspect
          ratio, so nothing is ever cropped and the browser downloads exactly
          the pixels that end up on screen. */}
      <section
        className={`pb-28 md:pb-40 bg-background${
          // With a story the section above already contributes its `py`
          // bottom spacing; without one the gallery would touch the hero, so
          // mirror that same gap here.
          album.story ? '' : ' pt-16 md:pt-20'
        }`}
      >
        <div className="container-wide">
          <AlbumGallery
            slug={albumSlug}
            initialPhotos={album.photos.slice(0, ALBUM_PAGE_SIZE)}
            total={album.photos.length}
          />
        </div>
      </section>

      {/* Navigation */}
      <section className="py-20 md:py-24 bg-secondary/40 border-t border-border/50">
        <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            prefetch={false}
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground hover:text-accent transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            All Weddings
          </Link>
          <Link
            prefetch={false}
            href="/contact"
            className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Plan Your Wedding
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}