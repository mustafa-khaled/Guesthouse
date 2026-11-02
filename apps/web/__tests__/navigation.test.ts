import { describe, expect, it } from 'vitest';
import {
  accountNav,
  filterNavForRole,
  guestNav,
  isNavItemActive,
  workspaceNav,
  type NavItem,
} from '@/lib/navigation';
import type { Role } from '@/types';
import { hasMinimumRole } from '@guesthouse/shared';

function item(href: string, exact = false): NavItem {
  return { href, label: href, exact };
}

describe('isNavItemActive', () => {
  it('marks a section root as active', () => {
    expect(isNavItemActive('/properties', item('/properties'))).toBe(true);
  });

  it('keeps a section active on its child routes', () => {
    expect(isNavItemActive('/properties/seaside-resort-spa', item('/properties'))).toBe(true);
  });

  it('does not match a sibling path that only shares a prefix', () => {
    expect(isNavItemActive('/properties-archive', item('/properties'))).toBe(false);
    expect(isNavItemActive('/spa-guide', item('/spa'))).toBe(false);
  });

  it('limits exact items to their own path', () => {
    const overview = item('/account', true);
    expect(isNavItemActive('/account', overview)).toBe(true);
    expect(isNavItemActive('/account/bookings', overview)).toBe(false);
  });

  it('never marks an anchor or the homepage as current', () => {
    expect(isNavItemActive('/', item('/'))).toBe(true);
    expect(isNavItemActive('/spa', item('/#faq'))).toBe(false);
  });
});

describe('filterNavForRole', () => {
  const viewer = (role: Role) => (required: Role) => hasMinimumRole(role, required);

  it('shows every workspace link to an admin', () => {
    expect(filterNavForRole(workspaceNav, viewer('admin'))).toHaveLength(workspaceNav.length);
  });

  it('shows only front of house to an editor', () => {
    const visible = filterNavForRole(workspaceNav, viewer('editor'));
    expect(visible.map((entry) => entry.href)).toEqual(['/staff/front-desk']);
  });

  it('hides the workspace from a guest', () => {
    expect(filterNavForRole(workspaceNav, viewer('user'))).toHaveLength(0);
  });
});

describe('navigation config', () => {
  it('points every guest link at a real route, not a homepage fragment', () => {
    for (const entry of [...guestNav, ...accountNav]) {
      expect(entry.href.startsWith('/')).toBe(true);
      expect(entry.href).not.toContain('#');
    }
  });

  it('gives every guest chapter a folio', () => {
    expect(guestNav.every((entry) => Boolean(entry.folio))).toBe(true);
  });
});
