'use client';

import { TabNav } from '@/components/ui/tab-nav';
import type { NavItem } from '@/lib/navigation';

export interface PropertyTabsProps {
  propertyId: string;
  className?: string;
}

/**
 * The property record and its inventory are two views of one listing, so they
 * share a route-level tab pair rather than nesting one inside the other.
 */
export function PropertyTabs({ propertyId, className }: PropertyTabsProps) {
  const items: NavItem[] = [
    { href: `/admin/properties/${propertyId}`, label: 'Details', exact: true },
    { href: `/admin/properties/${propertyId}/inventory`, label: 'Inventory' },
  ];

  return <TabNav items={items} label="Property sections" className={className} />;
}
