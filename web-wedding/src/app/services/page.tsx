import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { getServices } from '@/lib/data';

export const metadata = {
  title: 'Services — Wedding Planning with Diana | Ottawa',
  description:
    'Full-service planning, partial planning, and day-of coordination. Every option means you work with Diana, personally — not an agency.',
};

export default function ServicesPage() {
  const services = getServices();

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] w-full overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.pexels.com/photos/16120230/pexels-photo-16120230.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Elegant wedding reception with floral arrangements and candlelit tables"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-accent/10" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-20">
          <p className="text-white/80 text-xs md:text-sm uppercase tracking-wide-lg mb-6">
            Services
          </p>
          <h1 className="font-serif text-white text-4xl md:text-6xl lg:text-7xl font-normal leading-tight text-balance">
            How we can <span className="font-script font-normal">work</span> together
          </h1>
        </div>
      </section>

      {/* Overview */}
      <section className="py-28 md:py-40 bg-background">
        <div className="container-narrow text-center">
          <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
            The Overview
          </p>
          <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-8 text-balance">
            Three service levels, one promise: you work with me, personally.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Whether you need someone from day one or just someone to run the day itself,
            every option includes direct access to me — not a team, not an associate, not a
            project manager. I intentionally keep my calendar small so every couple gets
            the attention they deserve.
          </p>
        </div>
      </section>

      {/* Detailed Services */}
      <section className="pb-28 md:pb-40 bg-background">
        <div className="container-wide space-y-24 md:space-y-36">
          {services.map((service, i) => (
            <div
              key={service.slug}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center ${i % 2 === 1 ? 'lg:grid-flow-dense' : ''
                }`}
            >
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="aspect-[4/3] overflow-hidden rounded-sm shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.image}
                    alt={service.imageAlt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-serif text-5xl text-accent/25 leading-none">
                    0{i + 1}
                  </span>
                  {service.startingPrice && (
                    <span className="text-xs uppercase tracking-wide-lg text-accent bg-accent/10 px-4 py-1.5">
                      {service.startingPrice}
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-6">
                  {service.name}
                </h2>
                <p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed mb-8">
                  {service.fullDescription}
                </p>
                <div className="space-y-3 mb-10">
                  {service.includes.map((item, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80 font-light">{item}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-10 py-3 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Enquire About This
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="py-28 md:py-36 bg-secondary/40">
        <div className="container-wide">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
              At a Glance
            </p>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight text-balance">
              Which level is right for you?
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="py-4 px-4 text-xs uppercase tracking-wide text-muted-foreground font-sans font-light">
                    What&apos;s Included
                  </th>
                  {services.map((s) => (
                    <th key={s.slug} className="py-4 px-4 text-center font-serif text-lg">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm font-light">
                {[
                  { label: 'Personal consultations', values: ['Unlimited', '2/month', '1 (6 weeks prior)'] },
                  { label: 'Venue scouting', values: ['Yes', '—', '—'] },
                  { label: 'Vendor sourcing', values: ['Yes', 'Recommendations', 'Confirm existing'] },
                  { label: 'Design & styling direction', values: ['Full', 'Review', '—'] },
                  { label: 'Budget management', values: ['Full tracking', 'Review', '—'] },
                  { label: 'Day-of timeline', values: ['Yes', 'Yes', 'Yes'] },
                  { label: 'Rehearsal direction', values: ['Yes', 'Yes', 'Yes'] },
                  { label: 'Day-of coordination', values: ['With assistant', 'With assistant', 'With assistant'] },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-4 px-4 text-muted-foreground">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="py-4 px-4 text-center text-foreground/80">
                        {v === 'Yes' ? (
                          <Check className="w-4 h-4 text-accent mx-auto" />
                        ) : v === '—' ? (
                          <span className="text-muted-foreground/40">—</span>
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-muted-foreground font-medium">Starting at</td>
                  {services.map((s) => (
                    <td key={s.slug} className="py-4 px-4 text-center font-serif text-accent">
                      {s.startingPrice}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container-narrow text-center">
          <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-8 text-balance">
            Not sure which level you need?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg font-light mb-10 max-w-xl mx-auto leading-relaxed">
            That&apos;s exactly what our first conversation is for. Tell me about your wedding
            and I&apos;ll help you figure out the right fit — even if it turns out to be
            another planner.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Let&apos;s Talk
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
