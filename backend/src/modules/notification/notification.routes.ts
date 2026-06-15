import { Router } from "express";
import { notificationController } from "./notification.controller";
import { requireAuth, requireFrontDesk, requireManager } from "../../middleware";

const router = Router();

router.post(
  "/bookings/:bookingId/resend-confirmation",
  requireAuth,
  requireFrontDesk,
  notificationController.resendConfirmation
);

router.post(
  "/notifications/test",
  requireAuth,
  requireManager,
  notificationController.sendTestEmail
);

export default router;
