import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { getServices, getServicesPage, sanityImage, buildSeoMetadata, ComparisonRow } from '@/lib/sanity-data';

const fallback = {
  heroEyebrow: 'Services', heroHeadingLine1: 'How we can', heroHeadingScript: 'work', heroHeadingLine2: 'together',
  heroImage: 'https://images.pexels.com/photos/16120230/pexels-photo-16120230.jpeg?auto=compress&cs=tinysrgb&w=1920', heroImageAlt: 'Elegant wedding reception with floral arrangements and candlelit tables',
  overviewEyebrow: 'The Overview', overviewHeading: 'Three service levels, one promise: you work with me, personally.', overviewDescription: 'Whether you need someone from day one or just someone to run the day itself, every option includes direct access to me — not a team, not an associate, not a project manager. I intentionally keep my calendar small so every couple gets the attention they deserve.',
  comparisonEyebrow: 'At a Glance', comparisonHeading: 'Which level is right for you?',
  ctaHeading: 'Not sure which level you need?', ctaDescription: "That's exactly what our first conversation is for. Tell me about your wedding and I'll help you figure out the right fit — even if it turns out to be another planner.", ctaButtonLabel: "Let's Talk", ctaButtonLink: '/contact',
};

export async function generateMetadata() {
  const page = await getServicesPage();
  return buildSeoMetadata(page?.seo, 'Services — Wedding Planning with Diana | Ottawa', fallback.overviewDescription);
}

export default async function ServicesPage() {
  const [page, services] = await Promise.all([getServicesPage(), getServices()]);
  const content = { ...fallback, ...(page || {}) } as typeof fallback & Record<string, any>;
  const comparisonRows: ComparisonRow[] = content.comparisonRows || [];

  return <>
    <section className="relative h-[50vh] min-h-[350px] w-full overflow-hidden"><div className="absolute inset-0"><img src={sanityImage(content.heroImage) || fallback.heroImage} alt={content.heroImageAlt || fallback.heroImageAlt} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-accent/10" /></div><div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-20"><p className="text-white/80 text-xs md:text-sm uppercase tracking-wide-lg mb-6">{content.heroEyebrow}</p><h1 className="font-serif text-white text-4xl md:text-6xl lg:text-7xl font-normal leading-tight text-balance">{content.heroHeadingLine1} <span className="font-script font-normal">{content.heroHeadingScript}</span> {content.heroHeadingLine2}</h1></div></section>
    <section className="py-28 md:py-40 bg-background"><div className="container-narrow text-center"><p className="text-xs uppercase tracking-wide-lg text-accent mb-6">{content.overviewEyebrow}</p><h2 className="font-serif text-3xl md:text-5xl leading-tight mb-8 text-balance">{content.overviewHeading}</h2><p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">{content.overviewDescription}</p></div></section>
    <section className="pb-28 md:pb-40 bg-background"><div className="container-wide space-y-24 md:space-y-36">{services.map((service, i) => <div key={service.slug} className={`grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center ${i % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}><div className={i % 2 === 1 ? 'lg:order-2' : ''}><div className="aspect-[4/3] overflow-hidden rounded-sm shadow-md"><img src={service.image} alt={service.imageAlt || service.name} className="w-full h-full object-cover" loading="lazy" /></div></div><div className={i % 2 === 1 ? 'lg:order-1' : ''}><div className="flex items-center gap-4 mb-6"><span className="font-serif text-5xl text-accent/25 leading-none">0{i + 1}</span>{service.startingPrice && <span className="text-xs uppercase tracking-wide-lg text-accent bg-accent/10 px-4 py-1.5">{service.startingPrice}</span>}</div><h2 className="font-serif text-3xl md:text-4xl leading-tight mb-6">{service.name}</h2><p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed mb-8">{service.fullDescription}</p><div className="space-y-3 mb-10">{service.includes.map((item, j) => <div key={j} className="flex items-start gap-3"><Check className="w-5 h-5 text-accent shrink-0 mt-0.5" /><span className="text-sm text-foreground/80 font-light">{item}</span></div>)}</div><Link href="/contact" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-10 py-3 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-sm hover:shadow-md">Enquire About This<ArrowRight className="w-4 h-4" /></Link></div></div>)}</div></section>
    {comparisonRows.length > 0 && services.length > 0 && (
      <section className="py-28 md:py-36 bg-secondary/40">
        <div className="container-wide">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">{content.comparisonEyebrow}</p>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight text-balance">{content.comparisonHeading}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="py-4 px-4 text-xs uppercase tracking-wide text-muted-foreground font-sans font-light">What's Included</th>
                  {services.map(s => <th key={s._id} className="py-4 px-4 text-center font-serif text-lg">{s.name}</th>)}
                </tr>
              </thead>
              <tbody className="text-sm font-light">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-4 px-4 text-muted-foreground">{row.label}</td>
                    {services.map(s => {
                      const match = row.values?.find(v => v.serviceId === s._id);
                      const value = match?.value;
                      return (
                        <td key={s._id} className="py-4 px-4 text-center text-foreground/80">
                          {value === 'Yes' ? <Check className="w-4 h-4 text-accent mx-auto" /> : !value || value === '—' ? <span className="text-muted-foreground/40">—</span> : value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="border-b border-border/50">
                  <td className="py-4 px-4 text-muted-foreground font-medium">Starting at</td>
                  {services.map(s => <td key={s._id} className="py-4 px-4 text-center font-serif text-accent">{s.startingPrice}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    )}
    <section className="py-24 md:py-32 bg-background"><div className="container-narrow text-center"><h2 className="font-serif text-3xl md:text-4xl leading-tight mb-8 text-balance">{content.ctaHeading}</h2><p className="text-muted-foreground text-base md:text-lg font-light mb-10 max-w-xl mx-auto leading-relaxed">{content.ctaDescription}</p><Link href={content.ctaButtonLink} className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl">{content.ctaButtonLabel}<ArrowRight className="w-4 h-4" /></Link></div></section>
  </>;
}