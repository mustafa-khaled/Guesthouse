import { Router } from "express";
import { reportsController } from "./reports.controller";
import { requireAuth, requireManager, requireFrontDesk } from "../../middleware";

const router = Router();

router.get(
  "/reports/occupancy",
  requireAuth,
  requireManager,
  reportsController.getOccupancy
);

router.get(
  "/reports/revenue",
  requireAuth,
  requireManager,
  reportsController.getRevenue
);

router.get(
  "/reports/room-type-performance",
  requireAuth,
  requireManager,
  reportsController.getRoomTypePerformance
);

router.get(
  "/reports/source-analysis",
  requireAuth,
  requireManager,
  reportsController.getSourceAnalysis
);

router.get(
  "/reports/cancellation-analysis",
  requireAuth,
  requireManager,
  reportsController.getCancellationAnalysis
);

router.get(
  "/reports/daily-summary",
  requireAuth,
  requireFrontDesk,
  reportsController.getDailySummary
);

export default router;
