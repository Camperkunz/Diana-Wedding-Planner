'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuMessageCircle as MessageCircle } from 'react-icons/lu';
import { cn } from '../lib/utils';

export function FloatingContact() {
  const pathname = usePathname();

  if (pathname === '/contact') return null;

  return (
    <Link
      href="/contact"
      className={cn(
        'fixed bottom-6 right-6 z-40 group',
        'flex items-center gap-2',
        'bg-accent text-accent-foreground',
        'shadow-lg hover:shadow-xl',
        'transition-all duration-300 hover:scale-105',
        'px-7 py-3 md:px-8 md:py-3.5'
      )}
      aria-label="Contact Diana"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm font-medium tracking-wide hidden sm:inline">
        Let&apos;s Talk
      </span>
    </Link>
  );
}
