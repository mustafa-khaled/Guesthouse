'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isNavItemActive, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export interface NavLinkProps {
  item: NavItem;
  onNavigate?: () => void;
  className?: string;
}

/**
 * Header rail link: chapter numeral plus label, with a hairline underline that
 * marks the current section. The numeral is decorative, the label carries the
 * meaning.
 */
export function NavLink({ item, onNavigate, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = isNavItemActive(pathname, item);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'focus-ring group inline-flex items-baseline gap-1.5 border-b-2 pb-1 text-sm transition-colors duration-200',
        isActive
          ? 'border-brand text-ink font-medium'
          : 'hover:border-line-strong hover:text-ink text-muted border-transparent',
        className,
      )}
    >
      {item.folio && (
        <span
          aria-hidden
          className={cn(
            'tabular font-serif text-[11px] leading-none',
            isActive ? 'text-brand' : 'text-brand/40 group-hover:text-brand/70',
          )}
        >
          {item.folio}
        </span>
      )}
      <span>{item.label}</span>
    </Link>
  );
}
