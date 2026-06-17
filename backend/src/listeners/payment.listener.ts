import {
  on,
  EventType,
  PaymentEventPayload,
  PaymentFailedPayload,
} from "../lib/events";
import { sendEmail } from "../lib/email";
import { logger } from "../lib/logger";

export function registerPaymentListeners(): void {
  logger.info("Registering payment event listeners");

  on(EventType.PAYMENT_RECEIVED, async (payload: PaymentEventPayload) => {
    logger.info(
      { paymentId: payload.paymentId, bookingId: payload.bookingId },
      "Payment received event"
    );

    await sendEmail(
      payload.guestEmail,
      `Payment Received - ${payload.confirmationNumber}`,
      `
        <h1>Payment Confirmation</h1>
        <p>Thank you! We have received your payment.</p>
        <p><strong>Amount:</strong> ${payload.currency} ${payload.amount.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> ${payload.method}</p>
        <p><strong>Booking Reference:</strong> ${payload.confirmationNumber}</p>
        <p>This email serves as your payment receipt.</p>
      `
    );
  });

  on(EventType.PAYMENT_FAILED, async (payload: PaymentFailedPayload) => {
    logger.warn(
      { paymentId: payload.paymentId, bookingId: payload.bookingId, reason: payload.failureReason },
      "Payment failed event"
    );

    await sendEmail(
      payload.guestEmail,
      `Payment Issue - ${payload.confirmationNumber}`,
      `
        <h1>Payment Issue</h1>
        <p>We were unable to process your payment.</p>
        <p><strong>Amount:</strong> ${payload.currency} ${payload.amount.toFixed(2)}</p>
        <p><strong>Booking Reference:</strong> ${payload.confirmationNumber}</p>
        ${payload.failureReason ? `<p><strong>Reason:</strong> ${payload.failureReason}</p>` : ""}
        <p>Please try again or contact us for assistance.</p>
      `
    );
  });

  on(EventType.PAYMENT_REFUNDED, async (payload: PaymentEventPayload) => {
    logger.info(
      { paymentId: payload.paymentId, bookingId: payload.bookingId },
      "Payment refunded event"
    );

    await sendEmail(
      payload.guestEmail,
      `Refund Processed - ${payload.confirmationNumber}`,
      `
        <h1>Refund Confirmation</h1>
        <p>Your refund has been processed.</p>
        <p><strong>Amount:</strong> ${payload.currency} ${Math.abs(payload.amount).toFixed(2)}</p>
        <p><strong>Booking Reference:</strong> ${payload.confirmationNumber}</p>
        <p>Please allow 5-10 business days for the refund to appear in your account.</p>
      `
    );
  });

  logger.info("Payment event listeners registered");
}
