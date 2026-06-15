import { Router } from "express";
import { frontDeskController } from "./frontDesk.controller";
import { requireAuth, requireFrontDesk } from "../../middleware";

const router = Router();

router.get(
  "/front-desk/arrivals",
  requireAuth,
  requireFrontDesk,
  frontDeskController.getArrivals
);

router.get(
  "/front-desk/departures",
  requireAuth,
  requireFrontDesk,
  frontDeskController.getDepartures
);

router.get(
  "/front-desk/in-house",
  requireAuth,
  requireFrontDesk,
  frontDeskController.getInHouse
);

router.get(
  "/front-desk/room-rack",
  requireAuth,
  requireFrontDesk,
  frontDeskController.getRoomRack
);

router.post(
  "/front-desk/walk-in",
  requireAuth,
  requireFrontDesk,
  frontDeskController.walkIn
);

router.post(
  "/front-desk/room-move",
  requireAuth,
  requireFrontDesk,
  frontDeskController.roomMove
);

router.post(
  "/front-desk/extend-stay",
  requireAuth,
  requireFrontDesk,
  frontDeskController.extendStay
);

router.post(
  "/front-desk/early-checkout",
  requireAuth,
  requireFrontDesk,
  frontDeskController.earlyCheckout
);

export default router;
