import './globals.css';
import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { SiteHeader } from '../components/site-header';
import { SiteFooter } from '../components/site-footer';
import { FloatingContact } from '../components/floating-contact';
import { getSiteDesign, getSiteLayout, getSiteSettings, hexToHsl } from '../lib/sanity-data';
import { SITE_URL } from '../lib/site';
import { JsonLd } from '../components/json-ld';
import { GoogleAnalytics } from '../components/google-analytics';

// Revalidation is configured per route (`export const revalidate` in each
// page.tsx), not here: the old layout-level `revalidate = 60` forced every
// route to re-render once a minute, which burned Worker CPU and KV writes
// (free tier: 1,000 writes/day). Studio edits still appear without a redeploy.

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: settings?.seo?.metaTitle || settings?.name || 'Wedding Planner',
    description: settings?.seo?.metaDescription || settings?.tagline,
    icons: settings?.favicon ? { icon: settings.favicon } : undefined,
    // No `robots` here on purpose: every route emits its own (see
    // buildSeoMetadata), and a leftover `noindex` at layout level would be
    // inherited by any page that forgets to override it. Indexing is the
    // default; the Studio's "Hide from search engines" switch opts pages out.
    openGraph: {
      title: settings?.seo?.metaTitle || settings?.name || 'Wedding Planner',
      description: settings?.seo?.metaDescription || settings?.tagline,
      type: 'website',
      siteName: settings?.name || undefined,
      locale: 'en_CA',
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
  // The fonts themselves are self-hosted (public/fonts, declared in globals.css);
  // next/font/google was removed because its Google Fonts fetch breaks Turbopack
  // builds (vercel/next.js#99114).
  // Changing fonts is a code change on purpose — no CMS preset.
  const fontVars = {
    '--font-sans': "'Jost'",
    '--font-serif': "'Cormorant Garamond'",
    '--font-script': "'Dancing Script'",
  };

  const style = { ...vars, ...fontVars } as CSSProperties;

  // schema.org structured data for search engines (knowledge panel, rich
  // results). Built from Site Settings only — everything below is either
  // authored in the Studio or a constant, never user input, and JsonLd escapes
  // `<` so no CMS string can break out of the script tag.
  const sameAs = (settings?.socialLinks || [])
    .map((link) => link.url)
    .filter(Boolean);
  // `siteSettings.address` holds the short "City, Province" form ("Ottawa, ON"),
  // so it can be split into the PostalAddress parts search engines read. A
  // longer value (a full street address) is kept verbatim as the locality
  // instead of being mangled into the wrong field. The country is a constant:
  // this is a Canadian business.
  const postalAddress = (() => {
    const raw = settings?.address?.trim();
    if (!raw) return undefined;
    const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
    const isCityProvince = parts.length === 2 && /^[A-Za-z]{2,3}$/.test(parts[1]);
    return {
      '@type': 'PostalAddress',
      addressLocality: isCityProvince ? parts[0] : raw,
      addressRegion: isCityProvince ? parts[1].toUpperCase() : undefined,
      addressCountry: 'CA',
    };
  })();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    // Stable identifier for the business entity, so other markup can reference
    // it (`{ "@id": "https://dianavoloshina.com/#business" }`).
    '@id': `${SITE_URL}/#business`,
    name: settings?.name || 'Diana — Wedding Planner',
    url: SITE_URL,
    logo: settings?.logo || undefined,
    image: settings?.seo?.ogImage || undefined,
    description:
      settings?.seo?.metaDescription || settings?.tagline || undefined,
    email: settings?.email || undefined,
    telephone: settings?.phone || undefined,
    address: postalAddress,
    areaServed: settings?.serviceArea || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };

  return (
    <html lang="en-CA" data-scroll-behavior="smooth">
      {/* Every photo is served from Sanity's CDN: opening the connection while
          the HTML is still parsing saves a DNS + TCP + TLS round trip before
          the first image request. React 19 hoists <link> into <head>. */}
      <link rel="preconnect" href="https://cdn.sanity.io" />
      {/* Self-hosted fonts: preload the latin files (what next/font did with
          subsets: ["latin"]). React 19 hoists these into <head>. */}
      <link rel="preload" as="font" type="font/woff2" href="/fonts/jost-latin.woff2" crossOrigin="anonymous" />
      <link rel="preload" as="font" type="font/woff2" href="/fonts/cormorant-garamond-latin.woff2" crossOrigin="anonymous" />
      <link rel="preload" as="font" type="font/woff2" href="/fonts/dancing-script-latin.woff2" crossOrigin="anonymous" />
      <body className="font-sans bg-background text-foreground" style={style}>
        <JsonLd data={jsonLd} />
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