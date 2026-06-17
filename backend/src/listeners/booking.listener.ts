import {
  on,
  EventType,
  BookingEventPayload,
  BookingCancelledPayload,
  BookingCheckedInPayload,
  BookingCheckedOutPayload,
} from "../lib/events";
import { sendEmail } from "../lib/email";
import { logger } from "../lib/logger";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function registerBookingListeners(): void {
  logger.info("Registering booking event listeners");

  on(EventType.BOOKING_CREATED, async (payload: BookingEventPayload) => {
    logger.info({ bookingId: payload.bookingId }, "Booking created event received");

    await sendEmail(
      payload.guestEmail,
      `Booking Confirmation - ${payload.confirmationNumber}`,
      `
        <h1>Booking Confirmation</h1>
        <p>Dear ${payload.guestName},</p>
        <p>Thank you for your reservation. Your booking has been received.</p>
        <p><strong>Confirmation Number:</strong> ${payload.confirmationNumber}</p>
        <p><strong>Check-in:</strong> ${formatDate(payload.checkIn)}</p>
        <p><strong>Check-out:</strong> ${formatDate(payload.checkOut)}</p>
        <p><strong>Total:</strong> $${payload.totalAmount.toFixed(2)}</p>
        <p>We look forward to welcoming you!</p>
      `
    );
  });

  on(EventType.BOOKING_CONFIRMED, async (payload: BookingEventPayload) => {
    logger.info({ bookingId: payload.bookingId }, "Booking confirmed event received");

    await sendEmail(
      payload.guestEmail,
      `Booking Confirmed - ${payload.confirmationNumber}`,
      `
        <h1>Booking Confirmed</h1>
        <p>Dear ${payload.guestName},</p>
        <p>Great news! Your booking has been confirmed.</p>
        <p><strong>Confirmation Number:</strong> ${payload.confirmationNumber}</p>
        <p><strong>Check-in:</strong> ${formatDate(payload.checkIn)}</p>
        <p><strong>Check-out:</strong> ${formatDate(payload.checkOut)}</p>
        <p>We look forward to welcoming you!</p>
      `
    );
  });

  on(EventType.BOOKING_CANCELLED, async (payload: BookingCancelledPayload) => {
    logger.info({ bookingId: payload.bookingId }, "Booking cancelled event received");

    const refundText = payload.refundAmount && payload.refundAmount > 0
      ? `<p>A refund of $${payload.refundAmount.toFixed(2)} will be processed within 5-10 business days.</p>`
      : "";

    await sendEmail(
      payload.guestEmail,
      `Booking Cancelled - ${payload.confirmationNumber}`,
      `
        <h1>Booking Cancellation</h1>
        <p>Dear ${payload.guestName},</p>
        <p>Your booking has been cancelled as requested.</p>
        <p><strong>Confirmation Number:</strong> ${payload.confirmationNumber}</p>
        <p><strong>Original Check-in:</strong> ${formatDate(payload.checkIn)}</p>
        ${refundText}
        <p>We hope to welcome you in the future.</p>
      `
    );
  });

  on(EventType.BOOKING_CHECKED_IN, async (payload: BookingCheckedInPayload) => {
    logger.info(
      { bookingId: payload.bookingId, roomNumber: payload.roomNumber },
      "Guest checked in event received"
    );

    await sendEmail(
      payload.guestEmail,
      `Welcome! - Room ${payload.roomNumber}`,
      `
        <h1>Welcome!</h1>
        <p>Dear ${payload.guestName},</p>
        <p>Welcome to your stay!</p>
        <p><strong>Room Number:</strong> ${payload.roomNumber}</p>
        <p><strong>Check-out:</strong> ${formatDate(payload.checkOut)}</p>
        <p>If you need anything during your stay, please don't hesitate to contact the front desk.</p>
        <p>Enjoy your stay!</p>
      `
    );
  });

  on(EventType.BOOKING_CHECKED_OUT, async (payload: BookingCheckedOutPayload) => {
    logger.info({ bookingId: payload.bookingId }, "Guest checked out event received");

    await sendEmail(
      payload.guestEmail,
      `Thank You for Your Stay - ${payload.confirmationNumber}`,
      `
        <h1>Thank You!</h1>
        <p>Dear ${payload.guestName},</p>
        <p>Thank you for staying with us. We hope you had a wonderful experience.</p>
        <p><strong>Final Amount:</strong> $${payload.finalAmount.toFixed(2)}</p>
        <p>We would love to hear about your experience. Please consider leaving us a review.</p>
        <p>We hope to see you again soon!</p>
      `
    );
  });

  logger.info("Booking event listeners registered");
}
