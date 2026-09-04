import './globals.css';
import type { Metadata } from 'next';
import { Jost, Cormorant_Garamond, Dancing_Script } from 'next/font/google';
import { SiteHeader } from '../components/site-header';
import { SiteFooter } from '../components/site-footer';
import { FloatingContact } from '../components/floating-contact';

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

export const metadata: Metadata = {
  metadataBase: new URL('https://dianaweddings.ca'),
  title: 'Diana — Wedding Planner in Ottawa | Personal, Hands-On Wedding Planning',
  description:
    'Diana is an independent wedding planner based in Ottawa, offering deeply personal, hands-on wedding planning from first consultation to final toast. Not an agency — you get her, personally.',
  openGraph: {
    title: 'Diana — Wedding Planner in Ottawa',
    description:
      'Independent, personal wedding planning in Ottawa. You get Diana, personally — from first consultation to final toast.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jost.variable} ${cormorant.variable} ${dancing.variable}`}>
      <body className="font-sans bg-background text-foreground">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <FloatingContact />
      </body>
    </html>
  );
}
