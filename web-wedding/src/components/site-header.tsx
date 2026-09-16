'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import {
  SiInstagram,
  SiPinterest,
  SiFacebook,
  SiTiktok,
  SiYoutube,
  SiX
} from 'react-icons/si';
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

const heroRoutes = ['/', '/about', '/services', '/portfolio', '/faq', '/backstage', '/contact'];

function hasHero(pathname: string) {
  return heroRoutes.some((route) => (route === '/' ? pathname === '/' : pathname === route || pathname.startsWith(`${route}/`)));
}

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: SiInstagram,
  pinterest: SiPinterest,
  facebook: SiFacebook,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  twitter: SiX,
  x: SiX
};

function getSocialIcon(platform?: string) {
  if (!platform) return <Globe className="w-5 h-5" />;
  const IconComponent = SOCIAL_ICONS[platform.toLowerCase().trim()];
  return IconComponent ? <IconComponent className="w-4 h-4" /> : <Globe className="w-5 h-5" />;
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
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Diana — Home"
        >
          {logo ? (
            <img src={logo} alt={logoAlt} className={cn('max-h-12 w-auto max-w-[180px] object-contain transition-opacity duration-300', !opaque && 'brightness-0 invert')} />
          ) : (
            <span className={cn('font-script text-3xl md:text-4xl leading-none transition-colors duration-300', opaque ? 'text-foreground group-hover:text-accent' : 'text-white group-hover:text-accent')}>
              {settings?.name?.charAt(0)}
            </span>
          )}
          <span className="hidden sm:flex flex-col leading-tight">
            <span
              className={cn(
                'font-serif text-xl transition-colors duration-300',
                opaque ? 'text-foreground' : 'text-white'
              )}
            >
              {settings?.name}
            </span>
            <span
              className={cn(
                'text-[11px] uppercase tracking-wide-lg transition-colors duration-300',
                opaque ? 'text-muted-foreground' : 'text-white/70'
              )}
            >
              {settings?.tagline || ''}
            </span>
          </span>
        </Link>

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
                    : 'text-foreground/80 hover:text-foreground'
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
          {Boolean(settings?.socialLinks?.length) && (
            <div className={cn('flex items-center gap-4 pl-2 border-l', opaque ? 'border-border' : 'border-white/20')}>
              {settings?.socialLinks?.map((item, index) => {
                if (!item.url) return null;
                return (
                  <a
                    key={`${item.platform}-${index}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.platform || 'Social Link'}
                    className={cn(
                      'transition-colors duration-300',
                      opaque
                        ? 'text-foreground/60 hover:text-accent'
                        : 'text-white/60 hover:text-white'
                    )}
                  >
                    {getSocialIcon(item.platform)}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <button
          className={cn(
            'lg:hidden p-2 -mr-2 transition-colors duration-300',
            scrolled ? 'text-foreground' : 'text-white'
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-400 bg-background border-b border-border',
          mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="container-wide py-6 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'py-3 text-base tracking-wide transition-colors duration-200 border-b border-border/50',
                pathname === link.href ? 'text-accent' : 'text-foreground/80'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={contactLink.href}
            className="mt-4 bg-accent text-accent-foreground px-8 py-3 text-center text-sm font-medium tracking-wide uppercase"
          >
            {contactLink.label}
          </Link>
          {Boolean(settings?.socialLinks?.length) && (
            <div className="flex items-center gap-5 pt-4 mt-2 border-t border-border/50">
              {settings?.socialLinks?.map((item, index) => {
                if (!item.url) return null;
                return (
                  <a
                    key={`${item.platform}-${index}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.platform || 'Social Link'}
                    className="text-foreground/60 hover:text-accent transition-colors duration-300"
                  >
                    {getSocialIcon(item.platform)}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}