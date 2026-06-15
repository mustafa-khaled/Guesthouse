import { Schema, model, Types, Document } from "mongoose";
import { toJSONPlugin } from "../common/plugins";

export enum BookingAddOnStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export interface IBookingAddOn extends Document {
  bookingId: Types.ObjectId;
  addOnId: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  scheduledDate?: Date;
  notes?: string;
  status: BookingAddOnStatus;
  createdAt: Date;
  updatedAt: Date;
}

const bookingAddOnSchema = new Schema<IBookingAddOn>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    addOnId: {
      type: Schema.Types.ObjectId,
      ref: "AddOn",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    scheduledDate: Date,
    notes: String,
    status: {
      type: String,
      enum: Object.values(BookingAddOnStatus),
      default: BookingAddOnStatus.PENDING,
    },
  },
  { timestamps: true }
);

bookingAddOnSchema.index({ bookingId: 1, addOnId: 1 });

bookingAddOnSchema.plugin(toJSONPlugin);

export const BookingAddOn = model<IBookingAddOn>("BookingAddOn", bookingAddOnSchema);
