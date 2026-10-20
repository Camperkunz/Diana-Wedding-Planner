'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
  /** Extra work on click — the header uses it to close the mobile menu. */
  onClick?: () => void;
};

/**
 * The logo link: always points at the home page.
 *
 * `next/link` does nothing when the visitor is already on `/`, so someone
 * sitting at the bottom of the home page would click the logo and stay put.
 * On the home page we take over instead: prevent the no-op navigation and ask
 * the window to scroll back to the top. No explicit `behavior` is passed on
 * purpose — the CSS `scroll-behavior: smooth` rule in `globals.css` animates
 * the jump, and that same file switches it back to instant under
 * `prefers-reduced-motion`. No extra markup, request or dependency is added:
 * the server still renders a plain `<a href="/">` for crawlers.
 *
 * Modified clicks (Cmd/Ctrl/Shift + click → new tab) are left to the browser.
 */
export function HomeLink({ children, className, onClick, ...rest }: Props) {
  const pathname = usePathname();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.();

    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (pathname !== '/' || modified) return;

    event.preventDefault();
    window.scrollTo({ top: 0 });
  };

  return (
    <Link prefetch={false} href="/" className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}