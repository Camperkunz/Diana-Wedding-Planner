import Link from 'next/link';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { getSiteSettings } from '../lib/data';

const footerLinks = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/backstage', label: 'Backstage' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export function SiteFooter() {
  const settings = getSiteSettings();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-script text-4xl text-primary-foreground/90">
                {settings.monogram}
              </span>
              <div>
                <p className="font-serif text-xl">{settings.name}</p>
                <p className="text-xs uppercase tracking-wide-lg text-primary-foreground/60">
                  {settings.tagline}
                </p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70 max-w-xs leading-relaxed">
              Independent wedding planning, personally. Based in Ottawa, serving couples
              across Eastern Ontario and beyond.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs uppercase tracking-wide-lg text-primary-foreground/50 mb-4">
              Explore
            </p>
            <ul className="grid grid-cols-2 gap-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/80 hover:text-accent transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-wide-lg text-primary-foreground/50 mb-4">
              Get in Touch
            </p>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-accent transition-colors">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent shrink-0" />
                <span>{settings.serviceArea}</span>
              </li>
            </ul>
            <div className="flex items-center gap-4 mt-4">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-primary-foreground/70 hover:text-accent transition-colors duration-200"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} {settings.name} Wedding Planning. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/40">
            Ottawa, Ontario · Canada
          </p>
        </div>
      </div>
    </footer>
  );
}
