import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LuArrowRight as ArrowRight, LuArrowLeft as ArrowLeft, LuMapPin as MapPin, LuCalendar as Calendar } from 'react-icons/lu';
import { getAlbum, getAlbums, getSiteSettings } from '@/lib/sanity-data';
import { safeCanonicalUrl } from '@/lib/safe-url';
import HeroSection from '@/components/ui/HeroSection';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { GALLERY_IMAGE_WIDTHS } from '@/lib/sanity-image';

// ISR: album edits appear within this window, no redeploy needed.
export const revalidate = 1800;

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
  const description = album.seo?.metaDescription || (album.story || album.title).slice(0, 160);
  // Album cover doubles as the share image when the editor set none.
  const image = album.seo?.ogImage || album.coverImage || settings?.seo?.ogImage;
  // Only an absolute http(s) URL may become a canonical — see safe-url.ts.
  const url = safeCanonicalUrl(album.seo?.canonicalUrl);

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

  return (
    <>
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
                {album.date}
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
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 lg:gap-8">
            {album.photos.map((photo) => (
              <figure
                // `_key` from the Studio, so an edited gallery cannot reshuffle
                // (and re-mount) the photos that follow the edit.
                key={photo.id}
                // `cv-auto` on every photo, not only the ones whose size is
                // known: `contain-intrinsic-size` keeps the column in place if a
                // photo has no usable dimensions (see globals.css).
                className="group relative mb-6 overflow-hidden rounded-sm shadow-sm break-inside-avoid cv-auto lg:mb-8"
                style={
                  photo.width && photo.height
                    ? { aspectRatio: `${photo.width} / ${photo.height}` }
                    : undefined
                }
              >
                <ResponsiveImage
                  source={photo.src}
                  // src, srcSet and the pixel size are precomputed in
                  // `mapAlbum` — this render only formats them.
                  srcSet={photo.srcSet}
                  width={photo.width}
                  height={photo.height}
                  alt={photo.alt}
                  sizes="(min-width: 1024px) min(33vw, 24rem), (min-width: 640px) 50vw, 100vw"
                  widths={GALLERY_IMAGE_WIDTHS}
                  className="w-full h-auto"
                />
                {photo.caption && (
                  <figcaption className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white text-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-20 md:py-24 bg-secondary/40 border-t border-border/50">
        <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground hover:text-accent transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            All Weddings
          </Link>
          <Link
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