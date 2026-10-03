import Link from 'next/link';
import { LuArrowRight as ArrowRight, LuHeart as Heart, LuCheck as Check } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import {
  getHomePage,
  getSiteSettings,
  getAlbums,
  getServices,
  buildSeoMetadata,
} from '@/lib/sanity-data';
import { TestimonialsSection } from '@/components/testimonials-section';
import { StatsSection } from '@/components/stats-section';
import { FadeIn } from '@/components/fade-in';
import HeroSection, { HeroBackground, buildHeading } from '@/components/ui/HeroSection';
import SafeLink from '@/components/ui/SafeLink';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { safeMailtoHref } from '@/lib/safe-url';

const fallback = {};

export async function generateMetadata() {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()]);

  // Page SEO first, site-wide SEO as the base: the home page doubles as the
  // default social preview for the whole website. Always returns complete
  // openGraph/twitter blocks (see buildSeoMetadata).
  return buildSeoMetadata(
    home?.seo || settings?.seo,
    'Diana — Wedding Planner in Ottawa | Personal, Hands-On Wedding Planning',
    'Independent, personal wedding planning in Ottawa.'
  );
}

export default async function Home() {
  const [cms, settings, sanityAlbums, sanityServices] = await Promise.all([
    getHomePage(),
    getSiteSettings(),
    getAlbums(),
    getServices(),
  ]);

  const content = {
    ...fallback,
    ...Object.fromEntries(
      Object.entries(cms || {}).filter(
        ([, value]) => value !== null && value !== undefined
      )
    ),
  } as typeof fallback & Record<string, any>;

  const services = content.featuredServices?.length
    ? content.featuredServices
    : sanityServices.filter((service: any) => service.featured).slice(0, 3);

  const albums = content.featuredAlbums?.length
    ? content.featuredAlbums
    : sanityAlbums.slice(0, 4);

  const steps = content.approachSteps?.length
    ? content.approachSteps
    : [];

  const testimonials = content.testimonials?.length
    ? content.testimonials
    : [];

  const stats = content.stats?.length ? content.stats : [];
  const aboutParagraphs = content.aboutParagraphs?.length
    ? content.aboutParagraphs
    : [];
  const emailHref = safeMailtoHref(settings?.email);

  return (
    <>
      {/* HERO */}
      <HeroSection
        size="fullscreen"
        eyebrow={content.heroEyebrow}
        heading={content.heroHeading}
        description={content.heroDescription}
        image={content.heroImage}
        imageAlt={content.heroImageAlt}
        actions={
          <>
            <SafeLink
              href={content.heroPrimaryButtonLink}
              fallbackHref="/contact"
              className="inline-flex items-center justify-center text-center bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {content.heroPrimaryButtonLabel || 'Get in Touch'}
            </SafeLink>

            <SafeLink
              href={content.heroSecondaryButtonLink}
              fallbackHref="/services"
              className="inline-flex items-center justify-center text-center border border-white/50 text-white px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-white/10 transition-all duration-300"
            >
              {content.heroSecondaryButtonLabel || 'View Services'}
            </SafeLink>
          </>
        }
      >
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
          <div className="w-px h-12 bg-white/40 mx-auto" />
        </div>
      </HeroSection>

      {/* ABOUT */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <FadeIn className="order-2 lg:order-1">
            <div>
              <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
                {content.aboutEyebrow}
              </p>

              <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-8 text-balance">
                {content.aboutHeading}
              </h2>

              <div className="space-y-6 text-muted-foreground text-base md:text-lg font-light leading-relaxed">
                {aboutParagraphs.map((paragraph: string, i: number) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <Link
                href={content.aboutLink || '/about'}
                className="inline-flex items-center gap-2 mt-10 text-sm uppercase tracking-wide text-accent hover:gap-4 transition-all duration-300"
              >
                {content.aboutLinkLabel || 'More about Diana'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={150} className="order-1 lg:order-2">
            <div className="relative w-3/4 mx-auto">
              <div className="overflow-hidden rounded-sm shadow-md">
                <ResponsiveImage
                  source={content.aboutImage1}
                  alt={content.aboutImage1Alt}
                  sizes="(min-width: 1024px) 34vw, (min-width: 768px) 60vw, 75vw"
                  widths={[480, 768, 1024, 1440]}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>

              <div className="absolute -bottom-10 -left-6 hidden sm:block w-[45%] overflow-hidden rounded-sm border-[8px] border-background lg:-left-12">
                <ResponsiveImage
                  source={content.aboutImage2}
                  alt={content.aboutImage2Alt}
                  sizes="(min-width: 1024px) 15vw, (min-width: 640px) 30vw, 60vw"
                  widths={[320, 480, 768, 1024]}
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* STATS */}
      <FadeIn>
        <StatsSection
          stats={stats}
        />
      </FadeIn>

      {/* SERVICES */}
      <section className="py-28 md:py-40 bg-background">
        <div className="container-wide">
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6 lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
                  {content.servicesEyebrow}
                </p>

                <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-4 text-balance">
                  {content.servicesHeading}
                </h2>

                <p className="text-muted-foreground text-base md:text-base font-light leading-relaxed max-w-xl">
                  {content.servicesDescription}
                </p>
              </div>

              <Link
                href={content.servicesButtonLink}
                className="inline-flex items-center gap-2 border border-accent text-accent px-8 py-3 text-sm uppercase tracking-wide hover:bg-accent hover:text-accent-foreground transition-all duration-300 shrink-0 w-fit self-start md:self-center"
              >
                {content.servicesButtonLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
            {services.map((service: any, i: number) => (
              <FadeIn key={service._id || i} delay={i * 150}>
                <Link
                  href="/services"
                  className="group flex flex-col h-full"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-sm mb-4 relative">
                    <ResponsiveImage
                      source={service.image}
                      alt={service.imageAlt || service.name}
                      sizes="(min-width: 768px) 33vw, 100vw"
                      widths={[480, 768, 1024, 1440]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <span className="font-serif text-2xl md:text-3xl text-accent/70 leading-none shrink-0">
                    0{i + 1}
                  </span>

                  <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-4 group-hover:text-accent transition-colors duration-300">
                    {service.name}
                  </h3>

                  <p className="text-muted-foreground text-lg md:text-base font-light leading-relaxed mb-5">
                    {service.shortDescription}
                  </p>

                  <div className="w-full h-px bg-border/60 mb-5" />

                  <ul className="space-y-2.5 mb-6">
                    {(service.includes || [])
                      .slice(0, 4)
                      .map((item: string, j: number) => (
                        <li
                          key={j}
                          className="flex items-start gap-3 text-base md:text-sm text-foreground/80 font-light"
                        >
                          <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                  </ul>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <ResponsiveImage
            source={content.quoteImage}
            alt={content.quoteImageAlt}
            sizes="100vw"
            widths={[768, 1024, 1440, 1920]}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <FadeIn>
            <Heart className="w-8 h-8 text-white/50 mx-auto mb-8" aria-hidden="true" />

            <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed text-balance italic text-white/95 font-normal">
              &ldquo;{content.quoteText}&rdquo;
            </blockquote>

            <p className="font-script text-3xl text-white/90 mt-8">
              {content.quoteAuthor}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section className="py-28 md:py-40 bg-background">
        <div className="container-wide">
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
                  {content.portfolioEyebrow}
                </p>

                <h2 className="font-serif text-3xl md:text-5xl leading-tight text-balance">
                  {content.portfolioHeading}
                </h2>
              </div>

              <Link
                href={content.portfolioButtonLink}
                className="inline-flex items-center gap-2 text-sm uppercase tracking-wide text-accent hover:gap-4 transition-all duration-300"
              >
                {content.portfolioButtonLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {albums.map((album: any, i: number) => (
              <FadeIn
                key={album._id || i}
                delay={i * 100}
                className={cn(
                  i === 0
                    ? 'sm:col-span-2 lg:col-span-2'
                    : 'sm:col-span-1'
                )}
              >
                <Link
                  href={
                    album.slug
                      ? `/portfolio/${album.slug}`
                      : '/portfolio'
                  }
                  className={cn(
                    'group relative overflow-hidden rounded-sm hover:shadow-xl transition-all duration-500 block w-full',
                    i === 0
                      ? 'aspect-[16/10]'
                      : 'aspect-[16/10] sm:aspect-[4/5]'
                  )}
                >
                  <ResponsiveImage
                    source={album.coverImage}
                    alt={album.coverImageAlt || album.title}
                    sizes={
                      // Card 0 takes 2 of the 4 columns: full width below lg,
                      // half the grid from lg up — the old
                      // `(min-width: 640px) 50vw` told tablets (640-1023px) to
                      // fetch half the pixels they actually render. `min()`
                      // caps each value to the real column: `container-wide`
                      // stops at 80rem, so plain vw over-fetches on wide screens.
                      i === 0
                        ? '(min-width: 1024px) min(50vw, 37rem), 100vw'
                        : '(min-width: 1024px) min(25vw, 17.5rem), (min-width: 640px) 50vw, 100vw'
                    }
                    widths={[480, 768, 1024, 1440]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-7">
                    <p className="text-white/90 text-sm uppercase tracking-wide mb-1.5">
                      {album.category}
                    </p>

                    <h3 className="font-serif text-white text-2xl lg:text-3xl">
                      {album.title}
                    </h3>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section className="py-28 md:py-40 bg-secondary/40">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="lg:col-span-2">
              <FadeIn>
                <div className="mb-16">
                  <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
                    {content.approachEyebrow}
                  </p>

                  <h2 className="font-serif text-3xl md:text-5xl leading-tight text-balance">
                    {content.approachHeading}
                  </h2>
                </div>
              </FadeIn>

              <div>
                {steps.map((step: any, i: number) => (
                  <FadeIn key={i} delay={i * 100}>
                    {i > 0 && (
                      <div className="w-full h-px bg-border/60 my-10" />
                    )}

                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start group">
                      <div className="font-serif text-5xl md:text-6xl text-accent/60 leading-none shrink-0 w-16 md:w-24">
                        {step.number}
                      </div>

                      <div className="flex-1 pt-1">
                        <h3 className="font-serif text-2xl md:text-2xl mb-3 group-hover:text-accent transition-colors duration-300">
                          {step.title}
                        </h3>

                        <p className="text-muted-foreground text-base font-light leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <FadeIn delay={200} className="sticky top-28">
                <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md">
                  <ResponsiveImage
                    source={content.approachImage}
                    alt={content.approachImageAlt}
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    widths={[480, 768, 1024]}
                    className="w-full h-full object-cover"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <FadeIn>
        <TestimonialsSection
          eyebrow={content.testimonialsEyebrow}
          heading={content.testimonialsHeading}
          subtext={content.testimonialsSubtext}
          testimonials={testimonials}
        />
      </FadeIn>

      {/* CTA */}
      <section className="relative py-36 md:py-44 overflow-hidden bg-foreground">
        <HeroBackground image={content.ctaImage} imageAlt={content.ctaImageAlt} priority={false} />

        <div className="relative z-10 container-narrow text-center">
          <FadeIn>
            <p className="text-white/70 text-xs uppercase tracking-wide-lg mb-6">
              {content.ctaEyebrow}
            </p>

            <h2 className="font-serif text-white text-3xl md:text-5xl lg:text-6xl font-normal leading-tight mb-8 text-balance">
              {buildHeading(content.ctaHeading)}
            </h2>

            <p className="text-white/80 text-base md:text-lg font-light max-w-2xl mx-auto mb-12 leading-relaxed">
              {content.ctaDescription}
            </p>

            <Link
              href={content.ctaButtonLink || '/contact'}
              className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-4 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              {content.ctaButtonLabel || 'Start a Conversation'}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-white/70 text-sm mt-8 font-light">
              {content.ctaDirectContactText}{' '}
              {emailHref && (
                <a
                  href={emailHref}
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  {settings?.email}
                </a>
              )}
            </p>
          </FadeIn>
        </div>
      </section>
    </>
  );
}