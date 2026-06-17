import { Router } from "express";
import { webhookController } from "./webhook.controller";

const router = Router();

router.post(
  "/stripe",
  webhookController.handleStripeWebhook.bind(webhookController)
);

export default router;
