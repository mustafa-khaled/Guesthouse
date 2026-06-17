import { logger } from "../lib/logger";
import { registerBookingListeners } from "./booking.listener";
import { registerPaymentListeners } from "./payment.listener";
import { registerAuditListeners } from "./audit.listener";
import { registerSocketListeners } from "./socket.listener";

export function registerAllListeners(): void {
  logger.info("Registering all event listeners...");

  registerBookingListeners();
  registerPaymentListeners();
  registerAuditListeners();
  registerSocketListeners();

  logger.info("All event listeners registered");
}

export { registerBookingListeners } from "./booking.listener";
export { registerPaymentListeners } from "./payment.listener";
export { registerAuditListeners } from "./audit.listener";
export { registerSocketListeners, emitHousekeepingTaskUpdate, emitRoomStatusChange } from "./socket.listener";
