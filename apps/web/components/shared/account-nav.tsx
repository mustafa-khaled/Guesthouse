'use client';

import { TabNav } from '@/components/ui/tab-nav';
import { accountNav } from '@/lib/navigation';

export function AccountNav() {
  return <TabNav items={accountNav} label="Account" />;
}
