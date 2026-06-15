import { Schema, model, Types, Document } from "mongoose";
import { softDeletePlugin, toJSONPlugin } from "../common/plugins";

export interface IRoomTypeOccupancy {
  adults: number;
  children: number;
  total: number;
}

export interface IRoomTypeSize {
  value: number;
  unit: string;
}

export interface IRoomTypeImage {
  url: string;
  caption?: string;
}

export interface IRoomType extends Document {
  propertyId: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  amenities: string[];
  maxOccupancy: IRoomTypeOccupancy;
  bedConfiguration?: string;
  size?: IRoomTypeSize;
  images: IRoomTypeImage[];
  basePrice: number;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const occupancySchema = new Schema(
  {
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const sizeSchema = new Schema(
  {
    value: { type: Number, required: true },
    unit: { type: String, default: "sqm" },
  },
  { _id: false }
);

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    caption: String,
  },
  { _id: false }
);

const roomTypeSchema = new Schema<IRoomType>(
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
    amenities: [String],
    maxOccupancy: {
      type: occupancySchema,
      required: true,
    },
    bedConfiguration: String,
    size: sizeSchema,
    images: [imageSchema],
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

roomTypeSchema.index({ propertyId: 1, code: 1 }, { unique: true });
roomTypeSchema.index({ propertyId: 1, isActive: 1, isDeleted: 1 });

roomTypeSchema.plugin(softDeletePlugin);
roomTypeSchema.plugin(toJSONPlugin);

export const RoomType = model<IRoomType>("RoomType", roomTypeSchema);
