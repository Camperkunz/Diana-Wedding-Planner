import './globals.css';
import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import {
  Jost,
  Cormorant_Garamond,
  Dancing_Script,
} from 'next/font/google';
import { SiteHeader } from '../components/site-header';
import { SiteFooter } from '../components/site-footer';
import { FloatingContact } from '../components/floating-contact';
import { getSiteDesign, getSiteLayout, getSiteSettings, hexToHsl } from '../lib/sanity-data';
import { GoogleAnalytics } from '../components/google-analytics';

const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-jost' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-cormorant',
});
const dancing = Dancing_Script({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-dancing',
});

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

  // The type system is fixed: Jost (sans) + Cormorant Garamond (serif) + Dancing Script (accents).
  // Changing fonts is a code change on purpose — no CMS preset.
  const fontVars = {
    '--font-sans': 'var(--font-jost)',
    '--font-serif': 'var(--font-cormorant)',
    '--font-script': 'var(--font-dancing)',
  };

  const style = { ...vars, ...fontVars } as CSSProperties;

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${jost.variable} ${cormorant.variable} ${dancing.variable}`}
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
        {/* Renders nothing unless a valid GA4 Measurement ID (G-*) is set in
            Business & Contact Info. Scripts load after hydration. */}
        <GoogleAnalytics id={settings?.googleAnalyticsId} />
      </body>
    </html>
  );
}