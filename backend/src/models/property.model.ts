import { Schema, model, Types, Document } from "mongoose";
import { softDeletePlugin, toJSONPlugin } from "../common/plugins";

export interface IPropertyAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}

export interface IPropertyContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface IPropertySettings {
  timezone: string;
  currency: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy?: string;
  taxRate?: number;
  serviceFeeRate?: number;
}

export interface IPropertyImage {
  url: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface IProperty extends Document {
  name: string;
  slug: string;
  description?: string;
  address: IPropertyAddress;
  contact: IPropertyContact;
  settings: IPropertySettings;
  amenities: string[];
  images: IPropertyImage[];
  starRating?: number;
  isActive: boolean;
  ownerId?: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema(
  {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false }
);

const contactSchema = new Schema(
  {
    phone: String,
    email: String,
    website: String,
  },
  { _id: false }
);

const settingsSchema = new Schema(
  {
    timezone: { type: String, default: "UTC" },
    currency: { type: String, default: "USD" },
    checkInTime: { type: String, default: "15:00" },
    checkOutTime: { type: String, default: "11:00" },
    cancellationPolicy: String,
    taxRate: { type: Number, default: 0 },
    serviceFeeRate: { type: Number, default: 0 },
  },
  { _id: false }
);

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    caption: String,
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const propertySchema = new Schema<IProperty>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: String,
    address: {
      type: addressSchema,
      default: () => ({}),
    },
    contact: {
      type: contactSchema,
      default: () => ({}),
    },
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
    amenities: [String],
    images: [imageSchema],
    starRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

propertySchema.index({ slug: 1 });
propertySchema.index({ isActive: 1, isDeleted: 1 });
propertySchema.index({ "address.city": 1, "address.country": 1 });
propertySchema.index({ ownerId: 1 });

propertySchema.plugin(softDeletePlugin);
propertySchema.plugin(toJSONPlugin);

export const Property = model<IProperty>("Property", propertySchema);
