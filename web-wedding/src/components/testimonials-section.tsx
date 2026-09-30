import { Quote } from 'lucide-react';

export type TestimonialItem = {
  quote: string;
  author: string;
  weddingType?: string;
};

type TestimonialsSectionProps = {
  eyebrow?: string;
  heading?: string;
  subtext?: string;
  testimonials?: TestimonialItem[];
  showIcon?: boolean;
  sectionClassName?: string;
  cardsClassName?: string;
};

// Shared by the homepage and the About page. Renders nothing when there are
// no testimonials in Sanity yet — no placeholder quotes, no manual toggle.
// The section reappears on its own the moment a real testimonial is added.
export function TestimonialsSection({
  eyebrow,
  heading,
  subtext,
  testimonials,
  showIcon = true,
  sectionClassName = 'py-28 md:py-40 bg-background',
  cardsClassName = 'grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10',
}: TestimonialsSectionProps) {
  if (!testimonials?.length) return null;

  return (
    <section className={sectionClassName}>
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto mb-20">
          {eyebrow && (
            <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">{eyebrow}</p>
          )}
          {heading && (
            <h2 className="font-serif text-3xl md:text-5xl leading-tight mb-4 text-balance">
              {heading}
            </h2>
          )}
          {subtext && <p className="text-muted-foreground text-sm font-light">{subtext}</p>}
        </div>

        <div className={cardsClassName}>
          {testimonials.map((t, i) => (
            <article key={i} className="flex flex-col">
              {showIcon && <Quote className="w-8 h-8 text-accent/25 mb-6" aria-hidden="true" />}

              <p className="text-foreground/80 leading-relaxed flex-1 italic font-light text-lg">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-8 pt-5 border-t border-border/50">
                <p className="font-serif text-lg">{t.author}</p>
                {t.weddingType && (
                  <p className="text-sm uppercase tracking-wide text-muted-foreground mt-1 font-light">
                    {t.weddingType}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
