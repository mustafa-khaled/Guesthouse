import { Schema, model, Types, Document } from "mongoose";
import { softDeletePlugin, toJSONPlugin } from "../common/plugins";

export enum AddOnPricingType {
  PER_STAY = "per-stay",
  PER_NIGHT = "per-night",
  PER_PERSON = "per-person",
  PER_PERSON_PER_NIGHT = "per-person-per-night",
}

export enum AddOnCategory {
  TRANSPORT = "transport",
  DINING = "dining",
  SPA = "spa",
  EXPERIENCE = "experience",
  AMENITY = "amenity",
  OTHER = "other",
}

export interface IAddOnPricing {
  type: AddOnPricingType;
  amount: number;
}

export interface IAddOnAvailability {
  daysOfWeek?: number[];
  requiresAdvanceBooking: boolean;
  advanceBookingHours?: number;
}

export interface IAddOn extends Document {
  propertyId: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  category: AddOnCategory;
  pricing: IAddOnPricing;
  availability: IAddOnAvailability;
  maxQuantity?: number;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pricingSchema = new Schema(
  {
    type: {
      type: String,
      enum: Object.values(AddOnPricingType),
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const availabilitySchema = new Schema(
  {
    daysOfWeek: {
      type: [Number],
      validate: {
        validator: (arr: number[]) => arr.every((d) => d >= 0 && d <= 6),
        message: "Days of week must be between 0 and 6",
      },
    },
    requiresAdvanceBooking: { type: Boolean, default: false },
    advanceBookingHours: { type: Number, min: 0 },
  },
  { _id: false }
);

const addOnSchema = new Schema<IAddOn>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
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
    category: {
      type: String,
      enum: Object.values(AddOnCategory),
      default: AddOnCategory.OTHER,
    },
    pricing: {
      type: pricingSchema,
      required: true,
    },
    availability: {
      type: availabilitySchema,
      default: () => ({ requiresAdvanceBooking: false }),
    },
    maxQuantity: { type: Number, min: 1 },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

addOnSchema.index({ propertyId: 1, code: 1 }, { unique: true });
addOnSchema.index({ propertyId: 1, isActive: 1, category: 1 });

addOnSchema.plugin(softDeletePlugin);
addOnSchema.plugin(toJSONPlugin);

export const AddOn = model<IAddOn>("AddOn", addOnSchema);
