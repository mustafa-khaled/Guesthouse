import { Router } from "express";
import { bookingController } from "./booking.controller";
import { requireAuth, requireFrontDesk } from "../../middleware";

const router = Router();

router.post("/bookings", requireAuth, bookingController.create);

router.get("/bookings", requireAuth, requireFrontDesk, bookingController.list);

router.get("/bookings/:id", requireAuth, bookingController.getById);

router.get(
  "/bookings/confirmation/:confirmationNumber",
  requireAuth,
  bookingController.getByConfirmationNumber
);

router.put("/bookings/:id", requireAuth, requireFrontDesk, bookingController.update);

router.post(
  "/bookings/:id/cancel",
  requireAuth,
  bookingController.cancel
);

router.post(
  "/bookings/:id/confirm",
  requireAuth,
  requireFrontDesk,
  bookingController.confirm
);

router.post(
  "/bookings/:id/check-in",
  requireAuth,
  requireFrontDesk,
  bookingController.checkIn
);

router.post(
  "/bookings/:id/check-out",
  requireAuth,
  requireFrontDesk,
  bookingController.checkOut
);

router.post(
  "/bookings/:id/assign-room",
  requireAuth,
  requireFrontDesk,
  bookingController.assignRoom
);

router.get("/bookings/:id/add-ons", requireAuth, bookingController.getAddOns);

router.get("/user/me/bookings", requireAuth, bookingController.getMyBookings);

export default router;
