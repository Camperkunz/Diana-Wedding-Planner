import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { getFaqItems } from '@/lib/data';

export const metadata = {
  title: 'FAQ — Common Questions | Diana, Ottawa Wedding Planner',
  description:
    'Answers to the questions couples ask most often about working with Diana — service levels, pricing, process, and more.',
};

export default function FaqPage() {
  const items = getFaqItems();
  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.pexels.com/photos/33661438/pexels-photo-33661438.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Bride preparing for her wedding day in front of a mirror"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/55 to-gray-900/75" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-20">
          <p className="text-white/80 text-xs md:text-sm uppercase tracking-wide-lg mb-6">
            FAQ
          </p>
          <h1 className="font-serif text-white text-4xl md:text-6xl lg:text-7xl font-normal leading-tight text-balance">
            Common <span className="font-script text-accent font-normal">questions</span>
          </h1>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-28 md:py-36 bg-background">
        <div className="container-narrow">
          {categories.map((category) => (
            <div key={category} className="mb-14">
              <h2 className="font-serif text-2xl md:text-3xl mb-8 text-accent">
                {category}
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {items
                  .filter((i) => i.category === category)
                  .map((item) => (
                    <AccordionItem
                      key={item.id}
                      value={item.id}
                      className="border border-border/50 rounded-sm px-6 bg-card/50 data-[state=open]:bg-card data-[state=open]:shadow-sm transition-all duration-300"
                    >
                      <AccordionTrigger className="text-left font-serif text-lg hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed text-base font-light">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </div>
          ))}

          {/* Still have questions */}
          <div className="mt-20 text-center bg-secondary/40 rounded-sm p-12 border border-border/50">
            <h2 className="font-serif text-2xl md:text-3xl mb-6 text-balance">
              Still have questions?
            </h2>
            <p className="text-muted-foreground font-light mb-10 max-w-xl mx-auto leading-relaxed">
              The best way to get answers is a conversation. Reach out — no question is
              too small, and there&apos;s no obligation.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get in Touch
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
