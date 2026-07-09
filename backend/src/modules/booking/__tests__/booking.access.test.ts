import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenError } from '../../../common/errors/http.errors';
import { Role } from '../../../common/enums/role.enum';
import { AuthUser } from '../../../common/types/express.d';

vi.mock('../../guest/guest.service', () => ({
  guestService: {
    findById: vi.fn(),
  },
}));

import { guestService } from '../../guest/guest.service';
import { assertBookingAccess } from '../booking.access';

describe('assertBookingAccess', () => {
  const guestUser: AuthUser = {
    id: 'user-1',
    email: 'guest@example.com',
    role: Role.USER,
    isEmailVerified: true,
  };

  const staffUser: AuthUser = {
    id: 'staff-1',
    email: 'staff@example.com',
    role: Role.MODERATOR,
    isEmailVerified: true,
  };

  const booking = {
    guestId: { _id: { toString: () => 'guest-1' } },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows staff with MODERATOR role', async () => {
    await expect(assertBookingAccess(booking, staffUser)).resolves.toBeUndefined();
    expect(guestService.findById).not.toHaveBeenCalled();
  });

  it('allows guest who owns the booking', async () => {
    vi.mocked(guestService.findById).mockResolvedValue({
      userId: { toString: () => 'user-1' },
    } as any);
    await expect(assertBookingAccess(booking, guestUser)).resolves.toBeUndefined();
  });

  it('denies guest who does not own the booking', async () => {
    vi.mocked(guestService.findById).mockResolvedValue({
      userId: { toString: () => 'other-user' },
    } as any);
    await expect(assertBookingAccess(booking, guestUser)).rejects.toThrow(ForbiddenError);
  });
});
