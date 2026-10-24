import { PortalShell } from '@/components/shared/portal-shell';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/properties', label: 'Properties' },
  { href: '/admin/promotions', label: 'Promotions' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/audit-logs', label: 'Audit logs' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell eyebrow="Operations" navLabel="Admin" items={navItems}>
      {children}
    </PortalShell>
  );
}
