import { Router } from "express";
import { propertyController } from "./property.controller";
import { requireAuth, requireManager } from "../../middleware";

const router = Router();

router.get("/", propertyController.list);

router.get("/slug/:slug", propertyController.getBySlug);

router.get("/:id", propertyController.getById);

router.post("/", requireAuth, requireManager, propertyController.create);

router.put("/:id", requireAuth, requireManager, propertyController.update);

router.delete("/:id", requireAuth, requireManager, propertyController.delete);

router.get("/:id/stats", requireAuth, requireManager, propertyController.getStats);

export default router;
