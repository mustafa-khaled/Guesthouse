import { Schema, model, Types, Document } from "mongoose";
import { softDeletePlugin, toJSONPlugin } from "../common/plugins";

export enum PriceAdjustmentType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
  ABSOLUTE = "absolute",
}

export interface IDateRange {
  start: Date;
  end: Date;
}

export interface IPriceAdjustment {
  type: PriceAdjustmentType;
  value: number;
}

export interface IPriceRule extends Document {
  ratePlanId: Types.ObjectId;
  name: string;
  dateRange: IDateRange;
  daysOfWeek?: number[];
  priceAdjustment: IPriceAdjustment;
  priority: number;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dateRangeSchema = new Schema(
  {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  { _id: false }
);

const priceAdjustmentSchema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(PriceAdjustmentType),
      required: true,
    },
    value: { type: Number, required: true },
  },
  { _id: false }
);

const priceRuleSchema = new Schema<IPriceRule>(
  {
    ratePlanId: {
      type: Schema.Types.ObjectId,
      ref: "RatePlan",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dateRange: {
      type: dateRangeSchema,
      required: true,
    },
    daysOfWeek: {
      type: [Number],
      validate: {
        validator: (arr: number[]) =>
          arr.every((d) => d >= 0 && d <= 6),
        message: "Days of week must be between 0 (Sunday) and 6 (Saturday)",
      },
    },
    priceAdjustment: {
      type: priceAdjustmentSchema,
      required: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

priceRuleSchema.index({ ratePlanId: 1, "dateRange.start": 1, "dateRange.end": 1 });
priceRuleSchema.index({ ratePlanId: 1, isActive: 1, priority: -1 });

priceRuleSchema.plugin(softDeletePlugin);
priceRuleSchema.plugin(toJSONPlugin);

export const PriceRule = model<IPriceRule>("PriceRule", priceRuleSchema);
