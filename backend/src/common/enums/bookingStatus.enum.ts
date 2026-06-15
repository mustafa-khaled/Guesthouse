export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CHECKED_IN = "checked-in",
  CHECKED_OUT = "checked-out",
  CANCELLED = "cancelled",
  NO_SHOW = "no-show",
}

export const BookingStatusTransitions: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [
    BookingStatus.CHECKED_IN,
    BookingStatus.CANCELLED,
    BookingStatus.NO_SHOW,
  ],
  [BookingStatus.CHECKED_IN]: [BookingStatus.CHECKED_OUT],
  [BookingStatus.CHECKED_OUT]: [],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.NO_SHOW]: [],
};

export function canTransitionTo(
  currentStatus: BookingStatus,
  newStatus: BookingStatus
): boolean {
  return BookingStatusTransitions[currentStatus].includes(newStatus);
}

export function isTerminalStatus(status: BookingStatus): boolean {
  return BookingStatusTransitions[status].length === 0;
}

export function isActiveBooking(status: BookingStatus): boolean {
  return (
    status === BookingStatus.PENDING ||
    status === BookingStatus.CONFIRMED ||
    status === BookingStatus.CHECKED_IN
  );
}

export enum PaymentStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  PAID = "paid",
  REFUNDED = "refunded",
  FAILED = "failed",
}

export enum BookingSource {
  DIRECT = "direct",
  WEBSITE = "website",
  PHONE = "phone",
  WALK_IN = "walk-in",
  BOOKING_COM = "booking.com",
  EXPEDIA = "expedia",
  AIRBNB = "airbnb",
  OTHER = "other",
}
