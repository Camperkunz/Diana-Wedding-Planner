import Link from 'next/link';
import { LuArrowRight as ArrowRight } from 'react-icons/lu';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { getFaqPage, buildSeoMetadata } from '@/lib/sanity-data';
import HeroSection from '@/components/ui/HeroSection';

const fallback = {};

// ISR: Studio edits appear within this window, no redeploy needed.
export const revalidate = 21600;

/**
 * Splits a Studio `text` value into paragraphs: every newline the editor types
 * becomes a new paragraph on the page (the same `<p>` + spacing convention the
 * About story uses, but keyed on single line breaks instead of blank lines).
 */
function toParagraphs(value: unknown): string[] {
    return String(value ?? '')
        .replace(/\r\n?/g, '\n')
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);
}

export async function generateMetadata() {
    const page = await getFaqPage();
    return buildSeoMetadata(
        page?.seo,
        'FAQ — Common Questions | Diana, Ottawa Wedding Planner',
        'Answers to the questions couples ask most often about working with Diana — service levels, pricing, process, and more.',
        '/faq'
    );
}

export default async function FaqPage() {
    const page = await getFaqPage();
    const c = { ...fallback, ...(page || {}) } as typeof fallback &
        Record<string, any>;
    // Real questions from the Studio only. While the editor has not added any,
    // the accordion is hidden instead of showing invented answers — the old
    // `lib/data.ts` fallback did exactly that.
    const items: any[] = c.items || [];
    const categories = Array.from(new Set(items.map((i: any) => i.category)));
    const showContact = Boolean(c.contactHeading || c.contactDescription);

    return (
        <>
            {/* Hero Section */}
            <HeroSection
                eyebrow={c.heroEyebrow}
                heading={c.heroHeading}
                image={c.heroImage}
                imageAlt={c.heroImageAlt}
            />

            {/* FAQ Accordion Section — hidden while there are no questions */}
            {(items.length > 0 || showContact) && (
                <section className="py-16 md:py-20 bg-background">
                    <div className="container-narrow">
                        {categories.map((category: any) => (
                            <div key={category} className="mb-14">
                                <h2 className="font-serif text-2xl md:text-3xl mb-8 text-accent">
                                    {category}
                                </h2>
                                <Accordion type="single" collapsible className="space-y-3">
                                    {items
                                        .filter((i: any) => i.category === category)
                                        .map((item: any, i: number) => (
                                            <AccordionItem
                                                key={item.id || i}
                                                value={item.id || `${category}-${i}`}
                                                className="border border-border/50 rounded-sm px-6 bg-card/50 data-[state=open]:bg-card data-[state=open]:shadow-sm transition-all duration-300"
                                            >
                                                <AccordionTrigger className="text-left font-serif text-lg hover:no-underline">
                                                    {item.question}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-muted-foreground leading-relaxed text-base font-light">
                                                    <div className="space-y-4">
                                                        {toParagraphs(item.answer).map(
                                                            (paragraph, pIndex) => (
                                                                <p key={pIndex}>{paragraph}</p>
                                                            )
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                </Accordion>
                            </div>
                        ))}

                        {/* Contact Card */}
                        {showContact && (
                            <div
                                className={`text-center bg-secondary/40 rounded-sm p-12 border border-border/50 ${items.length > 0 ? 'mt-20' : ''
                                    }`}
                            >
                                <h2 className="font-serif text-2xl md:text-3xl mb-6 text-balance">
                                    {c.contactHeading}
                                </h2>
                                <div className="text-muted-foreground font-light mb-10 max-w-xl mx-auto leading-relaxed space-y-4">
                                    {toParagraphs(c.contactDescription).map((paragraph, pIndex) => (
                                        <p key={pIndex}>{paragraph}</p>
                                    ))}
                                </div>
                                {c.contactButtonLabel && (
                                    <Link
                                      prefetch={false}
                                      href={c.contactButtonLink || '/contact'}
                                        className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        {c.contactButtonLabel}
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            )}
        </>
    );
}