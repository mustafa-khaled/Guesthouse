import { Request, Response } from "express";
import Stripe from "stripe";
import { Payment, PaymentStatusEnum } from "../../models/payment.model";
import { Booking } from "../../models/booking.model";
import { RatePlan } from "../../models/ratePlan.model";
import { BookingStatus, PaymentStatus } from "../../common/enums/bookingStatus.enum";
import { env } from "../../config/env";
import { logger } from "../../lib/logger";

function getStripe(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(env.STRIPE_SECRET_KEY);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const { bookingId } = paymentIntent.metadata;

  if (!bookingId) {
    logger.warn({ paymentIntentId: paymentIntent.id }, "Payment intent missing bookingId metadata");
    return;
  }

  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (!payment) {
    logger.warn({ paymentIntentId: paymentIntent.id }, "Payment record not found for payment intent");
    return;
  }

  if (payment.status === PaymentStatusEnum.COMPLETED) {
    logger.info({ paymentIntentId: paymentIntent.id }, "Payment already processed, skipping");
    return;
  }

  payment.status = PaymentStatusEnum.COMPLETED;
  payment.processedAt = new Date();

  const charge = paymentIntent.latest_charge as Stripe.Charge | null;
  if (charge?.payment_method_details?.card) {
    payment.metadata = {
      cardLast4: charge.payment_method_details.card.last4,
      cardBrand: charge.payment_method_details.card.brand,
    };
  }

  await payment.save();

  const booking = await Booking.findById(bookingId);
  if (booking) {
    booking.payment.amountPaid += payment.amount;
    booking.payment.amountDue = booking.pricing.grandTotal - booking.payment.amountPaid;

    if (booking.payment.amountPaid >= booking.pricing.grandTotal) {
      booking.payment.status = PaymentStatus.PAID;
    } else if (booking.payment.amountPaid > 0) {
      booking.payment.status = PaymentStatus.PARTIAL;
    }

    if (booking.status === BookingStatus.PENDING && booking.payment.amountPaid > 0) {
      const ratePlan = await RatePlan.findById(booking.ratePlanId);
      const requiredDeposit = ratePlan?.depositPercentage
        ? (booking.pricing.grandTotal * ratePlan.depositPercentage) / 100
        : 0;

      if (booking.payment.amountPaid >= requiredDeposit || ratePlan?.paymentPolicy === "pay-at-hotel") {
        booking.status = BookingStatus.CONFIRMED;
      }
    }

    await booking.save();
  }

  logger.info({ paymentIntentId: paymentIntent.id, bookingId }, "Payment succeeded via webhook");
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  });

  if (!payment) {
    logger.warn({ paymentIntentId: paymentIntent.id }, "Payment record not found for failed payment");
    return;
  }

  if (payment.status === PaymentStatusEnum.FAILED) {
    logger.info({ paymentIntentId: paymentIntent.id }, "Payment already marked as failed, skipping");
    return;
  }

  payment.status = PaymentStatusEnum.FAILED;
  payment.metadata = {
    ...payment.metadata,
    failureMessage: paymentIntent.last_payment_error?.message,
    failureCode: paymentIntent.last_payment_error?.code,
  };

  await payment.save();

  logger.info({ paymentIntentId: paymentIntent.id }, "Payment failed via webhook");
}

async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const paymentIntentId = typeof charge.payment_intent === "string" 
    ? charge.payment_intent 
    : charge.payment_intent?.id;

  if (!paymentIntentId) {
    return;
  }

  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntentId,
  });

  if (payment) {
    payment.metadata = {
      ...payment.metadata,
      refunded: true,
      refundedAt: new Date().toISOString(),
    };
    await payment.save();
  }

  logger.info({ chargeId: charge.id, paymentIntentId }, "Charge refunded via webhook");
}

class WebhookController {
  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const stripe = getStripe();
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

    if (!stripe) {
      logger.error("Stripe not configured");
      res.status(500).json({ error: "Stripe not configured" });
      return;
    }

    if (!webhookSecret) {
      logger.error("Stripe webhook secret not configured");
      res.status(500).json({ error: "Webhook secret not configured" });
      return;
    }

    const signature = req.headers["stripe-signature"];

    if (!signature) {
      logger.warn("Missing Stripe signature header");
      res.status(400).json({ error: "Missing signature" });
      return;
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      logger.error({ err }, "Webhook signature verification failed");
      res.status(400).json({ error: `Webhook Error: ${message}` });
      return;
    }

    logger.info({ eventType: event.type, eventId: event.id }, "Received Stripe webhook");

    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case "payment_intent.payment_failed":
          await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case "charge.refunded":
          await handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        default:
          logger.debug({ eventType: event.type }, "Unhandled webhook event type");
      }

      res.json({ received: true });
    } catch (err) {
      logger.error({ err, eventType: event.type }, "Error processing webhook event");
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
}

export const webhookController = new WebhookController();
