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
  /**
   * Prefetch the route in the background (hover / viewport).
   *
   * Off by default: every prefetch is a real Worker invocation — a KV read plus
   * a tag-cache RPC — and on the free Cloudflare plan those are the scarce
   * resources. Opt in only on the few high-intent CTAs (see the hero).
   */
  prefetch?: boolean;
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
  prefetch = false,
  ...rest
}: SafeLinkProps) {
  const target = safeLinkTarget(href, fallbackHref);

  if (target.isInternal) {
    return (
      <Link
        href={target.href}
        prefetch={prefetch}
        className={className}
        {...rest}
      >
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
