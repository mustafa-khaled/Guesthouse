'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const allItems = [
  { href: '/staff/front-desk', label: 'Front Desk', minRole: 'moderator' as const },
  { href: '/staff/bookings', label: 'Bookings', minRole: 'moderator' as const },
  { href: '/staff/guests', label: 'Guests', minRole: 'moderator' as const },
  { href: '/staff/housekeeping', label: 'Housekeeping', minRole: 'editor' as const },
];

export function StaffNav() {
  const { hasRole } = useAuth();
  const items = allItems.filter((item) => hasRole(item.minRole));

  return (
    <nav className="space-y-1 p-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
