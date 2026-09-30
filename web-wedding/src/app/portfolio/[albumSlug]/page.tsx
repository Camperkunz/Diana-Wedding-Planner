import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { getAlbum, getAlbums } from '@/lib/sanity-data';
import { sanityImage } from '@/lib/sanity-image';
import HeroSection from '@/components/ui/HeroSection';

export function generateStaticParams() {
  return getAlbums().then((albums) => albums.map((album) => ({ albumSlug: album.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ albumSlug: string }>;
}) {
  const { albumSlug } = await params;
  const album = await getAlbum(albumSlug);
  if (!album) return { title: 'Album Not Found' };
  return {
    title: album.seo?.metaTitle || `${album.title} — ${album.category} | Diana, Ottawa Wedding Planner`,
    description: album.seo?.metaDescription || (album.story || album.title).slice(0, 160),
    alternates: album.seo?.canonicalUrl ? { canonical: album.seo.canonicalUrl } : undefined,
    robots: album.seo?.noIndex ? { index: false, follow: !album.seo?.noFollow } : undefined,
    openGraph: album.seo?.ogImage ? { images: [sanityImage(album.seo.ogImage, 1200) || ''] } : undefined,
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

      {/* Story */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container-narrow">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
              The Story
            </p>
            <p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed">
              {album.story || ''}
            </p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="pb-28 md:pb-40 bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {album.photos.map((photo, i) => (
              <figure
                key={i}
                className={`group relative overflow-hidden rounded-sm shadow-sm ${i === 0 || i === 3 ? 'sm:col-span-2 aspect-[16/10]' : 'aspect-[4/5]'
                  }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
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