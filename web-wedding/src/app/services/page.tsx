import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import {
  getServices,
  getServicesPage,
  buildSeoMetadata,
  ComparisonRow,
} from '@/lib/sanity-data';
import HeroSection from '@/components/ui/HeroSection';
import { sanityImage } from '@/lib/sanity-image';

const fallback = {};

export async function generateMetadata() {
  const page = await getServicesPage();
  return buildSeoMetadata(page?.seo, 'Services — Wedding Planning with Diana | Ottawa');
}

export default async function ServicesPage() {
  const [page, services] = await Promise.all([getServicesPage(), getServices()]);
  const c = { ...fallback, ...(page || {}) } as typeof fallback & Record<string, any>;
  const comparisonRows: ComparisonRow[] = c.comparisonRows || [];

  return (
    <>
      {/* Hero */}
      <HeroSection
        eyebrow={c.heroEyebrow}
        heading={c.heroHeading}
        image={c.heroImage}
        imageAlt={c.heroImageAlt}
      />

      {/* Overview Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container-narrow text-center">
          <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
            {c.overviewEyebrow}
          </p>
          <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-8 text-balance">
            {c.overviewHeading}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            {c.overviewDescription}
          </p>
        </div>
      </section>

      {/* Services List Section */}
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
                  <img
                    src={sanityImage(service.image)}
                    alt={service.imageAlt || service.name}
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

      {/* Comparison Section */}
      {comparisonRows.length > 0 && services.length > 0 && (
        <section className="py-28 md:py-36 bg-secondary/40">
          <div className="container-wide">
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
                {c.comparisonEyebrow}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl leading-tight text-balance">
                {c.comparisonHeading}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="py-4 px-4 text-xs uppercase tracking-wide text-muted-foreground font-sans font-light">
                      What's Included
                    </th>
                    {services.map((s) => (
                      <th key={s._id} className="py-4 px-4 text-center font-serif text-lg">
                        {s.name}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="text-sm font-light">
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-4 px-4 text-muted-foreground">{row.label}</td>
                      {services.map((s) => {
                        const match = row.values?.find((v) => v.serviceId === s._id);
                        const value = match?.value;
                        return (
                          <td key={s._id} className="py-4 px-4 text-center text-foreground/80">
                            {value === 'Yes' ? (
                              <Check className="w-4 h-4 text-accent mx-auto" />
                            ) : !value || value === '—' ? (
                              <span className="text-muted-foreground/40">—</span>
                            ) : (
                              value
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  <tr className="border-b border-border/50">
                    <td className="py-4 px-4 text-muted-foreground font-medium">Starting at</td>
                    {services.map((s) => (
                      <td key={s._id} className="py-4 px-4 text-center font-serif text-accent">
                        {s.startingPrice}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      <section className="py-24 md:py-32 bg-background">
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