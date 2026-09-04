import Link from 'next/link';
import { ArrowRight, Quote, Heart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getStats,
  getServices,
  getFeaturedAlbums,
  getTestimonials,
  getProcessSteps,
  getSiteSettings,
} from '@/lib/data';

export default function Home() {
  const stats = getStats();
  const services = getServices();
  const albums = getFeaturedAlbums();
  const testimonials = getTestimonials();
  const steps = getProcessSteps();
  const settings = getSiteSettings();

  return (
    <>
      {/* ── 1. Hero ─────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.pexels.com/photos/16743493/pexels-photo-16743493.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Elegant outdoor wedding ceremony with white draped canopy and floral arrangements"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-900/80" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className="text-white/80 text-xs md:text-sm uppercase tracking-wide-lg mb-6 fade-in" style={{ animationDelay: '0.1s' }}>
            Ottawa · Independent Wedding Planner
          </p>
          <h1 className="font-serif text-white text-4xl md:text-6xl lg:text-7xl font-normal leading-[1.1] max-w-4xl text-balance fade-in-up" style={{ animationDelay: '0.2s' }}>
            Your wedding,
            <br />
            <span className="font-script text-accent font-normal">personally</span> planned.
          </h1>
          <p className="text-white text-base md:text-lg font-light mt-8 max-w-2xl leading-relaxed fade-in-up" style={{ animationDelay: '0.4s' }}>
            I&apos;m Diana — an independent wedding planner in Ottawa. Not an agency, not a team.
            Just me, from first consultation to final toast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-12 fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Link
              href="/contact"
              className="bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get in Touch
            </Link>
            <Link
              href="/services"
              className="border border-white/50 text-white px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-white/10 transition-all duration-300"
            >
              View Services
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block">
          <div className="w-px h-12 bg-white/40 mx-auto" />
        </div>
      </section>

      {/* ── 2. Meet Diana ──────────────────────── */}
      <section className="py-28 md:py-40 bg-background">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-2 lg:order-1">
            <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
              Hi, I&apos;m Diana
            </p>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-8 text-balance">
              The planner who picks up the phone — every time.
            </h2>
            <div className="space-y-6 text-muted-foreground text-base md:text-lg font-light leading-relaxed">
              <p>
                I&apos;ve been planning weddings in and around Ottawa for nearly a decade.
                Not because I stumbled into it — because I love the part where two people
                realize their day is actually happening, and it&apos;s exactly what they wanted.
              </p>
              <p>
                I work with a limited number of couples each year so that every wedding gets
                my full attention. When you email, I reply. When you call, I answer. When the
                day comes, I&apos;m the one standing in the back of the room making sure everything
                runs — not a coordinator I handed you off to six months ago.
              </p>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 mt-10 text-sm uppercase tracking-wide text-accent hover:gap-4 transition-all duration-300"
            >
              More about Diana
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="order-1 lg:order-2 grid grid-cols-2 gap-6">
            <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.pexels.com/photos/4968707/pexels-photo-4968707.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Diana writing in a planner at a marble table"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md mt-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.pexels.com/photos/9052841/pexels-photo-9052841.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Diana smiling with planning notes, exuding professionalism"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Stats Strip ──────────────────────── */}
      <section className="bg-secondary/50 py-20 md:py-24">
        <div className="container-wide">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="font-serif text-4xl md:text-5xl text-accent mb-3">
                  {stat.value}
                </p>
                <p className="text-xs md:text-sm uppercase tracking-wide text-muted-foreground font-light">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Services Preview ────────────────── */}
      <section className="py-28 md:py-40 bg-background">
        <div className="container-wide">
          {/* Left-aligned header with button on right */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
                What I Do
              </p>
              <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-4 text-balance">
                Three ways we can work together
              </h2>
              <p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed max-w-xl">
                From full-service planning to day-of coordination — every option means
                you work with me, personally.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 border border-accent text-accent px-8 py-3 text-sm uppercase tracking-wide hover:bg-accent hover:text-accent-foreground transition-all duration-300 shrink-0"
            >
              View All Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
            {services.map((service, i) => (
              <Link
                key={service.slug}
                href="/services"
                className="group flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-sm mb-6 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.image}
                    alt={service.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <span className="absolute top-4 left-4 font-serif text-3xl text-white/90 leading-none drop-shadow-md">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl mb-4 group-hover:text-accent transition-colors duration-300">
                  {service.name}
                </h3>
                <p className="text-muted-foreground text-sm font-light leading-relaxed mb-5">
                  {service.shortDescription}
                </p>
                {/* Thin divider between description and features */}
                <div className="w-full h-px bg-border/60 mb-5" />
                <ul className="space-y-2.5 mb-6">
                  {service.includes.slice(0, 4).map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/70 font-light">{item}</span>
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-accent mt-auto">
                  Learn More
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Diana's Quote (narrowed, reduced intensity) ─── */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.pexels.com/photos/31217382/pexels-photo-31217382.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Outdoor wedding ceremony with floral arch and white chairs"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-accent/55" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <Heart className="w-8 h-8 text-white/50 mx-auto mb-8" />
          <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed text-balance italic text-white/95 font-normal">
            &ldquo;I don&apos;t believe in cookie-cutter weddings. Every couple I work with
            gets a plan built around their story — not a template I&apos;ve used fifty times.
            That&apos;s the whole point of hiring one person instead of an agency.&rdquo;
          </blockquote>
          <p className="font-script text-3xl text-white/90 mt-8">— Diana</p>
        </div>
      </section>

      {/* ── 6. Portfolio Preview ───────────────── */}
      <section className="py-28 md:py-40 bg-background">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
                Recent Weddings
              </p>
              <h2 className="font-serif text-3xl md:text-5xl leading-tight text-balance">
                A few of my favourite days
              </h2>
            </div>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-wide text-accent hover:gap-4 transition-all duration-300"
            >
              See All Weddings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {albums.map((album, i) => (
              <Link
                key={album.slug}
                href={`/portfolio/${album.slug}`}
                className={cn(
                  'group relative overflow-hidden rounded-sm hover:shadow-xl transition-all duration-500',
                  i === 0 ? 'sm:col-span-2 lg:col-span-2 aspect-[16/10]' : 'aspect-[4/5]'
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={album.coverImage}
                  alt={album.coverImageAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-7">
                  <p className="text-white/70 text-xs uppercase tracking-wide mb-1.5">
                    {album.category}
                  </p>
                  <h3 className="font-serif text-white text-xl lg:text-2xl">
                    {album.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Approach / Philosophy (plain bg, dividers) ──── */}
      <section className="py-28 md:py-40 bg-secondary/40">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Left: steps */}
            <div className="lg:col-span-2">
              <div className="mb-16">
                <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
                  My Approach
                </p>
                <h2 className="font-serif text-3xl md:text-5xl leading-tight text-balance">
                  Why working with me is different
                </h2>
              </div>

              <div>
                {steps.map((step, i) => (
                  <div key={i}>
                    {/* Thin divider between steps */}
                    {i > 0 && <div className="w-full h-px bg-border/60 my-10" />}
                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start group">
                      <div className="font-serif text-5xl md:text-6xl text-accent/25 leading-none shrink-0 w-16 md:w-24">
                        {step.number}
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="font-serif text-xl md:text-2xl mb-3 group-hover:text-accent transition-colors duration-300">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground text-base font-light leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: photo */}
            <div className="hidden lg:block">
              <div className="sticky top-28 aspect-[3/4] overflow-hidden rounded-sm shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.pexels.com/photos/6953952/pexels-photo-6953952.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Diana working at a table with a notebook, focused and thoughtful"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Testimonials ─────────────────────── */}
      <section className="py-28 md:py-40 bg-background">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
              From Couples
            </p>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-4 text-balance">
              What they say after the last dance
            </h2>
            <p className="text-muted-foreground text-sm font-light">
              Placeholder testimonials — real quotes will replace these once the CMS is connected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {testimonials.map((t) => (
              <article
                key={t.id}
                className="flex flex-col"
              >
                <Quote className="w-8 h-8 text-accent/25 mb-6" />
                <p className="text-foreground/80 leading-relaxed flex-1 italic font-light text-lg">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-8 pt-5 border-t border-border/50">
                  <p className="font-serif text-lg">{t.author}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1 font-light">
                    {t.weddingType}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Final CTA (neutral gray overlay) ── */}
      <section className="relative py-36 md:py-44 overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.pexels.com/photos/5824565/pexels-photo-5824565.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Bride and groom sharing a kiss at their outdoor wedding ceremony"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/88 via-gray-900/82 to-gray-900/88" />
        </div>

        <div className="relative z-10 container-narrow text-center">
          <p className="text-white/70 text-xs uppercase tracking-wide-lg mb-6">
            Let&apos;s Begin
          </p>
          <h2 className="font-serif text-white text-3xl md:text-5xl lg:text-6xl font-normal leading-tight mb-8 text-balance">
            Your wedding deserves someone
            <br />
            who shows up — <span className="font-script text-accent font-normal">personally</span>.
          </h2>
          <p className="text-white/80 text-base md:text-lg font-light max-w-2xl mx-auto mb-12 leading-relaxed">
            If you&apos;re looking for a planner who will know your wedding inside and out
            by the time the doors open, let&apos;s talk. No pressure, no sales pitch — just
            a conversation about what you&apos;re dreaming up.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-4 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
          >
            Start a Conversation
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-white/50 text-sm mt-8 font-light">
            Or reach me directly at{' '}
            <a href={`mailto:${settings.email}`} className="text-white/80 hover:text-accent transition-colors">
              {settings.email}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
