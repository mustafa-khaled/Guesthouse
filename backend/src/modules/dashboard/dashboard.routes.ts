import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { requireAuth, requireFrontDesk, requireManager } from "../../middleware";

const router = Router();

router.get(
  "/dashboard/property",
  requireAuth,
  requireFrontDesk,
  dashboardController.getPropertyDashboard
);

router.get(
  "/dashboard/manager",
  requireAuth,
  requireManager,
  dashboardController.getManagerDashboard
);

export default router;
