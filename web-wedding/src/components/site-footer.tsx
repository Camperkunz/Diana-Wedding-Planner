import Link from 'next/link';
import { LuInstagram as Instagram, LuMail as Mail, LuMapPin as MapPin, LuPhone as Phone } from 'react-icons/lu';
import type { SiteLayout, SiteSettings } from '../lib/sanity-data';
import { safeMailtoHref, safeTelHref } from '../lib/safe-url';

type Props = { settings: SiteSettings | null; layout: SiteLayout | null };

const fallbackLinks = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/backstage', label: 'Backstage' },
  { href: '/contact', label: 'Contact' },
];

export function SiteFooter({ settings, layout }: Props) {
  const footerLinks = layout?.footerNavLinks?.length
    ? layout.footerNavLinks.map((item) => ({ href: item.link, label: item.label }))
    : fallbackLinks;
  const socials = layout?.footerSocialLinks?.length ? layout.footerSocialLinks : (settings?.socialLinks || []);
  const logo = layout?.headerLogo || settings?.logo;
  const email = layout?.footerEmail || settings?.email || '';
  const phone = layout?.footerPhone || settings?.phone || '';
  const address = layout?.footerAddress || settings?.address || settings?.location || '';
  // CMS values are untrusted: a malformed address/number renders as plain text,
  // never as a broken `mailto:`/`tel:` target.
  const emailHref = safeMailtoHref(email);
  const phoneHref = safeTelHref(phone);

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-script text-4xl text-primary-foreground/90">
                <Link href="/" className="flex items-center gap-3">
                  {logo ? (
                    <img src={logo} alt={settings?.name || 'D'} className="h-12 w-auto brightness-0 invert" />
                  ) : (
                    settings?.name || 'D'
                  )}
                </Link>
              </span>
              <div>
                <p className="font-serif text-xl">{settings?.name || 'D'}</p>
                <p className="text-xs uppercase tracking-wide-lg text-primary-foreground/60">
                  {settings?.tagline || ''}
                </p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70 max-w-xs leading-relaxed">
              {layout?.footerDescription || ''}
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs uppercase tracking-wide-lg text-primary-foreground/70 mb-4">
              {layout?.footerExploreLabel || 'Explore'}
            </p>
            <ul className="grid grid-cols-2 gap-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group relative inline-block py-0.5 text-sm text-primary-foreground/80 transition-colors duration-200 hover:text-white focus-visible:text-white"
                  >
                    {link.label}
                    {/* Same affordance as the header: the accent line slides in on
                        hover/keyboard focus. The label itself stays white — the rose
                        accent tint only reaches ~3:1 on this charcoal background,
                        which is fine for a state line but not for 14px text. */}
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 right-0 h-px origin-left scale-x-0 bg-accent-overlay transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-wide-lg text-primary-foreground/70 mb-4">
              {layout?.footerContactLabel || 'Get in Touch'}
            </p>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              {/* The whole row is the link, so the icon and the label share one hover
                  state and the target is big enough for touch (WCAG 2.5.8). */}
              <li>
                {emailHref ? (
                  <a
                    href={emailHref}
                    className="group -mx-2 flex items-center gap-2 rounded-sm px-2 py-1 transition-colors duration-200 hover:bg-primary-foreground/5 hover:text-white focus-visible:bg-primary-foreground/5 focus-visible:text-white"
                  >
                    <Mail className="w-4 h-4 text-accent-overlay shrink-0 transition-colors duration-200 group-hover:text-white group-focus-visible:text-white" aria-hidden="true" />
                    <span className="min-w-0 break-words">{email}</span>
                  </a>
                ) : (
                  <span className="flex items-center gap-2 px-2 py-1">
                    <Mail className="w-4 h-4 text-accent-overlay shrink-0" aria-hidden="true" />
                    <span className="min-w-0 break-words">{email}</span>
                  </span>
                )}
              </li>
              <li>
                {phoneHref ? (
                  <a
                    href={phoneHref}
                    className="group -mx-2 flex items-center gap-2 rounded-sm px-2 py-1 transition-colors duration-200 hover:bg-primary-foreground/5 hover:text-white focus-visible:bg-primary-foreground/5 focus-visible:text-white"
                  >
                    <Phone className="w-4 h-4 text-accent-overlay shrink-0 transition-colors duration-200 group-hover:text-white group-focus-visible:text-white" aria-hidden="true" />
                    <span className="min-w-0 break-words">{phone}</span>
                  </a>
                ) : (
                  <span className="flex items-center gap-2 px-2 py-1">
                    <Phone className="w-4 h-4 text-accent-overlay shrink-0" aria-hidden="true" />
                    <span className="min-w-0 break-words">{phone}</span>
                  </span>
                )}
              </li>
              <li className="flex items-center gap-2 py-1">
                <MapPin className="w-4 h-4 text-accent-overlay shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-words">{address}</span>
              </li>
            </ul>
            {socials.find((item) => item.platform === 'instagram')?.url ? (
              <div className="flex items-center gap-4 mt-4">
                <a
                  href={socials.find((item) => item.platform === 'instagram')?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex items-center justify-center p-2 -my-1 -ml-2 rounded-full text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-white focus-visible:bg-primary-foreground/10 focus-visible:text-white transition-colors duration-200"
                >
                  <Instagram className="w-5 h-5" aria-hidden="true" />
                </a>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/20 flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-3">
          <div className="text-xs text-primary-foreground/70 items-center sm:items-start flex flex-col">
            <p className="text-sm">
              {layout?.copyrightText || `© ${new Date().getFullYear()} ${settings?.name || 'Site Title'} Wedding Planning. All rights reserved.`}
            </p>
            <p>
              Made with ❤️ by <a href="https://annanikiforova.vercel.app/?utm_source=wedding" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline decoration-accent-overlay decoration-1 underline-offset-4 focus-visible:text-white focus-visible:underline transition-colors duration-200">Anna Nikiforova</a>
            </p>
          </div>
          <p className="text-xs text-primary-foreground/70 ">
            {address}
          </p>
        </div>
      </div>
    </footer >
  );
}
