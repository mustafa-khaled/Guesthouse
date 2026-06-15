import { Router } from "express";
import { housekeepingController } from "./housekeeping.controller";
import { requireAuth, requireFrontDesk, requireHousekeeping } from "../../middleware";

const router = Router();

router.get(
  "/housekeeping/tasks",
  requireAuth,
  requireHousekeeping,
  housekeepingController.list
);

router.get(
  "/housekeeping/dashboard",
  requireAuth,
  requireHousekeeping,
  housekeepingController.getDashboard
);

router.get(
  "/housekeeping/tasks/:id",
  requireAuth,
  requireHousekeeping,
  housekeepingController.getById
);

router.post(
  "/housekeeping/tasks",
  requireAuth,
  requireFrontDesk,
  housekeepingController.create
);

router.patch(
  "/housekeeping/tasks/:id/status",
  requireAuth,
  requireHousekeeping,
  housekeepingController.updateStatus
);

router.post(
  "/housekeeping/tasks/:id/complete",
  requireAuth,
  requireHousekeeping,
  housekeepingController.complete
);

router.post(
  "/housekeeping/tasks/:id/verify",
  requireAuth,
  requireFrontDesk,
  housekeepingController.verify
);

router.post(
  "/housekeeping/tasks/:id/assign",
  requireAuth,
  requireFrontDesk,
  housekeepingController.assign
);

router.post(
  "/housekeeping/tasks/:id/issue",
  requireAuth,
  requireHousekeeping,
  housekeepingController.reportIssue
);

export default router;
