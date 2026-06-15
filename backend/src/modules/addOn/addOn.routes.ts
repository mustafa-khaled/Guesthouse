import { Router } from "express";
import { addOnController } from "./addOn.controller";
import { requireAuth, requireManager, requireFrontDesk } from "../../middleware";

const router = Router();

router.get("/properties/:propertyId/add-ons", addOnController.listByProperty);

router.get("/add-ons/:id", addOnController.getById);

router.post(
  "/properties/:propertyId/add-ons",
  requireAuth,
  requireManager,
  addOnController.create
);

router.put("/add-ons/:id", requireAuth, requireManager, addOnController.update);

router.delete("/add-ons/:id", requireAuth, requireManager, addOnController.delete);

router.post(
  "/bookings/:bookingId/add-ons",
  requireAuth,
  requireFrontDesk,
  addOnController.addToBooking
);

router.delete(
  "/bookings/:bookingId/add-ons/:addOnId",
  requireAuth,
  requireFrontDesk,
  addOnController.removeFromBooking
);

export default router;
