import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
    getAlbums,
    getPortfolioPage,
    sanityImage,
    buildSeoMetadata,
} from '@/lib/sanity-data';

const fallback = {
    heroEyebrow: 'Portfolio',
    heroHeadingScript: 'Weddings',
    heroHeadingRest: "I've planned",
    heroImage:
        'https://images.pexels.com/photos/28613084/pexels-photo-28613084.jpeg?auto=compress&cs=tinysrgb&w=1920',
    heroImageAlt:
        'Outdoor wedding venue with elegant decorations and lake view',
    introText:
        'Every wedding below was planned personally — from first consultation to final toast. Click any album to see the full gallery and the story behind the day.',
    ctaHeading: 'Want yours to be next?',
    ctaButtonLabel: 'Get in Touch',
    ctaButtonLink: '/contact',
};

export async function generateMetadata() {
    const page = await getPortfolioPage();
    return buildSeoMetadata(
        page?.seo,
        'Portfolio — Weddings Planned by Diana | Ottawa',
        fallback.introText
    );
}

export default async function PortfolioPage() {
    const [page, albums] = await Promise.all([
        getPortfolioPage(),
        getAlbums(),
    ]);

    const c = { ...fallback, ...(page || {}) } as typeof fallback &
        Record<string, any>;

    return (
        <>
            {/* Hero Section */}
            <section className="relative h-[50vh] min-h-[350px] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={sanityImage(c.heroImage) || fallback.heroImage}
                        alt={c.heroImageAlt}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-accent/10" />
                </div>
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-20">
                    <p className="text-white/80 text-xs md:text-sm uppercase tracking-wide-lg mb-6">
                        {c.heroEyebrow}
                    </p>
                    <h1 className="font-serif text-white text-4xl md:text-6xl lg:text-7xl font-normal leading-tight text-balance">
                        <span className="font-script font-normal">
                            {c.heroHeadingScript}
                        </span>{' '}
                        {c.heroHeadingRest}
                    </h1>
                </div>
            </section>

            {/* Portfolio Grid Section */}
            <section className="py-28 md:py-40 bg-background">
                <div className="container-wide">
                    <p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed max-w-2xl mb-16">
                        {c.introText}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                        {albums.map((album) => (
                            <Link
                                key={album.slug}
                                href={`/portfolio/${album.slug}`}
                                className="group relative aspect-[4/5] overflow-hidden rounded-sm hover:shadow-xl transition-all duration-500"
                            >
                                <img
                                    src={album.coverImage}
                                    alt={album.coverImageAlt || album.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent group-hover:from-black/85 transition-all duration-500" />
                                <div className="absolute bottom-0 left-0 right-0 p-7">
                                    <p className="text-white/70 text-xs uppercase tracking-wide mb-2">
                                        {album.category}
                                    </p>
                                    <h2 className="font-serif text-white text-2xl mb-1">
                                        {album.title}
                                    </h2>
                                    <p className="text-white/60 text-xs font-light">
                                        {album.venue} · {album.location}
                                    </p>
                                    <span className="inline-flex items-center gap-2 mt-4 text-xs uppercase tracking-wide text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        View Gallery
                                        <ArrowRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 md:py-32 bg-secondary/40">
                <div className="container-narrow text-center">
                    <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-8 text-balance">
                        {c.ctaHeading}
                    </h2>
                    <Link
                        href={c.ctaButtonLink}
                        className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        {c.ctaButtonLabel}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </>
    );
}