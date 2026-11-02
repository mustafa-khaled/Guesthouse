'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isNavItemActive, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export interface TabNavProps {
  items: NavItem[];
  label: string;
  className?: string;
}

/**
 * Sibling navigation for account and portal sections. Shares the hairline rule
 * and brand marker used by the site header so both surfaces read as one system.
 */
export function TabNav({ items, label, className }: TabNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      className={cn('border-line -mx-5 overflow-x-auto border-b px-5 sm:mx-0 sm:px-0', className)}
    >
      <ul className="flex min-w-max items-center gap-6">
        {items.map((item) => {
          const isActive = isNavItemActive(pathname, item);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'focus-ring -mb-px inline-flex min-h-12 items-center border-b-2 text-sm transition-colors duration-200',
                  isActive
                    ? 'border-brand text-ink font-medium'
                    : 'text-muted hover:text-ink border-transparent',
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
