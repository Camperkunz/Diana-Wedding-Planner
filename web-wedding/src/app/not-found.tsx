import Link from 'next/link';
import { LuArrowRight as ArrowRight, LuHeart as Heart } from 'react-icons/lu';

export default function NotFound() {
  return (
    <section className="min-h-[80vh] w-full flex items-center justify-center bg-background px-6 pt-20">
      <div className="container-narrow text-center py-24 md:py-32">
        <Heart className="w-8 h-8 text-accent/40 mx-auto mb-8" />
        <p className="text-xs md:text-sm uppercase tracking-wide-lg text-accent mb-6">
          Page Not Found
        </p>
        <h1 className="font-serif text-4xl md:text-6xl leading-tight mb-6 text-balance">
          This page doesn&apos;t exist —
          <br />
          <span className="font-script font-normal">but your wedding will.</span>
        </h1>
        <p className="text-muted-foreground text-base md:text-lg font-light max-w-xl mx-auto mb-12 leading-relaxed">
          The link you followed may be broken, or the page may have moved. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            prefetch={false}
            href="/"
            className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            prefetch={false}
            href="/contact"
            className="inline-flex items-center gap-2 border border-accent text-accent px-10 py-3 text-sm uppercase tracking-wide hover:bg-accent hover:text-accent-foreground transition-all duration-300"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </section>
  );
}