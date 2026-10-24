'use client';

import { PortalShell } from '@/components/shared/portal-shell';
import { useAuth } from '@/hooks/useAuth';

const allItems = [
  { href: '/staff/front-desk', label: 'Front desk', minRole: 'moderator' as const },
  { href: '/staff/bookings', label: 'Bookings', minRole: 'moderator' as const },
  { href: '/staff/guests', label: 'Guests', minRole: 'moderator' as const },
  { href: '/staff/housekeeping', label: 'Housekeeping', minRole: 'editor' as const },
];

export function StaffShell({ children }: { children: React.ReactNode }) {
  const { hasRole } = useAuth();
  const items = allItems.filter((item) => hasRole(item.minRole));

  return (
    <PortalShell eyebrow="Front of house" navLabel="Staff" items={items}>
      {children}
    </PortalShell>
  );
}
