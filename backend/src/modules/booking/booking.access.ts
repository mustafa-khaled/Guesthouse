import { IBooking } from '../../models/booking.model';
import { AuthUser } from '../../common/types/express.d';
import { Role, hasMinimumRole } from '../../common/enums/role.enum';
import { ForbiddenError } from '../../common/errors/http.errors';
import { guestService } from '../guest/guest.service';

export async function assertBookingAccess(booking: IBooking, user: AuthUser): Promise<void> {
  if (hasMinimumRole(user.role, Role.MODERATOR)) {
    return;
  }

  const guestId =
    typeof booking.guestId === 'object' && booking.guestId !== null && '_id' in booking.guestId
      ? String((booking.guestId as { _id: { toString(): string } })._id)
      : String(booking.guestId);

  const guest = await guestService.findById(guestId);

  if (guest.userId?.toString() === user.id) {
    return;
  }

  throw new ForbiddenError('You do not have access to this booking');
}
