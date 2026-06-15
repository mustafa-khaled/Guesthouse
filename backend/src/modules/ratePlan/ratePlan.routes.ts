import { Router } from "express";
import { ratePlanController } from "./ratePlan.controller";
import { requireAuth, requireManager } from "../../middleware";

const router = Router();

router.get(
  "/room-types/:roomTypeId/rate-plans",
  ratePlanController.listByRoomType
);

router.get("/rate-plans/:id", ratePlanController.getById);

router.post(
  "/room-types/:roomTypeId/rate-plans",
  requireAuth,
  requireManager,
  ratePlanController.create
);

router.put(
  "/rate-plans/:id",
  requireAuth,
  requireManager,
  ratePlanController.update
);

router.delete(
  "/rate-plans/:id",
  requireAuth,
  requireManager,
  ratePlanController.delete
);

router.get(
  "/rate-plans/:ratePlanId/price-rules",
  requireAuth,
  requireManager,
  ratePlanController.listPriceRules
);

router.post(
  "/rate-plans/:ratePlanId/price-rules",
  requireAuth,
  requireManager,
  ratePlanController.createPriceRule
);

router.put(
  "/price-rules/:id",
  requireAuth,
  requireManager,
  ratePlanController.updatePriceRule
);

router.delete(
  "/price-rules/:id",
  requireAuth,
  requireManager,
  ratePlanController.deletePriceRule
);

export default router;
