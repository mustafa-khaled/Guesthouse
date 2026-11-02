import type { Role } from '@/types';

const roleLabels: Record<Role, string> = {
  admin: 'Administrator',
  editor: 'Manager',
  moderator: 'Staff',
  viewer: 'Observer',
  user: 'Guest',
};

/** Two-letter monogram for identity chips, falling back to the house initials. */
export function initials(name?: string) {
  if (!name) return 'SS';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
  return letters || 'SS';
}

export function roleLabel(role?: Role) {
  return role ? roleLabels[role] : roleLabels.user;
}
