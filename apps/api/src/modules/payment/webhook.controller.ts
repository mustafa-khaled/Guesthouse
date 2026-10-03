import { Request, Response } from 'express';
import Stripe from 'stripe';
import { env } from '../../config/env';
import { getStripe, isStripeConfigured } from '../../lib/stripe';
import { logger } from '../../lib/logger';
import { paymentService } from './payment.service';

class WebhookController {
  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    if (!isStripeConfigured()) {
      logger.error('Stripe not configured');
      res.status(500).json({ error: 'Stripe not configured' });
      return;
    }

    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('Stripe webhook secret not configured');
      res.status(500).json({ error: 'Webhook secret not configured' });
      return;
    }

    const signature = req.headers['stripe-signature'];
    if (!signature) {
      logger.warn('Missing Stripe signature header');
      res.status(400).json({ error: 'Missing signature' });
      return;
    }

    let event: Stripe.Event;

    try {
      event = getStripe().webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error({ err }, 'Webhook signature verification failed');
      res.status(400).json({ error: `Webhook Error: ${message}` });
      return;
    }

    logger.info({ eventType: event.type, eventId: event.id }, 'Received Stripe webhook');

    const claimed = await paymentService.claimWebhookEvent(event.id, event.type);
    if (!claimed) {
      res.json({ received: true, duplicate: true });
      return;
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await paymentService.applyPaymentIntentSucceeded(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case 'payment_intent.payment_failed':
          await paymentService.applyPaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await paymentService.applyChargeRefunded(event.data.object as Stripe.Charge);
          break;

        default:
          logger.debug({ eventType: event.type }, 'Unhandled webhook event type');
      }

      res.json({ received: true });
    } catch (err) {
      await paymentService.releaseWebhookEvent(event.id);
      logger.error({ err, eventType: event.type }, 'Error processing webhook event');
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
}

export const webhookController = new WebhookController();
