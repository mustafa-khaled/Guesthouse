import { Schema, model, Types, Document } from "mongoose";
import { softDeletePlugin, toJSONPlugin } from "../common/plugins";

export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
  FREE_NIGHT = "free-night",
}

export interface IPromotionConditions {
  validFrom: Date;
  validTo: Date;
  minNights?: number;
  minSpend?: number;
  applicableRoomTypes?: Types.ObjectId[];
  applicableRatePlans?: Types.ObjectId[];
  daysOfWeek?: number[];
  blackoutDates?: Date[];
}

export interface IPromotionLimits {
  maxUses?: number;
  maxUsesPerGuest?: number;
  currentUses: number;
}

export interface IPromotion extends Document {
  propertyId?: Types.ObjectId;
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  conditions: IPromotionConditions;
  limits: IPromotionLimits;
  stackable: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conditionsSchema = new Schema(
  {
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    minNights: { type: Number, min: 1 },
    minSpend: { type: Number, min: 0 },
    applicableRoomTypes: [{ type: Schema.Types.ObjectId, ref: "RoomType" }],
    applicableRatePlans: [{ type: Schema.Types.ObjectId, ref: "RatePlan" }],
    daysOfWeek: {
      type: [Number],
      validate: {
        validator: (arr: number[]) => arr.every((d) => d >= 0 && d <= 6),
        message: "Days of week must be between 0 and 6",
      },
    },
    blackoutDates: [Date],
  },
  { _id: false }
);

const limitsSchema = new Schema(
  {
    maxUses: { type: Number, min: 1 },
    maxUsesPerGuest: { type: Number, min: 1 },
    currentUses: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const promotionSchema = new Schema<IPromotion>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    conditions: {
      type: conditionsSchema,
      required: true,
    },
    limits: {
      type: limitsSchema,
      default: () => ({ currentUses: 0 }),
    },
    stackable: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

promotionSchema.index({ code: 1 });
promotionSchema.index({ propertyId: 1, isActive: 1 });
promotionSchema.index({ "conditions.validFrom": 1, "conditions.validTo": 1 });

promotionSchema.plugin(softDeletePlugin);
promotionSchema.plugin(toJSONPlugin);

export const Promotion = model<IPromotion>("Promotion", promotionSchema);
