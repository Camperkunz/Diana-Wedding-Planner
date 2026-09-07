'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Instagram } from 'lucide-react';
import { cn } from '../lib/utils';
import type { SiteLayout, SiteSettings } from '../lib/sanity-data';

type Props = { settings: SiteSettings | null; layout: SiteLayout | null };

const fallbackLinks = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/backstage', label: 'Backstage' },
  { href: '/faq', label: 'FAQ' },
];

// Routes that have their own full-bleed hero image at the top, where the
// header should start transparent and only turn solid once the user scrolls.
// Any route NOT in this list (e.g. the 404 page) gets the solid/dark header
// treatment from the very start, since there's no hero image behind it.
const heroRoutes = ['/', '/about', '/services', '/portfolio', '/faq', '/backstage', '/contact'];

function hasHero(pathname: string) {
  return heroRoutes.some((route) => (route === '/' ? pathname === '/' : pathname === route || pathname.startsWith(`${route}/`)));
}

export function SiteHeader({ settings, layout }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const allNavLinks = layout?.navLinks?.length ? layout.navLinks.map((item) => ({ href: item.link, label: item.label })) : fallbackLinks;
  const contactLink = allNavLinks.find((item) => item.href === '/contact' || item.label.toLowerCase() === 'contact') || { href: '/contact', label: 'Contact' };
  const navLinks = allNavLinks.filter((item) => item !== contactLink);
  const logo = layout?.headerLogo || settings?.logo;
  const logoAlt = layout?.headerLogoAlt || settings?.logoAlt || `${settings?.name || 'Site'} logo`;

  // "opaque" drives all the light/dark styling. It's true once the user has
  // scrolled OR on any page that doesn't have a hero image to sit on top of.
  const opaque = scrolled || !hasHero(pathname || '/');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        opaque
          ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border/50'
          : 'bg-transparent'
      )}
    >
      <nav className="container-wide flex items-center justify-between h-20" aria-label="Main navigation">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Diana — Home"
        >
          {logo ? (
            <img src={logo} alt={logoAlt} className={cn('max-h-12 w-auto max-w-[180px] object-contain transition-opacity duration-300', !opaque && 'brightness-0 invert')} />
          ) : (
            <span className={cn('font-script text-3xl md:text-4xl leading-none transition-colors duration-300', opaque ? 'text-foreground group-hover:text-accent' : 'text-white group-hover:text-accent')}>
              {settings?.name?.charAt(0) || 'D'}
            </span>
          )}
          <span className="hidden sm:flex flex-col leading-tight">
            <span
              className={cn(
                'font-serif text-lg transition-colors duration-300',
                opaque ? 'text-foreground' : 'text-white'
              )}
            >
              {settings?.name || 'Site Title'}
            </span>
            <span
              className={cn(
                'text-[10px] uppercase tracking-wide-lg transition-colors duration-300',
                opaque ? 'text-muted-foreground' : 'text-white/70'
              )}
            >
              {settings?.tagline || ''}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium tracking-wide uppercase transition-colors duration-300 relative py-1',
                opaque
                  ? pathname === link.href
                    ? 'text-accent'
                    : 'text-foreground/70 hover:text-foreground'
                  : pathname === link.href
                    ? 'text-accent'
                    : 'text-white/80 hover:text-white'
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-accent" />
              )}
            </Link>
          ))}
          <Link
            href={contactLink.href}
            className="bg-accent text-accent-foreground px-8 py-2.5 text-sm font-medium tracking-wide uppercase hover:bg-accent/90 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            {contactLink.label}
          </Link>
          <div className={cn('flex items-center gap-3 pl-2 border-l', opaque ? 'border-border' : 'border-white/20')}>
            <a
              href={settings?.socialLinks?.find((item) => item.platform === 'instagram')?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className={cn(
                'transition-colors duration-300',
                opaque
                  ? 'text-foreground/60 hover:text-accent'
                  : 'text-white/60 hover:text-white'
              )}
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className={cn(
            'lg:hidden p-2 -mr-2 transition-colors duration-300 relative z-[60]',
            mobileOpen ? 'text-foreground' : opaque ? 'text-foreground' : 'text-white'
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu — full-screen overlay */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-50 bg-background transition-opacity duration-300 flex flex-col',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'py-3 font-serif text-3xl tracking-wide transition-colors duration-200',
                pathname === link.href ? 'text-accent' : 'text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={contactLink.href}
            className="mt-8 bg-accent text-accent-foreground px-12 py-3.5 text-center text-sm font-medium tracking-wide uppercase"
          >
            {contactLink.label}
          </Link>
        </div>
      </div>
    </header>
  );
}