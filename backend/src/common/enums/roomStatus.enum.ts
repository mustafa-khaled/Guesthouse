export enum RoomStatus {
  CLEAN = "clean",
  DIRTY = "dirty",
  INSPECTED = "inspected",
  MAINTENANCE = "maintenance",
  OUT_OF_ORDER = "out-of-order",
}

export const RoomStatusTransitions: Record<RoomStatus, RoomStatus[]> = {
  [RoomStatus.DIRTY]: [RoomStatus.CLEAN, RoomStatus.MAINTENANCE, RoomStatus.OUT_OF_ORDER],
  [RoomStatus.CLEAN]: [RoomStatus.INSPECTED, RoomStatus.DIRTY, RoomStatus.MAINTENANCE],
  [RoomStatus.INSPECTED]: [RoomStatus.DIRTY, RoomStatus.MAINTENANCE, RoomStatus.OUT_OF_ORDER],
  [RoomStatus.MAINTENANCE]: [RoomStatus.DIRTY, RoomStatus.OUT_OF_ORDER],
  [RoomStatus.OUT_OF_ORDER]: [RoomStatus.MAINTENANCE, RoomStatus.DIRTY],
};

export function canTransitionRoomTo(
  currentStatus: RoomStatus,
  newStatus: RoomStatus
): boolean {
  return RoomStatusTransitions[currentStatus].includes(newStatus);
}

export function isRoomAvailable(status: RoomStatus): boolean {
  return status === RoomStatus.CLEAN || status === RoomStatus.INSPECTED;
}

export enum HousekeepingTaskType {
  CHECKOUT_CLEAN = "checkout-clean",
  STAY_OVER = "stay-over",
  DEEP_CLEAN = "deep-clean",
  INSPECTION = "inspection",
  TURNDOWN = "turndown",
}

export enum HousekeepingTaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  VERIFIED = "verified",
  SKIPPED = "skipped",
}

export enum HousekeepingPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}
