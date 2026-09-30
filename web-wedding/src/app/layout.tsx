import './globals.css';
import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import {
  Jost,
  Cormorant_Garamond,
  Dancing_Script,
  Manrope,
  Playfair_Display,
  Allura,
  Lato,
  DM_Serif_Display,
  Great_Vibes,
} from 'next/font/google';
import { SiteHeader } from '../components/site-header';
import { SiteFooter } from '../components/site-footer';
import { FloatingContact } from '../components/floating-contact';
import { getSiteDesign, getSiteLayout, getSiteSettings, hexToHsl } from '../lib/sanity-data';

const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-jost' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
});
const dancing = Dancing_Script({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-dancing',
});

const manrope = Manrope({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-manrope' });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-playfair' });
const allura = Allura({ subsets: ['latin'], weight: ['400'], variable: '--font-allura' });
const lato = Lato({ subsets: ['latin'], weight: ['300', '400', '700'], variable: '--font-lato' });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: ['400'], variable: '--font-dm-serif' });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: ['400'], variable: '--font-great-vibes' });

// Without this, Next.js statically caches every page at build time and Studio
// edits will not appear on the live site until the next deploy. This makes
// every route re-fetch fresh content from Sanity at most once a minute.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL('https://dianaweddings.ca'),
    title: settings?.seo?.metaTitle || settings?.name || 'Wedding Planner',
    description: settings?.seo?.metaDescription || settings?.tagline,
    icons: settings?.favicon ? { icon: settings.favicon } : undefined,
    openGraph: {
      title: settings?.seo?.metaTitle || settings?.name || 'Wedding Planner',
      description: settings?.seo?.metaDescription || settings?.tagline,
      type: 'website',
      images: settings?.seo?.ogImage ? [settings.seo.ogImage] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, siteLayout, design] = await Promise.all([
    getSiteSettings(),
    getSiteLayout(),
    getSiteDesign(),
  ]);

  const colors = design?.colors || {};
  const vars: Record<string, string> = {};

  for (const [name, hex] of Object.entries(colors)) {
    if (hex) {
      const hsl = hexToHsl(hex as string);
      if (hsl) vars[`--${name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`] = hsl;
    }
  }

  if (vars['--accent']) {
    vars['--ring'] = vars['--accent'];
    vars['--terracotta'] = vars['--terracotta'] || vars['--accent'];
  }
  if (vars['--border']) vars['--input'] = vars['--border'];
  if (vars['--background']) {
    vars['--card'] = vars['--background'];
    vars['--popover'] = vars['--background'];
  }

  const fontPreset = design?.fontPreset || 'elegant';
  const fontVars =
    fontPreset === 'editorial'
      ? {
        '--font-sans': 'var(--font-manrope)',
        '--font-serif': 'var(--font-playfair)',
        '--font-script': 'var(--font-allura)',
      }
      : fontPreset === 'romantic'
        ? {
          '--font-sans': 'var(--font-lato)',
          '--font-serif': 'var(--font-dm-serif)',
          '--font-script': 'var(--font-great-vibes)',
        }
        : {
          '--font-sans': 'var(--font-jost)',
          '--font-serif': 'var(--font-cormorant)',
          '--font-script': 'var(--font-dancing)',
        };

  const style = { ...vars, ...fontVars } as CSSProperties;

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${jost.variable} ${cormorant.variable} ${dancing.variable} ${manrope.variable} ${playfair.variable} ${allura.variable} ${lato.variable} ${dmSerif.variable} ${greatVibes.variable}`}
    >
      <body className="font-sans bg-background text-foreground" style={style}>
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[60] focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:px-5 focus-visible:py-3 focus-visible:text-sm focus-visible:uppercase focus-visible:tracking-wide focus-visible:shadow-lg"
        >
          Skip to main content
        </a>
        <SiteHeader settings={settings} layout={siteLayout} />
        <main id="main-content">{children}</main>
        <SiteFooter settings={settings} layout={siteLayout} />
        <FloatingContact />
      </body>
    </html>
  );
}