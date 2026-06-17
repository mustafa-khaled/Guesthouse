import { Router } from "express";
import { exportController } from "./export.controller";
import { requireAuth, requireManager } from "../../middleware";

const router = Router();

router.get(
  "/bookings",
  requireAuth,
  requireManager,
  exportController.exportBookings.bind(exportController)
);

router.get(
  "/guests",
  requireAuth,
  requireManager,
  exportController.exportGuests.bind(exportController)
);

router.get(
  "/payments",
  requireAuth,
  requireManager,
  exportController.exportPayments.bind(exportController)
);

export default router;
