import { Schema, model, Types, Document } from "mongoose";
import { toJSONPlugin } from "../common/plugins";

export enum PaymentType {
  DEPOSIT = "deposit",
  PAYMENT = "payment",
  REFUND = "refund",
  CHARGE = "charge",
}

export enum PaymentMethod {
  CARD = "card",
  CASH = "cash",
  BANK_TRANSFER = "bank_transfer",
}

export enum PaymentStatusEnum {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export interface IPaymentMetadata {
  cardLast4?: string;
  cardBrand?: string;
}

export interface IPayment extends Document {
  bookingId: Types.ObjectId;
  guestId: Types.ObjectId;
  type: PaymentType;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatusEnum;
  stripePaymentIntentId?: string;
  stripeRefundId?: string;
  metadata?: IPaymentMetadata;
  processedAt?: Date;
  processedBy?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const metadataSchema = new Schema(
  {
    cardLast4: String,
    cardBrand: String,
  },
  { _id: false }
);

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(PaymentType),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatusEnum),
      default: PaymentStatusEnum.PENDING,
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
    },
    stripeRefundId: String,
    metadata: metadataSchema,
    processedAt: Date,
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notes: String,
  },
  { timestamps: true }
);

paymentSchema.index({ bookingId: 1, createdAt: -1 });
paymentSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });

paymentSchema.plugin(toJSONPlugin);

export const Payment = model<IPayment>("Payment", paymentSchema);
