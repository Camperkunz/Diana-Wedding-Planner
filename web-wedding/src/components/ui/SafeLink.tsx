import Link from 'next/link';
import type { ReactNode } from 'react';
import { safeLinkTarget } from '@/lib/safe-url';

type SafeLinkProps = {
  /** Raw href coming from the CMS (already built URLs are fine too). */
  href?: string | null;
  /** Same-origin fallback used when `href` is empty or not allowed. */
  fallbackHref?: string;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
};

/**
 * Renders a CMS-driven link through `safeLinkTarget`:
 *
 *  - `javascript:` / `data:` / unknown schemes fall back to a safe internal path,
 *  - in-app links go through `next/link`,
 *  - links to other sites open in a new tab with `rel="noopener noreferrer"`.
 */
export default function SafeLink({
  href,
  fallbackHref = '/',
  className,
  children,
  ...rest
}: SafeLinkProps) {
  const target = safeLinkTarget(href, fallbackHref);

  if (target.isInternal) {
    return (
      <Link href={target.href} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={target.href}
      className={className}
      {...(target.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
