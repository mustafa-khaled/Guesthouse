import { Schema, model, Document } from 'mongoose';

export interface IStripeWebhookEvent extends Document {
  eventId: string;
  eventType: string;
  processedAt: Date;
}

const stripeWebhookEventSchema = new Schema<IStripeWebhookEvent>({
  eventId: {
    type: String,
    required: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  processedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

stripeWebhookEventSchema.index({ eventId: 1 }, { unique: true });

export const StripeWebhookEvent = model<IStripeWebhookEvent>(
  'StripeWebhookEvent',
  stripeWebhookEventSchema,
);
