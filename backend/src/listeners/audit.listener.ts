import {
  on,
  EventType,
  BookingEventPayload,
  BookingCancelledPayload,
  BookingCheckedInPayload,
  BookingCheckedOutPayload,
  PaymentEventPayload,
} from "../lib/events";
import { audit, AuditAction, AuditResource } from "../lib/audit";
import { logger } from "../lib/logger";

export function registerAuditListeners(): void {
  logger.info("Registering audit event listeners");

  on(EventType.BOOKING_CREATED, async (payload: BookingEventPayload) => {
    await audit({
      action: AuditAction.CREATE,
      resource: AuditResource.BOOKING,
      resourceId: payload.bookingId,
      resourceName: payload.confirmationNumber,
      details: {
        propertyId: payload.propertyId,
        guestId: payload.guestId,
        guestEmail: payload.guestEmail,
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        totalAmount: payload.totalAmount,
      },
    }, {
      userId: payload.userId,
    });
  });

  on(EventType.BOOKING_CONFIRMED, async (payload: BookingEventPayload) => {
    await audit({
      action: AuditAction.BOOKING_CONFIRM,
      resource: AuditResource.BOOKING,
      resourceId: payload.bookingId,
      resourceName: payload.confirmationNumber,
      details: {
        propertyId: payload.propertyId,
        guestEmail: payload.guestEmail,
      },
    }, {
      userId: payload.userId,
    });
  });

  on(EventType.BOOKING_CANCELLED, async (payload: BookingCancelledPayload) => {
    await audit({
      action: AuditAction.BOOKING_CANCEL,
      resource: AuditResource.BOOKING,
      resourceId: payload.bookingId,
      resourceName: payload.confirmationNumber,
      details: {
        propertyId: payload.propertyId,
        guestEmail: payload.guestEmail,
        reason: payload.reason,
        refundAmount: payload.refundAmount,
      },
    }, {
      userId: payload.userId,
    });
  });

  on(EventType.BOOKING_CHECKED_IN, async (payload: BookingCheckedInPayload) => {
    await audit({
      action: AuditAction.BOOKING_CHECK_IN,
      resource: AuditResource.BOOKING,
      resourceId: payload.bookingId,
      resourceName: payload.confirmationNumber,
      details: {
        propertyId: payload.propertyId,
        guestEmail: payload.guestEmail,
        roomId: payload.roomId,
        roomNumber: payload.roomNumber,
      },
    }, {
      userId: payload.userId,
    });
  });

  on(EventType.BOOKING_CHECKED_OUT, async (payload: BookingCheckedOutPayload) => {
    await audit({
      action: AuditAction.BOOKING_CHECK_OUT,
      resource: AuditResource.BOOKING,
      resourceId: payload.bookingId,
      resourceName: payload.confirmationNumber,
      details: {
        propertyId: payload.propertyId,
        guestEmail: payload.guestEmail,
        finalAmount: payload.finalAmount,
      },
    }, {
      userId: payload.userId,
    });
  });

  on(EventType.PAYMENT_RECEIVED, async (payload: PaymentEventPayload) => {
    await audit({
      action: AuditAction.PAYMENT_RECEIVED,
      resource: AuditResource.PAYMENT,
      resourceId: payload.paymentId,
      details: {
        bookingId: payload.bookingId,
        guestEmail: payload.guestEmail,
        amount: payload.amount,
        currency: payload.currency,
        paymentMethod: payload.paymentMethod,
      },
    }, {
      userId: payload.userId,
    });
  });

  on(EventType.PAYMENT_REFUNDED, async (payload: PaymentEventPayload) => {
    await audit({
      action: AuditAction.PAYMENT_REFUND,
      resource: AuditResource.PAYMENT,
      resourceId: payload.paymentId,
      details: {
        bookingId: payload.bookingId,
        guestEmail: payload.guestEmail,
        amount: payload.amount,
        currency: payload.currency,
      },
    }, {
      userId: payload.userId,
    });
  });

  logger.info("Audit event listeners registered");
}
