import { describe, it, expect } from 'vitest';
import { Role, hasMinimumRole } from '../../common/enums/role.enum';

describe('RBAC role hierarchy', () => {
  it('MODERATOR has minimum MODERATOR access', () => {
    expect(hasMinimumRole(Role.MODERATOR, Role.MODERATOR)).toBe(true);
  });

  it('USER does not have MODERATOR access', () => {
    expect(hasMinimumRole(Role.USER, Role.MODERATOR)).toBe(false);
  });

  it('ADMIN has minimum MODERATOR access', () => {
    expect(hasMinimumRole(Role.ADMIN, Role.MODERATOR)).toBe(true);
  });
});
