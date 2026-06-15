import { Router } from "express";
import { guestController } from "./guest.controller";
import { requireAuth, requireFrontDesk } from "../../middleware";

const router = Router();

router.get("/guests", requireAuth, requireFrontDesk, guestController.list);

router.get("/guests/:id", requireAuth, requireFrontDesk, guestController.getById);

router.post("/guests", requireAuth, requireFrontDesk, guestController.create);

router.put("/guests/:id", requireAuth, requireFrontDesk, guestController.update);

router.delete("/guests/:id", requireAuth, requireFrontDesk, guestController.delete);

router.get(
  "/guests/:id/bookings",
  requireAuth,
  requireFrontDesk,
  guestController.getBookings
);

router.post(
  "/guests/:id/link-user",
  requireAuth,
  requireFrontDesk,
  guestController.linkUser
);

router.get("/user/me/guest-profile", requireAuth, guestController.getMyProfile);

router.put("/user/me/guest-profile", requireAuth, guestController.updateMyProfile);

export default router;
