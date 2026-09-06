import Link from 'next/link';
import { ArrowRight, Heart, Award, MapPin } from 'lucide-react';
import { getTestimonials, getStats } from '@/lib/data';
import { getPage } from '@/lib/sanity-data';
import { CmsSections } from '@/components/cms-sections';

export async function generateMetadata() {
  const page = await getPage('about');
  return {
    title: page?.seo?.metaTitle || page?.title || 'About Diana — Ottawa Wedding Planner',
    description: page?.seo?.metaDescription || 'Meet Diana, an independent wedding planner based in Ottawa.',
  };
}

export default async function AboutPage() {
  const cmsPage = await getPage('about');
  if (cmsPage?.sections?.length) return <CmsSections sections={cmsPage.sections} />;
  const testimonials = getTestimonials();
  const stats = getStats();

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] w-full overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.pexels.com/photos/4968707/pexels-photo-4968707.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Diana writing thoughtfully in a planner at a marble table"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-accent/10" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pt-20">
          <p className="text-white/80 text-xs md:text-sm uppercase tracking-wide-lg mb-6">
            About
          </p>
          <h1 className="font-serif text-white text-4xl md:text-6xl lg:text-7xl font-normal leading-tight text-balance">
            Hi, I&apos;m <span className="font-script font-normal">Diana</span>
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-28 md:py-40 bg-background">
        <div className="container-narrow">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
            <div className="lg:col-span-2 space-y-8">
              <p className="text-xs uppercase tracking-wide-lg text-accent mb-4">
                My Story
              </p>
              <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-8 text-balance">
                I didn&apos;t set out to be a wedding planner. But I kept being the person everyone asked.
              </h2>
              <div className="space-y-6 text-muted-foreground text-base md:text-lg font-light leading-relaxed">
                <p>
                  I planned my first wedding at 23 — my sister&apos;s, because she asked, and I
                  couldn&apos;t say no. I had no idea what I was doing. But I discovered something
                  that day: I love the quiet machinery behind a big, emotional event. The
                  spreadsheets, the phone calls, the 2am worries about whether the florist got
                  the right shade of cream. I love all of it.
                </p>
                <p>
                  Nine years later, I&apos;ve planned over 120 weddings across Ottawa, the Gatineau
                  Hills, the Ottawa Valley, and beyond. I&apos;ve worked in grand ballrooms and
                  barns and backyards and on the shore of a lake at sunset. Every single one was
                  different, and every single one taught me something I bring to the next.
                </p>
                <p>
                  But the thing that hasn&apos;t changed — and won&apos;t — is that I do this personally.
                  I&apos;m not building an agency. I&apos;m not training junior planners to run weddings
                  on my behalf. When you hire me, you get me. My phone number. My attention. My
                  obsession with the details you care about and the ones you haven&apos;t thought of yet.
                </p>
                <p>
                  If that&apos;s the kind of relationship you want with your planner — not a vendor,
                  but someone who becomes part of your story — then I think we&apos;ll work well together.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="aspect-[3/4] overflow-hidden rounded-sm shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.pexels.com/photos/9052841/pexels-photo-9052841.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Diana smiling with planning notes, exuding warmth and professionalism"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="bg-secondary/40 rounded-sm p-8 border border-border/50">
                <p className="text-xs uppercase tracking-wide-lg text-accent mb-4">
                  At a Glance
                </p>
                <ul className="space-y-4 text-sm text-muted-foreground font-light">
                  <li className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>9 years of independent wedding planning</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>120+ weddings, personally planned</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>Based in Ottawa, serving Eastern Ontario &amp; beyond</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-28 md:py-40 bg-secondary/40">
        <div className="container-narrow">
          <div className="text-center mb-20">
            <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
              My Philosophy
            </p>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight text-balance">
              What I believe about weddings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 ">
            {[
              {
                title: 'Your wedding should feel like you',
                body: 'Not like a Pinterest board, not like the wedding I did last month, not like what\'s trendy. I start every relationship by understanding who you are as a couple — then we build a day that reflects that, not a template.',
              },
              {
                title: 'Details are not details — they\'re the experience',
                body: 'The difference between a good wedding and a great one isn\'t the big things. It\'s whether the bar opens on time, whether the grandmother can hear the vows, whether there\'s a plan when it rains. I obsess over these so you don\'t have to.',
              },
              {
                title: 'Your planner should be a person, not a brand',
                body: 'I deliberately keep my calendar small. When you hire me, I\'m not handing you to an associate. I\'m the one at your rehearsal, the one on my phone with your florist at 6am, the one making sure your day runs.',
              },
              {
                title: 'Calm is a service',
                body: 'The most valuable thing I provide isn\'t a spreadsheet or a vendor list — it\'s the feeling of knowing someone competent is handling everything. Your family should enjoy the day. You should enjoy the day. I\'ll handle the rest.',
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="font-serif text-3xl text-accent/25 leading-none">
                  0{i + 1}
                </div>
                <h3 className="font-serif text-xl md:text-2xl leading-tight">
                  {item.title}
                </h3>
                <p className="text-muted-foreground font-light leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
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

      {/* Testimonials */}
      <section className="py-28 md:py-40 bg-background">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <p className="text-xs uppercase tracking-wide-lg text-accent mb-6">
              Kind Words
            </p>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight text-balance">
              From couples after the last dance
            </h2>
            <p className="text-muted-foreground text-sm mt-4 font-light">
              Placeholder testimonials — real quotes will replace these once the CMS is connected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
            {testimonials.map((t) => (
              <article key={t.id} className="flex flex-col">
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

      {/* CTA */}
      <section className="py-24 md:py-32 bg-secondary/40">
        <div className="container-narrow text-center">
          <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-8 text-balance">
            Think we might be a good fit?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg font-light mb-10 max-w-xl mx-auto leading-relaxed">
            The best way to find out is a conversation. No pressure, no obligation —
            just a chat about what you&apos;re planning.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-accent text-accent-foreground px-12 py-3.5 text-sm uppercase tracking-wide hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get in Touch
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
