import { Router } from "express";
import { promotionController } from "./promotion.controller";
import { requireAuth, requireManager } from "../../middleware";

const router = Router();

router.get("/promotions", requireAuth, requireManager, promotionController.list);

router.get("/promotions/:id", requireAuth, requireManager, promotionController.getById);

router.post("/promotions", requireAuth, requireManager, promotionController.create);

router.put("/promotions/:id", requireAuth, requireManager, promotionController.update);

router.delete("/promotions/:id", requireAuth, requireManager, promotionController.delete);

router.post("/promotions/validate", requireAuth, promotionController.validate);

export default router;
