import { PortalShell } from '@/components/shared/portal-shell';
import { adminNav } from '@/lib/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell eyebrow="Operations" navLabel="Admin" items={adminNav}>
      {children}
    </PortalShell>
  );
}
