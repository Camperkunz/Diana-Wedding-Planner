'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import type { FocusEvent, MouseEvent, ReactNode } from 'react';
import { LuMenu as Menu, LuX as X, LuGlobe as Globe } from 'react-icons/lu';
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
import ResponsiveImage from './ui/ResponsiveImage';
import { HomeLink } from './home-link';

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

/**
 * Section-aware match for the navigation: `/portfolio/album` keeps `/portfolio`
 * marked as the current section, exactly like `hasHero` does for the header overlay.
 */
function isActivePath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
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

/**
 * Desktop-only nav link with hover/focus-driven prefetch.
 *
 * Why not `<Link prefetch>`:
 *  - `prefetch` in the App Router starts loading the RSC payload on viewport
 *    intersection, i.e. immediately after hydration for the whole menu. That
 *    burns one Worker invocation + one tag-cache RPC per link on every page
 *    load, for routes the visitor may never open.
 *
 * What this does instead:
 *  - `prefetch={false}` on the `<Link>` so nothing loads until intent.
 *  - On `mouseenter` / `focus`, wait `PREFETCH_DELAY_MS` and then call
 *    `router.prefetch(href)`. If the mouse leaves or focus blurs before the
 *    timer fires, the prefetch is cancelled — a pointer brushing across the
 *    menu costs nothing.
 *  - The 100 ms delay is short enough that the click, which typically lands
 *    200–400 ms after hover, still finds a warm cache.
 *  - Each href is prefetched at most once per mount, so re-hovering does not
 *    spam `router.prefetch`.
 *  - The timer is cleared on unmount so a late callback cannot fire into a
 *    torn-down tree.
 *
 * Mobile/tablet menus use plain `<Link prefetch={false}>`: touch devices have
 * no hover, so hover-prefetch gives no benefit there and only competes with
 * the current page's images and fonts for bandwidth.
 */
const PREFETCH_DELAY_MS = 100;

type NavLinkProps = {
  href: string;
  prefetch?: boolean;
  className?: string;
  children: ReactNode;
  onMouseEnter?: (event: MouseEvent<HTMLAnchorElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLAnchorElement>) => void;
  onFocus?: (event: FocusEvent<HTMLAnchorElement>) => void;
  onBlur?: (event: FocusEvent<HTMLAnchorElement>) => void;
  'aria-current'?: 'page' | 'location' | undefined;
};

function NavLink({
  href,
  prefetch = true,
  className,
  children,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...rest
}: NavLinkProps) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const cancelPending = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const schedulePrefetch = () => {
    if (!prefetch) return;
    if (prefetchedRef.current) return;
    if (timerRef.current) return;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (!mountedRef.current || prefetchedRef.current) return;
      prefetchedRef.current = true;
      router.prefetch(href);
    }, PREFETCH_DELAY_MS);
  };

  return (
    <Link
      href={href}
      prefetch={false}
      className={className}
      onMouseEnter={(event) => {
        schedulePrefetch();
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        cancelPending();
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        // Keyboard users get the same warm-up: tabbing to a link usually means
        // the next Enter press is imminent.
        schedulePrefetch();
        onFocus?.(event);
      }}
      onBlur={(event) => {
        cancelPending();
        onBlur?.(event);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function SiteHeader({ settings, layout }: Props) {
  const pathname = usePathname();
  const [opaque, setOpaque] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const allNavLinks = layout?.navLinks?.length ? layout.navLinks.map((item) => ({ href: item.link, label: item.label })) : fallbackLinks;
  const contactLink = allNavLinks.find((item) => item.href === '/contact' || item.label.toLowerCase() === 'contact') || { href: '/contact', label: 'Contact' };
  const navLinks = allNavLinks.filter((item) => item !== contactLink);
  const logo = layout?.headerLogo || settings?.logo;
  const logoAlt = layout?.headerLogoAlt || settings?.logoAlt || `${settings?.name || 'Site'} logo`;

  // Re-runs on every route change as well as on scroll: leaving a page without a
  // hero (privacy, 404 …) used to keep the header opaque on the home page,
  // because the scroll listener never fired when the position did not change.
  useEffect(() => {
    const updateHeader = () => {
      setOpaque(window.scrollY > 100 || !hasHero(pathname));
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    return () => window.removeEventListener('scroll', updateHeader);
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // WCAG 2.1.2 — Escape closes the menu and returns focus to the trigger button.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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
        {/*
          HomeLink renders a `next/link` to `/` with `prefetch={false}` already
          (see src/components/home-link.tsx) — the logo will not prefetch the
          home route on every page.
        */}
        <HomeLink
          className="flex items-center gap-3 group"
          aria-label="Diana — Home"
          onClick={() => setMobileOpen(false)}
        >
          {logo ? (
            <ResponsiveImage
              source={logo}
              alt={logoAlt}
              sizes="180px"
              widths={[200, 400, 600]}
              priority
              className={cn('max-h-12 w-auto max-w-[180px] object-contain transition-opacity duration-300', !opaque && 'brightness-0 invert')}
            />
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
                'text-[12px] uppercase tracking-wide-lg transition-colors duration-300',
                opaque ? 'text-foreground' : 'text-white/80'
              )}
            >
              {settings?.tagline || ''}
            </span>
          </span>
        </HomeLink>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <NavLink
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? 'page' : active ? 'location' : undefined}
                className={cn(
                  'group relative py-1 text-sm font-medium tracking-wide uppercase transition-colors duration-300',
                  opaque
                    ? active
                      ? 'text-accent'
                      : 'text-foreground/80 hover:text-accent focus-visible:text-accent'
                    : active
                      ? 'text-white'
                      : 'text-white/80 hover:text-white focus-visible:text-white'
                )}
              >
                {link.label}
                {/* The current page keeps this line; every other link slides the same line
                    in on hover/keyboard focus, so the state is never colour alone (WCAG 1.4.1).
                    In the transparent header the line uses the accent tint meant for photos —
                    a dark `accent` text colour would sit at ~2:1 against the hero photo. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -bottom-0.5 left-0 right-0 h-px origin-left transition-transform duration-300',
                    'group-hover:scale-x-100 group-focus-visible:scale-x-100',
                    opaque ? 'bg-accent' : 'bg-accent-overlay',
                    active ? 'scale-x-100' : 'scale-x-0'
                  )}
                />
              </NavLink>
            );
          })}
          <NavLink
            href={contactLink.href}
            className="bg-accent text-accent-foreground px-8 py-2.5 text-sm font-medium tracking-wide uppercase hover:bg-accent/90 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            {contactLink.label}
          </NavLink>
          {Boolean(settings?.socialLinks?.length) && (
            <div className={cn('flex items-center gap-1 border-l pl-3', opaque ? 'border-border' : 'border-white/20')}>
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
                      'inline-flex items-center justify-center rounded-full p-2 transition-colors duration-300',
                      opaque
                        ? 'text-foreground/75 hover:bg-foreground/5 hover:text-accent focus-visible:bg-foreground/5 focus-visible:text-accent'
                        : 'text-white/75 hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white'
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
          ref={menuButtonRef}
          className={cn(
            'lg:hidden p-3 -mr-3 transition-colors duration-300',
            opaque ? 'text-foreground' : 'text-white'
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={cn(
          'lg:hidden transition-all duration-300 bg-background border-b border-border',
          mobileOpen
            ? 'max-h-[calc(100dvh-5rem)] overflow-y-auto opacity-100 visible'
            : 'max-h-0 overflow-hidden opacity-0 invisible pointer-events-none'
        )}
      >
        <div className="container-wide py-6 flex flex-col gap-1">
          {/*
            Touch devices: plain `prefetch={false}` links. No hover, so
            hover-prefetch gives nothing; and eager prefetch would queue several
            RSC requests at once, fighting the current page's images for
            bandwidth. The ~200–400 ms wait after a tap reads as a normal click.
          */}
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                aria-current={pathname === link.href ? 'page' : active ? 'location' : undefined}
                className={cn(
                  'relative py-3 text-base tracking-wide transition-colors duration-200 border-b border-border/50',
                  'hover:bg-muted/60 hover:text-accent focus-visible:bg-muted/60 focus-visible:text-accent active:bg-muted',
                  active ? 'text-accent' : 'text-foreground/80'
                )}
              >
                {link.label}
                {active && (
                  <span aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </Link>
            );
          })}
          <Link
            href={contactLink.href}
            prefetch={false}
            className="mt-4 bg-accent text-accent-foreground px-8 py-3 text-center text-sm font-medium tracking-wide uppercase transition-colors duration-300 hover:bg-accent/90 focus-visible:bg-accent/90 active:bg-accent/95"
          >
            {contactLink.label}
          </Link>
          {Boolean(settings?.socialLinks?.length) && (
            <div className="flex items-center -mx-3 pt-4 mt-2 border-t border-border/50">
              {settings?.socialLinks?.map((item, index) => {
                if (!item.url) return null;
                return (
                  <a
                    key={`${item.platform}-${index}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.platform || 'Social Link'}
                    className="inline-flex items-center justify-center rounded-full p-3 text-foreground/75 transition-colors duration-300 hover:bg-muted/60 hover:text-accent focus-visible:bg-muted/60 focus-visible:text-accent active:bg-muted"
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