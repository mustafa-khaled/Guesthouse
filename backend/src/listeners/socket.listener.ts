import {
  on,
  EventType,
  BookingEventPayload,
  BookingCancelledPayload,
  BookingCheckedInPayload,
  BookingCheckedOutPayload,
  PaymentEventPayload,
} from "../lib/events";
import {
  emitToFrontDesk,
  emitToHousekeeping,
  emitToDashboard,
  emitToUser,
} from "../lib/socket";
import { logger } from "../lib/logger";

export enum SocketEvent {
  BOOKING_CREATED = "booking:created",
  BOOKING_CONFIRMED = "booking:confirmed",
  BOOKING_CANCELLED = "booking:cancelled",
  BOOKING_CHECKED_IN = "booking:checked_in",
  BOOKING_CHECKED_OUT = "booking:checked_out",
  BOOKING_UPDATED = "booking:updated",
  
  PAYMENT_RECEIVED = "payment:received",
  PAYMENT_FAILED = "payment:failed",
  PAYMENT_REFUNDED = "payment:refunded",
  
  ROOM_STATUS_CHANGED = "room:status_changed",
  HOUSEKEEPING_TASK_CREATED = "housekeeping:task_created",
  HOUSEKEEPING_TASK_UPDATED = "housekeeping:task_updated",
  HOUSEKEEPING_TASK_COMPLETED = "housekeeping:task_completed",
  
  DASHBOARD_UPDATE = "dashboard:update",
  NOTIFICATION = "notification",
}

export function registerSocketListeners(): void {
  logger.info("Registering socket event listeners");

  on(EventType.BOOKING_CREATED, (payload: BookingEventPayload) => {
    emitToFrontDesk(payload.propertyId, SocketEvent.BOOKING_CREATED, {
      bookingId: payload.bookingId,
      confirmationNumber: payload.confirmationNumber,
      guestName: payload.guestName,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      totalAmount: payload.totalAmount,
      timestamp: new Date().toISOString(),
    });

    emitToDashboard(payload.propertyId, SocketEvent.DASHBOARD_UPDATE, {
      type: "new_booking",
      data: {
        bookingId: payload.bookingId,
        confirmationNumber: payload.confirmationNumber,
        totalAmount: payload.totalAmount,
      },
    });

    if (payload.userId) {
      emitToUser(payload.userId, SocketEvent.NOTIFICATION, {
        type: "booking_created",
        title: "Booking Created",
        message: `Booking ${payload.confirmationNumber} has been created`,
        bookingId: payload.bookingId,
      });
    }
  });

  on(EventType.BOOKING_CONFIRMED, (payload: BookingEventPayload) => {
    emitToFrontDesk(payload.propertyId, SocketEvent.BOOKING_CONFIRMED, {
      bookingId: payload.bookingId,
      confirmationNumber: payload.confirmationNumber,
      guestName: payload.guestName,
      timestamp: new Date().toISOString(),
    });

    emitToDashboard(payload.propertyId, SocketEvent.DASHBOARD_UPDATE, {
      type: "booking_confirmed",
      data: { bookingId: payload.bookingId },
    });
  });

  on(EventType.BOOKING_CANCELLED, (payload: BookingCancelledPayload) => {
    emitToFrontDesk(payload.propertyId, SocketEvent.BOOKING_CANCELLED, {
      bookingId: payload.bookingId,
      confirmationNumber: payload.confirmationNumber,
      guestName: payload.guestName,
      reason: payload.reason,
      refundAmount: payload.refundAmount,
      timestamp: new Date().toISOString(),
    });

    emitToDashboard(payload.propertyId, SocketEvent.DASHBOARD_UPDATE, {
      type: "booking_cancelled",
      data: {
        bookingId: payload.bookingId,
        refundAmount: payload.refundAmount,
      },
    });
  });

  on(EventType.BOOKING_CHECKED_IN, (payload: BookingCheckedInPayload) => {
    emitToFrontDesk(payload.propertyId, SocketEvent.BOOKING_CHECKED_IN, {
      bookingId: payload.bookingId,
      confirmationNumber: payload.confirmationNumber,
      guestName: payload.guestName,
      roomId: payload.roomId,
      roomNumber: payload.roomNumber,
      timestamp: new Date().toISOString(),
    });

    emitToHousekeeping(payload.propertyId, SocketEvent.ROOM_STATUS_CHANGED, {
      roomId: payload.roomId,
      roomNumber: payload.roomNumber,
      status: "occupied",
      bookingId: payload.bookingId,
    });

    emitToDashboard(payload.propertyId, SocketEvent.DASHBOARD_UPDATE, {
      type: "check_in",
      data: {
        bookingId: payload.bookingId,
        roomNumber: payload.roomNumber,
      },
    });
  });

  on(EventType.BOOKING_CHECKED_OUT, (payload: BookingCheckedOutPayload) => {
    emitToFrontDesk(payload.propertyId, SocketEvent.BOOKING_CHECKED_OUT, {
      bookingId: payload.bookingId,
      confirmationNumber: payload.confirmationNumber,
      guestName: payload.guestName,
      roomId: payload.roomId,
      finalAmount: payload.finalAmount,
      timestamp: new Date().toISOString(),
    });

    emitToHousekeeping(payload.propertyId, SocketEvent.ROOM_STATUS_CHANGED, {
      roomId: payload.roomId,
      status: "dirty",
      needsCleaning: true,
      priority: "normal",
    });

    emitToHousekeeping(payload.propertyId, SocketEvent.HOUSEKEEPING_TASK_CREATED, {
      roomId: payload.roomId,
      type: "checkout_cleaning",
      priority: "normal",
    });

    emitToDashboard(payload.propertyId, SocketEvent.DASHBOARD_UPDATE, {
      type: "check_out",
      data: {
        bookingId: payload.bookingId,
        finalAmount: payload.finalAmount,
      },
    });
  });

  on(EventType.PAYMENT_RECEIVED, (payload: PaymentEventPayload) => {
    emitToFrontDesk(payload.propertyId || "", SocketEvent.PAYMENT_RECEIVED, {
      paymentId: payload.paymentId,
      bookingId: payload.bookingId,
      amount: payload.amount,
      currency: payload.currency,
      method: payload.paymentMethod,
      timestamp: new Date().toISOString(),
    });

    if (payload.propertyId) {
      emitToDashboard(payload.propertyId, SocketEvent.DASHBOARD_UPDATE, {
        type: "payment_received",
        data: {
          paymentId: payload.paymentId,
          amount: payload.amount,
          currency: payload.currency,
        },
      });
    }
  });

  on(EventType.PAYMENT_FAILED, (payload: PaymentEventPayload) => {
    emitToFrontDesk(payload.propertyId || "", SocketEvent.PAYMENT_FAILED, {
      paymentId: payload.paymentId,
      bookingId: payload.bookingId,
      amount: payload.amount,
      timestamp: new Date().toISOString(),
    });
  });

  on(EventType.PAYMENT_REFUNDED, (payload: PaymentEventPayload) => {
    emitToFrontDesk(payload.propertyId || "", SocketEvent.PAYMENT_REFUNDED, {
      paymentId: payload.paymentId,
      bookingId: payload.bookingId,
      amount: payload.amount,
      timestamp: new Date().toISOString(),
    });

    if (payload.propertyId) {
      emitToDashboard(payload.propertyId, SocketEvent.DASHBOARD_UPDATE, {
        type: "payment_refunded",
        data: {
          paymentId: payload.paymentId,
          amount: payload.amount,
        },
      });
    }
  });

  logger.info("Socket event listeners registered");
}

export function emitHousekeepingTaskUpdate(
  propertyId: string,
  taskId: string,
  status: string,
  roomNumber?: string
): void {
  emitToHousekeeping(propertyId, SocketEvent.HOUSEKEEPING_TASK_UPDATED, {
    taskId,
    status,
    roomNumber,
    timestamp: new Date().toISOString(),
  });
}

export function emitRoomStatusChange(
  propertyId: string,
  roomId: string,
  roomNumber: string,
  status: string
): void {
  emitToHousekeeping(propertyId, SocketEvent.ROOM_STATUS_CHANGED, {
    roomId,
    roomNumber,
    status,
    timestamp: new Date().toISOString(),
  });

  emitToFrontDesk(propertyId, SocketEvent.ROOM_STATUS_CHANGED, {
    roomId,
    roomNumber,
    status,
    timestamp: new Date().toISOString(),
  });
}
