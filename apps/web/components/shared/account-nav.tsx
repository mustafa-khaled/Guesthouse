'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/account/bookings', label: 'Bookings' },
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/reviews', label: 'Reviews' },
  { href: '/account/billing', label: 'Payment' },
  { href: '/account/settings', label: 'Settings' },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account"
      className="border-line -mx-5 overflow-x-auto border-b px-5 sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max items-center gap-6">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href === '/account/bookings' && pathname.startsWith('/account/bookings'));

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'focus-ring -mb-px inline-flex min-h-12 items-center border-b-2 text-sm transition-colors duration-200',
                  isActive
                    ? 'border-brand text-ink font-medium'
                    : 'text-muted hover:text-ink border-transparent',
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
