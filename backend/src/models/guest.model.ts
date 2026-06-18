import { Schema, model, Types, Document } from "mongoose";
import { softDeletePlugin, toJSONPlugin } from "../common/plugins";

export interface IIdDocument {
  type: string;
  number: string;
  expiryDate?: Date;
  country?: string;
}

export interface IGuestAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface IGuestPreferences {
  roomPreferences?: string[];
  dietaryRestrictions?: string[];
  specialRequests?: string;
}

export interface IGuest extends Document {
  userId?: Types.ObjectId;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  nationality?: string;
  idDocument?: IIdDocument;
  address?: IGuestAddress;
  preferences?: IGuestPreferences;
  tags: string[];
  notes?: string;
  stayCount: number;
  totalSpend: number;
  lastStayDate?: Date;
  marketingConsent: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const idDocumentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["passport", "national_id", "drivers_license", "other"],
    },
    number: String,
    expiryDate: Date,
    country: String,
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  { _id: false }
);

const preferencesSchema = new Schema(
  {
    roomPreferences: [String],
    dietaryRestrictions: [String],
    specialRequests: String,
  },
  { _id: false }
);

const guestSchema = new Schema<IGuest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: Date,
    nationality: String,
    idDocument: idDocumentSchema,
    address: addressSchema,
    preferences: preferencesSchema,
    tags: {
      type: [String],
      default: [],
    },
    notes: String,
    stayCount: {
      type: Number,
      default: 0,
    },
    totalSpend: {
      type: Number,
      default: 0,
    },
    lastStayDate: Date,
    marketingConsent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

guestSchema.index({ email: 1 }, { unique: true });
guestSchema.index({ phone: 1 }, { sparse: true });
guestSchema.index({ lastName: 1, firstName: 1 });
guestSchema.index({ tags: 1 });
guestSchema.index({ userId: 1 }, { sparse: true });

guestSchema.index(
  { firstName: "text", lastName: "text", email: "text", phone: "text" },
  { weights: { firstName: 10, lastName: 10, email: 5, phone: 3 }, name: "guest_text_search" }
);

guestSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

guestSchema.plugin(softDeletePlugin);
guestSchema.plugin(toJSONPlugin);

export const Guest = model<IGuest>("Guest", guestSchema);
