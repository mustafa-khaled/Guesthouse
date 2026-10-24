import { StaffShell } from './staff-nav';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <StaffShell>{children}</StaffShell>;
}
