import { Schema, model, Types, Document } from 'mongoose';
import { toJSONPlugin } from '../common/plugins';

export interface ISavedPaymentMethod extends Document {
  userId: Types.ObjectId;
  guestId?: Types.ObjectId;
  stripeCustomerId: string;
  stripePaymentMethodId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const savedPaymentMethodSchema = new Schema<ISavedPaymentMethod>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: 'Guest',
      index: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    stripePaymentMethodId: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    last4: {
      type: String,
      required: true,
    },
    expMonth: {
      type: Number,
      required: true,
    },
    expYear: {
      type: Number,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

savedPaymentMethodSchema.index({ userId: 1, isDefault: 1 });
savedPaymentMethodSchema.index({ stripePaymentMethodId: 1 }, { unique: true });

savedPaymentMethodSchema.plugin(toJSONPlugin);

export const SavedPaymentMethod = model<ISavedPaymentMethod>(
  'SavedPaymentMethod',
  savedPaymentMethodSchema,
);
