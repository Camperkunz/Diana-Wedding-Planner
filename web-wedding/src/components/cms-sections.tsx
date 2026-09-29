import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { urlFor } from '@/app/sanity/image';
import HeroSection from '@/components/ui/HeroSection';
import SafeLink from '@/components/ui/SafeLink';

function Button({ button }: { button?: any }) {
  if (!button?.label || !button?.link) return null;
  const className = button.style === 'outline'
    ? 'inline-flex items-center gap-2 border border-accent text-accent px-8 py-3 text-sm uppercase tracking-wide hover:bg-accent hover:text-accent-foreground transition-all duration-300'
    : 'inline-flex items-center gap-2 bg-accent text-accent-foreground px-10 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl';
  // SafeLink allow-lists the scheme (no javascript:/data: from the CMS) and adds
  // rel="noopener noreferrer" whenever the target leaves the site.
  return <SafeLink href={button.link} className={className}>{button.label}<ArrowRight className="w-4 h-4" /></SafeLink>;
}

function RichText({ value }: { value?: any[] }) {
  if (!value?.length) return null;
  return <div className="space-y-6 text-muted-foreground text-base md:text-lg font-light leading-relaxed">
    {value.map((block: any, i) => {
      if (block._type !== 'block') return null;
      const text = (block.children || []).map((child: any) => child.text).join('');
      return <p key={block._key || i}>{text}</p>;
    })}
  </div>;
}

export function CmsSections({ sections }: { sections: any[] }) {
  return <>{sections.map((section) => {
    switch (section._type) {
      case 'heroSection':
        return <HeroSection
          key={section._key}
          size="fullscreen"
          image={section.backgroundImage}
          imageAlt={section.backgroundImage?.alt || section.heading}
          headingLine1={section.heading}
          description={section.subheading}
          actions={<><Button button={section.primaryButton} /><Button button={section.secondaryButton} /></>}
        />;
      case 'aboutSection':
        return <section key={section._key} className="py-28 md:py-40 bg-background">
          <div className="container-wide grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className={section.layoutVariant === 'left' ? 'order-1' : 'order-2 lg:order-1'}>
              <p className="text-xs uppercase tracking-wide-lg text-accent mb-6"></p>
              <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-8 text-balance">{section.heading}</h2>
              <RichText value={section.bodyText} />
            </div>
            <div className={section.layoutVariant === 'left' ? 'order-2' : 'order-1 lg:order-2'}>
              {section.image && <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md"><img src={urlFor(section.image).width(1200).auto('format').url()} alt={section.image.alt || section.heading || ''} className="w-full h-full object-cover" loading="lazy" /></div>}
            </div>
          </div>
        </section>;
      case 'galleryPreviewSection':
        return <section key={section._key} className="py-28 md:py-40 bg-background">
          <div className="container-wide">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-xs uppercase tracking-wide-lg text-accent mb-6"></p>
              <h2 className="font-serif text-3xl md:text-5xl leading-tight text-balance">{section.heading}</h2>
              {section.subheading && <p className="text-muted-foreground mt-5 font-light leading-relaxed">{section.subheading}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {(section.featuredAlbums || []).map((album: any) => album.coverImage && <Link key={album._id} href={`/portfolio/${album.slug?.current || ''}`} className="group relative aspect-[4/5] overflow-hidden rounded-sm">
                <img src={urlFor(album.coverImage).width(1200).auto('format').url()} alt={album.coverImageAlt || album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7"><p className="text-white/70 text-xs uppercase tracking-wide mb-2">{album.category}</p><h3 className="font-serif text-white text-2xl">{album.title}</h3></div>
              </Link>)}
            </div>
            <div className="flex justify-center mt-12"><Button button={section.viewAllButton} /></div>
          </div>
        </section>;
      case 'testimonialsSection':
        return <section key={section._key} className="py-28 md:py-40 bg-secondary/40">
          <div className="container-wide"><div className="text-center max-w-2xl mx-auto mb-20"><h2 className="font-serif text-3xl md:text-5xl leading-tight text-balance">{section.heading}</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">{(section.testimonials || []).map((t: any, i: number) => <article key={t._key || i}><p className="text-foreground/80 leading-relaxed italic font-light text-lg">“{t.quote}”</p><div className="mt-8 pt-5 border-t border-border/50"><p className="font-serif text-lg">{t.author}</p></div></article>)}</div>
          </div>
        </section>;
      case 'ctaSection':
        return <section key={section._key} className="py-24 md:py-32 bg-secondary/40"><div className="container-narrow text-center"><p className="text-xs uppercase tracking-wide-lg text-accent mb-6"></p><h2 className="font-serif text-3xl md:text-4xl leading-tight mb-8 text-balance">{section.heading}</h2>{section.subtext && <p className="text-muted-foreground text-base md:text-lg font-light mb-10 max-w-xl mx-auto leading-relaxed">{section.subtext}</p>}<Button button={section.button} /></div></section>;
      case 'contactSection':
        return <section key={section._key} className="py-24 md:py-32 bg-background"><div className="container-narrow text-center"><p className="text-xs uppercase tracking-wide-lg text-accent mb-6"></p><h2 className="font-serif text-3xl md:text-4xl leading-tight mb-8 text-balance">{section.heading}</h2>{section.subtext && <p className="text-muted-foreground text-base md:text-lg font-light max-w-xl mx-auto leading-relaxed">{section.subtext}</p>}{section.showForm && <div className="mt-10"><Button button={{ label: 'Get in Touch', link: '/contact', style: 'solid' }} /></div>}</div></section>;
      default:
        return null;
    }
  })}</>;
}
