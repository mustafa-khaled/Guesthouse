'use client';

import { PortalShell } from '@/components/shared/portal-shell';
import { filterNavForRole, staffNav } from '@/lib/navigation';
import { useAuth } from '@/hooks/useAuth';

export function StaffShell({ children }: { children: React.ReactNode }) {
  const { hasRole } = useAuth();
  const items = filterNavForRole(staffNav, hasRole);

  return (
    <PortalShell eyebrow="Front of house" navLabel="Staff" items={items}>
      {children}
    </PortalShell>
  );
}
