import type { Role } from '@/types';

export interface NavItem {
  href: string;
  label: string;
  /** Chapter numeral shown in the header rail and mobile sheet. */
  folio?: string;
  /** Minimum role required to see the item. Omit for public navigation. */
  minRole?: Role;
  /** Match the pathname exactly instead of treating `href` as a section root. */
  exact?: boolean;
}

export const guestNav: NavItem[] = [
  { href: '/properties', label: 'Stays', folio: '01' },
  { href: '/spa', label: 'Spa', folio: '02' },
  { href: '/packages', label: 'Packages', folio: '03' },
  { href: '/experiences', label: 'Experiences', folio: '04' },
];

export const accountNav: NavItem[] = [
  { href: '/account', label: 'Overview', exact: true },
  { href: '/account/bookings', label: 'Bookings' },
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/reviews', label: 'Reviews' },
  { href: '/account/billing', label: 'Payment' },
  { href: '/account/settings', label: 'Settings' },
];

/** Links to the operations portals, shown once the user holds the role. */
export const workspaceNav: NavItem[] = [
  { href: '/staff/front-desk', label: 'Front of house', minRole: 'editor' },
  { href: '/admin', label: 'Operations', minRole: 'admin' },
];

export const adminNav: NavItem[] = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/properties', label: 'Properties' },
  { href: '/admin/promotions', label: 'Promotions' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/audit-logs', label: 'Audit logs' },
];

export const staffNav: NavItem[] = [
  { href: '/staff/front-desk', label: 'Front desk', minRole: 'moderator' },
  { href: '/staff/bookings', label: 'Bookings', minRole: 'moderator' },
  { href: '/staff/guests', label: 'Guests', minRole: 'moderator' },
  { href: '/staff/housekeeping', label: 'Housekeeping', minRole: 'editor' },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: 'Stay',
    items: [
      { href: '/properties', label: 'Our stays' },
      { href: '/search', label: 'Book a stay' },
      { href: '/packages', label: 'Wellness packages' },
      { href: '/experiences', label: 'Experiences' },
    ],
  },
  {
    title: 'Wellness',
    items: [
      { href: '/spa', label: 'Garden spa' },
      { href: '/packages', label: 'Retreat packages' },
      { href: '/#stories', label: 'Guest stories' },
      { href: '/#faq', label: 'Questions' },
    ],
  },
  {
    title: 'Help',
    items: [
      { href: '/terms', label: 'Cancellation policy' },
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms of stay' },
      { href: 'mailto:hello@serenestays.com', label: 'Contact us' },
    ],
  },
];

/**
 * A section item stays highlighted for its children (`/properties/[slug]`),
 * while hub items marked `exact` only match their own path.
 */
export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (pathname === item.href) return true;
  if (item.exact || item.href === '/' || item.href.includes('#')) return false;
  return pathname.startsWith(`${item.href}/`);
}

export function filterNavForRole(items: NavItem[], hasRole: (role: Role) => boolean): NavItem[] {
  return items.filter((item) => !item.minRole || hasRole(item.minRole));
}
