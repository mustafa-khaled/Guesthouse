import { Router } from "express";
import { inventoryController } from "./inventory.controller";
import { requireAuth, requireManager, requireFrontDesk } from "../../middleware";

const router = Router();

router.get("/availability/search", inventoryController.searchAvailability);

router.get(
  "/properties/:propertyId/inventory",
  requireAuth,
  requireFrontDesk,
  inventoryController.getInventory
);

router.put(
  "/inventory/bulk-update",
  requireAuth,
  requireManager,
  inventoryController.bulkUpdate
);

router.post(
  "/inventory/initialize",
  requireAuth,
  requireManager,
  inventoryController.initialize
);

router.post("/inventory/hold", requireAuth, inventoryController.createHold);

router.delete(
  "/inventory/hold/:holdId",
  requireAuth,
  inventoryController.releaseHold
);

export default router;
