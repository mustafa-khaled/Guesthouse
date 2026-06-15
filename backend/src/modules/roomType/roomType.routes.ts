import { Router } from "express";
import { roomTypeController } from "./roomType.controller";
import { requireAuth, requireManager } from "../../middleware";

const router = Router();

router.get(
  "/properties/:propertyId/room-types",
  roomTypeController.listByProperty
);

router.get("/room-types/:id", roomTypeController.getById);

router.post(
  "/properties/:propertyId/room-types",
  requireAuth,
  requireManager,
  roomTypeController.create
);

router.put(
  "/room-types/:id",
  requireAuth,
  requireManager,
  roomTypeController.update
);

router.delete(
  "/room-types/:id",
  requireAuth,
  requireManager,
  roomTypeController.delete
);

export default router;
