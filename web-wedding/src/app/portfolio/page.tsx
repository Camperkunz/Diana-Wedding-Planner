import Link from 'next/link';
import { LuArrowRight as ArrowRight } from 'react-icons/lu';
import {
    getAlbums,
    getPortfolioPage,
    buildSeoMetadata,
} from '@/lib/sanity-data';
import HeroSection from '@/components/ui/HeroSection';

const fallback = {};

export async function generateMetadata() {
    const page = await getPortfolioPage();
    return buildSeoMetadata(
        page?.seo,
        'Portfolio — Weddings Planned by Diana | Ottawa'
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
            <HeroSection
                eyebrow={c.heroEyebrow}
                heading={c.heroHeading}
                image={c.heroImage}
                imageAlt={c.heroImageAlt}
            />

            {/* Portfolio Grid Section */}
            <section className="py-16 md:py-20 bg-background">
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
                                    <p className="text-white/70 text-sm uppercase tracking-wide mb-2">
                                        {album.category}
                                    </p>
                                    <h2 className="font-serif text-white text-3xl mb-1">
                                        {album.title}
                                    </h2>
                                    <p className="text-white/60 text-xs font-light">
                                        {album.venue} · {album.location}
                                    </p>
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