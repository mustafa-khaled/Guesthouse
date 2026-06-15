import { Router } from "express";
import { reviewController } from "./review.controller";
import { requireAuth, requireManager } from "../../middleware";

const router = Router();

router.get("/reviews", requireAuth, requireManager, reviewController.list);

router.get("/reviews/:id", reviewController.getById);

router.post("/reviews", requireAuth, reviewController.create);

router.put("/reviews/:id", requireAuth, reviewController.update);

router.delete("/reviews/:id", requireAuth, reviewController.delete);

router.post(
  "/reviews/:id/moderate",
  requireAuth,
  requireManager,
  reviewController.moderate
);

router.post(
  "/reviews/:id/respond",
  requireAuth,
  requireManager,
  reviewController.respond
);

router.post("/reviews/:id/helpful", reviewController.markHelpful);

router.get("/properties/:propertyId/reviews", reviewController.getPropertyReviews);

router.get(
  "/properties/:propertyId/reviews/summary",
  reviewController.getPropertyRatingSummary
);

router.get("/user/me/reviews", requireAuth, reviewController.getMyReviews);

export default router;
