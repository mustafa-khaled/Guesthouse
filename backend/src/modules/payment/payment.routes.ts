import { Router } from "express";
import { paymentController } from "./payment.controller";
import { requireAuth, requireFrontDesk, requireManager } from "../../middleware";

const router = Router();

router.post(
  "/bookings/:bookingId/payments/intent",
  requireAuth,
  paymentController.createPaymentIntent
);

router.post(
  "/bookings/:bookingId/payments/confirm",
  requireAuth,
  paymentController.confirmPayment
);

router.post(
  "/bookings/:bookingId/payments/cash",
  requireAuth,
  requireFrontDesk,
  paymentController.recordCashPayment
);

router.post(
  "/bookings/:bookingId/refund",
  requireAuth,
  requireManager,
  paymentController.processRefund
);

router.get(
  "/bookings/:bookingId/folio",
  requireAuth,
  paymentController.getFolio
);

router.post(
  "/bookings/:bookingId/folio/charge",
  requireAuth,
  requireFrontDesk,
  paymentController.addCharge
);

router.get(
  "/bookings/:bookingId/payments",
  requireAuth,
  requireFrontDesk,
  paymentController.getPaymentHistory
);

export default router;
