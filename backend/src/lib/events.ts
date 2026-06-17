import { EventEmitter2 } from "eventemitter2";
import { logger } from "./logger";

export const eventBus = new EventEmitter2({
  wildcard: true,
  delimiter: ":",
  maxListeners: 50,
  verboseMemoryLeak: true,
});

export enum EventType {
  BOOKING_CREATED = "booking:created",
  BOOKING_CONFIRMED = "booking:confirmed",
  BOOKING_CANCELLED = "booking:cancelled",
  BOOKING_CHECKED_IN = "booking:checked_in",
  BOOKING_CHECKED_OUT = "booking:checked_out",
  BOOKING_UPDATED = "booking:updated",

  PAYMENT_RECEIVED = "payment:received",
  PAYMENT_FAILED = "payment:failed",
  PAYMENT_REFUNDED = "payment:refunded",

  GUEST_CREATED = "guest:created",
  GUEST_UPDATED = "guest:updated",

  ROOM_STATUS_CHANGED = "room:status_changed",
  
  HOUSEKEEPING_TASK_CREATED = "housekeeping:task_created",
  HOUSEKEEPING_TASK_COMPLETED = "housekeeping:task_completed",
}

export interface BookingEventPayload {
  bookingId: string;
  confirmationNumber: string;
  propertyId: string;
  guestId: string;
  guestEmail: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  roomTypeId: string;
  totalAmount: number;
  userId?: string;
}

export interface BookingCancelledPayload extends BookingEventPayload {
  reason?: string;
  refundAmount?: number;
}

export interface BookingCheckedInPayload extends BookingEventPayload {
  roomId: string;
  roomNumber: string;
}

export interface BookingCheckedOutPayload extends BookingEventPayload {
  roomId?: string;
  finalAmount: number;
}

export interface PaymentEventPayload {
  paymentId: string;
  bookingId: string;
  guestId: string;
  guestEmail: string;
  amount: number;
  currency: string;
  method: string;
  confirmationNumber: string;
}

export interface PaymentFailedPayload extends PaymentEventPayload {
  failureReason?: string;
}

export interface GuestEventPayload {
  guestId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface RoomStatusChangedPayload {
  roomId: string;
  roomNumber: string;
  propertyId: string;
  previousStatus: string;
  newStatus: string;
}

export interface HousekeepingTaskPayload {
  taskId: string;
  roomId: string;
  roomNumber: string;
  propertyId: string;
  taskType: string;
  priority: string;
  assignedTo?: string;
}

type EventPayloadMap = {
  [EventType.BOOKING_CREATED]: BookingEventPayload;
  [EventType.BOOKING_CONFIRMED]: BookingEventPayload;
  [EventType.BOOKING_CANCELLED]: BookingCancelledPayload;
  [EventType.BOOKING_CHECKED_IN]: BookingCheckedInPayload;
  [EventType.BOOKING_CHECKED_OUT]: BookingCheckedOutPayload;
  [EventType.BOOKING_UPDATED]: BookingEventPayload;
  [EventType.PAYMENT_RECEIVED]: PaymentEventPayload;
  [EventType.PAYMENT_FAILED]: PaymentFailedPayload;
  [EventType.PAYMENT_REFUNDED]: PaymentEventPayload;
  [EventType.GUEST_CREATED]: GuestEventPayload;
  [EventType.GUEST_UPDATED]: GuestEventPayload;
  [EventType.ROOM_STATUS_CHANGED]: RoomStatusChangedPayload;
  [EventType.HOUSEKEEPING_TASK_CREATED]: HousekeepingTaskPayload;
  [EventType.HOUSEKEEPING_TASK_COMPLETED]: HousekeepingTaskPayload;
};

export function emit<T extends EventType>(
  event: T,
  payload: EventPayloadMap[T]
): void {
  logger.debug({ event, payload }, "Emitting event");
  eventBus.emit(event, payload);
}

export function on<T extends EventType>(
  event: T,
  listener: (payload: EventPayloadMap[T]) => void | Promise<void>
): void {
  eventBus.on(event, async (payload: EventPayloadMap[T]) => {
    try {
      await listener(payload);
    } catch (err) {
      logger.error({ err, event }, "Event listener error");
    }
  });
}

export function once<T extends EventType>(
  event: T,
  listener: (payload: EventPayloadMap[T]) => void | Promise<void>
): void {
  eventBus.once(event, async (payload: EventPayloadMap[T]) => {
    try {
      await listener(payload);
    } catch (err) {
      logger.error({ err, event }, "Event listener error");
    }
  });
}

export function off<T extends EventType>(
  event: T,
  listener: (payload: EventPayloadMap[T]) => void | Promise<void>
): void {
  eventBus.off(event, listener);
}

export function removeAllListeners(event?: EventType): void {
  if (event) {
    eventBus.removeAllListeners(event);
  } else {
    eventBus.removeAllListeners();
  }
}
