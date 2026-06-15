import { Schema, model, Types, Document } from "mongoose";
import { softDeletePlugin, toJSONPlugin } from "../common/plugins";

export enum CancellationPolicyType {
  FLEXIBLE = "flexible",
  MODERATE = "moderate",
  STRICT = "strict",
  NON_REFUNDABLE = "non-refundable",
}

export enum PaymentPolicyType {
  PAY_AT_HOTEL = "pay-at-hotel",
  PREPAID = "prepaid",
  DEPOSIT = "deposit",
}

export interface ICancellationPolicy {
  type: CancellationPolicyType;
  deadlineHours: number;
  penaltyPercentage: number;
}

export interface IAdvanceBookingDays {
  min?: number;
  max?: number;
}

export interface IRatePlan extends Document {
  roomTypeId: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  basePrice: number;
  inclusions: string[];
  cancellationPolicy: ICancellationPolicy;
  paymentPolicy: PaymentPolicyType;
  depositPercentage?: number;
  minNights?: number;
  maxNights?: number;
  advanceBookingDays?: IAdvanceBookingDays;
  isActive: boolean;
  validFrom?: Date;
  validTo?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cancellationPolicySchema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(CancellationPolicyType),
      default: CancellationPolicyType.FLEXIBLE,
    },
    deadlineHours: { type: Number, default: 24 },
    penaltyPercentage: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const advanceBookingSchema = new Schema(
  {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
  },
  { _id: false }
);

const ratePlanSchema = new Schema<IRatePlan>(
  {
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    description: String,
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    inclusions: [String],
    cancellationPolicy: {
      type: cancellationPolicySchema,
      default: () => ({}),
    },
    paymentPolicy: {
      type: String,
      enum: Object.values(PaymentPolicyType),
      default: PaymentPolicyType.PAY_AT_HOTEL,
    },
    depositPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    minNights: { type: Number, min: 1 },
    maxNights: { type: Number, min: 1 },
    advanceBookingDays: advanceBookingSchema,
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: Date,
    validTo: Date,
  },
  { timestamps: true }
);

ratePlanSchema.index({ roomTypeId: 1, code: 1 }, { unique: true });
ratePlanSchema.index({ roomTypeId: 1, isActive: 1, isDeleted: 1 });

ratePlanSchema.plugin(softDeletePlugin);
ratePlanSchema.plugin(toJSONPlugin);

export const RatePlan = model<IRatePlan>("RatePlan", ratePlanSchema);
