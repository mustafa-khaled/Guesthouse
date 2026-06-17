import { describe, it, expect } from "vitest";
import {
  BookingStatus,
  BookingStatusTransitions,
  canTransitionTo,
  isTerminalStatus,
  isActiveBooking,
  PaymentStatus,
  BookingSource,
} from "../bookingStatus.enum";

describe("BookingStatus enum", () => {
  it("should have all expected status values", () => {
    expect(BookingStatus.PENDING).toBe("pending");
    expect(BookingStatus.CONFIRMED).toBe("confirmed");
    expect(BookingStatus.CHECKED_IN).toBe("checked-in");
    expect(BookingStatus.CHECKED_OUT).toBe("checked-out");
    expect(BookingStatus.CANCELLED).toBe("cancelled");
    expect(BookingStatus.NO_SHOW).toBe("no-show");
  });
});

describe("BookingStatusTransitions", () => {
  it("should allow PENDING to transition to CONFIRMED or CANCELLED", () => {
    expect(BookingStatusTransitions[BookingStatus.PENDING]).toContain(BookingStatus.CONFIRMED);
    expect(BookingStatusTransitions[BookingStatus.PENDING]).toContain(BookingStatus.CANCELLED);
    expect(BookingStatusTransitions[BookingStatus.PENDING]).toHaveLength(2);
  });

  it("should allow CONFIRMED to transition to CHECKED_IN, CANCELLED, or NO_SHOW", () => {
    expect(BookingStatusTransitions[BookingStatus.CONFIRMED]).toContain(BookingStatus.CHECKED_IN);
    expect(BookingStatusTransitions[BookingStatus.CONFIRMED]).toContain(BookingStatus.CANCELLED);
    expect(BookingStatusTransitions[BookingStatus.CONFIRMED]).toContain(BookingStatus.NO_SHOW);
    expect(BookingStatusTransitions[BookingStatus.CONFIRMED]).toHaveLength(3);
  });

  it("should allow CHECKED_IN to transition only to CHECKED_OUT", () => {
    expect(BookingStatusTransitions[BookingStatus.CHECKED_IN]).toContain(BookingStatus.CHECKED_OUT);
    expect(BookingStatusTransitions[BookingStatus.CHECKED_IN]).toHaveLength(1);
  });

  it("should have empty transitions for terminal statuses", () => {
    expect(BookingStatusTransitions[BookingStatus.CHECKED_OUT]).toHaveLength(0);
    expect(BookingStatusTransitions[BookingStatus.CANCELLED]).toHaveLength(0);
    expect(BookingStatusTransitions[BookingStatus.NO_SHOW]).toHaveLength(0);
  });
});

describe("canTransitionTo", () => {
  it("should return true for valid transitions", () => {
    expect(canTransitionTo(BookingStatus.PENDING, BookingStatus.CONFIRMED)).toBe(true);
    expect(canTransitionTo(BookingStatus.PENDING, BookingStatus.CANCELLED)).toBe(true);
    expect(canTransitionTo(BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN)).toBe(true);
    expect(canTransitionTo(BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT)).toBe(true);
  });

  it("should return false for invalid transitions", () => {
    expect(canTransitionTo(BookingStatus.PENDING, BookingStatus.CHECKED_IN)).toBe(false);
    expect(canTransitionTo(BookingStatus.PENDING, BookingStatus.CHECKED_OUT)).toBe(false);
    expect(canTransitionTo(BookingStatus.CHECKED_OUT, BookingStatus.CANCELLED)).toBe(false);
    expect(canTransitionTo(BookingStatus.CANCELLED, BookingStatus.CONFIRMED)).toBe(false);
  });

  it("should not allow self-transitions", () => {
    expect(canTransitionTo(BookingStatus.PENDING, BookingStatus.PENDING)).toBe(false);
    expect(canTransitionTo(BookingStatus.CONFIRMED, BookingStatus.CONFIRMED)).toBe(false);
  });
});

describe("isTerminalStatus", () => {
  it("should return true for terminal statuses", () => {
    expect(isTerminalStatus(BookingStatus.CHECKED_OUT)).toBe(true);
    expect(isTerminalStatus(BookingStatus.CANCELLED)).toBe(true);
    expect(isTerminalStatus(BookingStatus.NO_SHOW)).toBe(true);
  });

  it("should return false for non-terminal statuses", () => {
    expect(isTerminalStatus(BookingStatus.PENDING)).toBe(false);
    expect(isTerminalStatus(BookingStatus.CONFIRMED)).toBe(false);
    expect(isTerminalStatus(BookingStatus.CHECKED_IN)).toBe(false);
  });
});

describe("isActiveBooking", () => {
  it("should return true for active booking statuses", () => {
    expect(isActiveBooking(BookingStatus.PENDING)).toBe(true);
    expect(isActiveBooking(BookingStatus.CONFIRMED)).toBe(true);
    expect(isActiveBooking(BookingStatus.CHECKED_IN)).toBe(true);
  });

  it("should return false for inactive booking statuses", () => {
    expect(isActiveBooking(BookingStatus.CHECKED_OUT)).toBe(false);
    expect(isActiveBooking(BookingStatus.CANCELLED)).toBe(false);
    expect(isActiveBooking(BookingStatus.NO_SHOW)).toBe(false);
  });
});

describe("PaymentStatus enum", () => {
  it("should have all expected payment status values", () => {
    expect(PaymentStatus.PENDING).toBe("pending");
    expect(PaymentStatus.PARTIAL).toBe("partial");
    expect(PaymentStatus.PAID).toBe("paid");
    expect(PaymentStatus.REFUNDED).toBe("refunded");
    expect(PaymentStatus.FAILED).toBe("failed");
  });
});

describe("BookingSource enum", () => {
  it("should have all expected booking source values", () => {
    expect(BookingSource.DIRECT).toBe("direct");
    expect(BookingSource.WEBSITE).toBe("website");
    expect(BookingSource.PHONE).toBe("phone");
    expect(BookingSource.WALK_IN).toBe("walk-in");
    expect(BookingSource.BOOKING_COM).toBe("booking.com");
    expect(BookingSource.EXPEDIA).toBe("expedia");
    expect(BookingSource.AIRBNB).toBe("airbnb");
    expect(BookingSource.OTHER).toBe("other");
  });
});
