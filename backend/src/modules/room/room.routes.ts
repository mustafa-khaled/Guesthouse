import { Router } from "express";
import { roomController } from "./room.controller";
import {
  requireAuth,
  requireManager,
  requireFrontDesk,
  requireHousekeeping,
} from "../../middleware";

const router = Router();

router.get(
  "/properties/:propertyId/rooms",
  requireAuth,
  requireFrontDesk,
  roomController.listByProperty
);

router.get(
  "/properties/:propertyId/rooms/status-summary",
  requireAuth,
  requireFrontDesk,
  roomController.getStatusSummary
);

router.get("/rooms/:id", requireAuth, requireFrontDesk, roomController.getById);

router.post(
  "/properties/:propertyId/rooms",
  requireAuth,
  requireManager,
  roomController.create
);

router.post(
  "/properties/:propertyId/rooms/bulk",
  requireAuth,
  requireManager,
  roomController.bulkCreate
);

router.put("/rooms/:id", requireAuth, requireManager, roomController.update);

router.patch(
  "/rooms/:id/status",
  requireAuth,
  requireHousekeeping,
  roomController.updateStatus
);

router.delete(
  "/rooms/:id",
  requireAuth,
  requireManager,
  roomController.delete
);

export default router;
