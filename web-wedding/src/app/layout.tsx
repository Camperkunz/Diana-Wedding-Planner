import './globals.css';
import type { Metadata } from 'next';
import { Jost, Cormorant_Garamond, Dancing_Script } from 'next/font/google';
import { SiteHeader } from '../components/site-header';
import { SiteFooter } from '../components/site-footer';
import { FloatingContact } from '../components/floating-contact';
import { getSiteLayout, getSiteSettings } from '../lib/sanity-data';

const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-sans' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
});
const dancing = Dancing_Script({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-script',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
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
  children: React.ReactNode;
}) {
  const [settings, siteLayout] = await Promise.all([getSiteSettings(), getSiteLayout()]);

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${jost.variable} ${cormorant.variable} ${dancing.variable}`}>
      <body className="font-sans bg-background text-foreground" style={settings?.accentColorHsl ? ({ ['--accent' as any]: settings.accentColorHsl } as React.CSSProperties) : undefined}>
        <SiteHeader settings={settings} layout={siteLayout} />
        <main>{children}</main>
        <SiteFooter settings={settings} layout={siteLayout} />
        <FloatingContact />
      </body>
    </html>
  );
}
