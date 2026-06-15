import { Schema, model, Types, Document } from "mongoose";
import { softDeletePlugin, toJSONPlugin } from "../common/plugins";
import {
  BookingStatus,
  PaymentStatus,
  BookingSource,
} from "../common/enums/bookingStatus.enum";

export interface IAdditionalGuest {
  firstName: string;
  lastName: string;
  email?: string;
}

export interface IBookingDates {
  checkIn: Date;
  checkOut: Date;
  nights: number;
}

export interface IBookingOccupancy {
  adults: number;
  children: number;
  rooms: number;
}

export interface IBookingPricing {
  roomRate: number;
  roomTotal: number;
  addOnsTotal: number;
  taxes: number;
  fees: number;
  discountAmount: number;
  grandTotal: number;
}

export interface IBookingPayment {
  status: PaymentStatus;
  amountPaid: number;
  amountDue: number;
  depositAmount: number;
}

export interface IBookingCancellation {
  cancelledAt: Date;
  cancelledBy?: Types.ObjectId;
  reason?: string;
  refundAmount: number;
}

export interface ICheckInDetails {
  checkedInAt: Date;
  checkedInBy: Types.ObjectId;
}

export interface ICheckOutDetails {
  checkedOutAt: Date;
  checkedOutBy: Types.ObjectId;
}

export interface IBooking extends Document {
  confirmationNumber: string;
  propertyId: Types.ObjectId;
  guestId: Types.ObjectId;
  additionalGuests: IAdditionalGuest[];
  roomTypeId: Types.ObjectId;
  ratePlanId: Types.ObjectId;
  assignedRoomId?: Types.ObjectId;
  dates: IBookingDates;
  occupancy: IBookingOccupancy;
  status: BookingStatus;
  pricing: IBookingPricing;
  payment: IBookingPayment;
  specialRequests?: string;
  internalNotes?: string;
  source: BookingSource;
  promotionCode?: string;
  holdId?: Types.ObjectId;
  cancellation?: IBookingCancellation;
  checkInDetails?: ICheckInDetails;
  checkOutDetails?: ICheckOutDetails;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const additionalGuestSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: String,
  },
  { _id: false }
);

const datesSchema = new Schema(
  {
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const occupancySchema = new Schema(
  {
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    rooms: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const pricingSchema = new Schema(
  {
    roomRate: { type: Number, required: true },
    roomTotal: { type: Number, required: true },
    addOnsTotal: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
  },
  { _id: false }
);

const paymentSchema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 },
    depositAmount: { type: Number, default: 0 },
  },
  { _id: false }
);

const cancellationSchema = new Schema(
  {
    cancelledAt: Date,
    cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
    reason: String,
    refundAmount: { type: Number, default: 0 },
  },
  { _id: false }
);

const checkInDetailsSchema = new Schema(
  {
    checkedInAt: Date,
    checkedInBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const checkOutDetailsSchema = new Schema(
  {
    checkedOutAt: Date,
    checkedOutBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const bookingSchema = new Schema<IBooking>(
  {
    confirmationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
      index: true,
    },
    additionalGuests: [additionalGuestSchema],
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
    },
    ratePlanId: {
      type: Schema.Types.ObjectId,
      ref: "RatePlan",
      required: true,
    },
    assignedRoomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
    dates: {
      type: datesSchema,
      required: true,
    },
    occupancy: {
      type: occupancySchema,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
      index: true,
    },
    pricing: {
      type: pricingSchema,
      required: true,
    },
    payment: {
      type: paymentSchema,
      default: () => ({}),
    },
    specialRequests: String,
    internalNotes: String,
    source: {
      type: String,
      enum: Object.values(BookingSource),
      default: BookingSource.DIRECT,
    },
    promotionCode: String,
    holdId: Schema.Types.ObjectId,
    cancellation: cancellationSchema,
    checkInDetails: checkInDetailsSchema,
    checkOutDetails: checkOutDetailsSchema,
  },
  { timestamps: true }
);

bookingSchema.index({ confirmationNumber: 1 });
bookingSchema.index({ propertyId: 1, "dates.checkIn": 1 });
bookingSchema.index({ propertyId: 1, "dates.checkOut": 1 });
bookingSchema.index({ propertyId: 1, status: 1 });
bookingSchema.index({ guestId: 1, createdAt: -1 });
bookingSchema.index({ assignedRoomId: 1, status: 1 });

bookingSchema.plugin(softDeletePlugin);
bookingSchema.plugin(toJSONPlugin);

export const Booking = model<IBooking>("Booking", bookingSchema);
