import Link from 'next/link';
import { LuArrowRight as ArrowRight, LuHeart as Heart, LuAward as Award, LuMapPin as MapPin } from 'react-icons/lu';
import {
  getAboutPage,
  getSiteSettings,
  buildSeoMetadata
} from '@/lib/sanity-data';
import { sanityImage } from '@/lib/sanity-image';
import { getTestimonials, getStats } from '@/lib/data';
import { StatsSection } from '@/components/stats-section';
import HeroSection from '@/components/ui/HeroSection';

// Fallback data
const fallback = {};

export async function generateMetadata() {
  const page = await getAboutPage();
  return buildSeoMetadata(
    page?.seo,
    'About Diana — Ottawa Wedding Planner',
    'Meet Diana, an independent wedding planner based in Ottawa.'
  );
}

export default async function AboutPage() {
  const [page, settings] = await Promise.all([getAboutPage(), getSiteSettings()]);
  const c = { ...fallback, ...(page || {}) } as typeof fallback & Record<string, any>;

  const stats = c.stats?.length ? c.stats : getStats();
  const testimonials = c.testimonials?.length ? c.testimonials : getTestimonials();
  const paragraphs = String(c.storyParagraphs || '').split(/\n\s*\n/).filter(Boolean);
  const glance = c.glanceItems?.length ? c.glanceItems : [];
  const philosophy = c.philosophyItems?.length ? c.philosophyItems : [];

  return (
    <>
      {/* Hero */}
      <HeroSection
        eyebrow={c.heroEyebrow}
        heading={c.heroHeading}
        image={c.heroImage}
        imageAlt={c.heroImageAlt}
      />

      {/* Story Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
            {/* Story Text */}
            <div className="lg:col-span-2 space-y-8">
              <p className="text-xs uppercase tracking-wide-lg text-accent mb-4">
                {c.storyEyebrow}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-8 text-balance">
                {c.storyHeading}
              </h2>
              <div className="space-y-6 text-muted-foreground text-base md:text-lg font-light leading-relaxed">
                {paragraphs.map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {/* Sidebar Image & Glance Card */}
            <div className="space-y-8">
              <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md">
                <img
                  src={sanityImage(c.storyImage, 800)}
                  alt={c.storyImageAlt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="bg-secondary/40 rounded-sm p-8 border border-border/50">
                <p className="text-xs uppercase tracking-wide-lg text-accent mb-4">
                  {c.glanceEyebrow}
                </p>
                <ul className="space-y-4 text-sm text-muted-foreground font-light">
                  {glance.map((item: any, i: number) => {
                    const Icon =
                      item.icon === 'heart'
                        ? Heart
                        : item.icon === 'location'
                          ? MapPin
                          : Award;

                    return (
                      <li key={i} className="flex items-start gap-3">
                        <Icon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection
        stats={stats}
      />

      {/* Philosophy Section */}
      <section className="py-28 md:py-40 bg-secondary/40">
        <div className="container-narrow">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
              {c.philosophyEyebrow}
            </p>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight text-balance">
              {c.philosophyHeading}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            {philosophy.map((item: any, i: number) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="font-serif text-3xl text-accent/25 leading-none">
                  0{i + 1}
                </div>
                <h3 className="font-serif text-xl md:text-2xl leading-tight">
                  {item.title}
                </h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="py-24 md:py-32 bg-secondary/40">
        <div className="container-narrow text-center">
          <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-8 text-balance">
            {c.ctaHeading}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg font-light mb-10 max-w-xl mx-auto leading-relaxed">
            {c.ctaDescription}
          </p>
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