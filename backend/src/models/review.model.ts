import { Schema, model, Types, Document } from "mongoose";
import { softDeletePlugin, toJSONPlugin } from "../common/plugins";

export enum ReviewStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface IReviewRatings {
  overall: number;
  cleanliness?: number;
  comfort?: number;
  location?: number;
  service?: number;
  value?: number;
}

export interface IReviewResponse {
  text: string;
  respondedAt: Date;
  respondedBy: Types.ObjectId;
}

export interface IReview extends Document {
  propertyId: Types.ObjectId;
  bookingId: Types.ObjectId;
  guestId: Types.ObjectId;
  ratings: IReviewRatings;
  title?: string;
  text?: string;
  pros?: string[];
  cons?: string[];
  status: ReviewStatus;
  response?: IReviewResponse;
  verifiedStay: boolean;
  helpful: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ratingsSchema = new Schema(
  {
    overall: { type: Number, required: true, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    comfort: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
  },
  { _id: false }
);

const responseSchema = new Schema(
  {
    text: { type: String, required: true },
    respondedAt: { type: Date, default: Date.now },
    respondedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { _id: false }
);

const reviewSchema = new Schema<IReview>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
      index: true,
    },
    ratings: {
      type: ratingsSchema,
      required: true,
    },
    title: {
      type: String,
      maxlength: 200,
    },
    text: {
      type: String,
      maxlength: 2000,
    },
    pros: [String],
    cons: [String],
    status: {
      type: String,
      enum: Object.values(ReviewStatus),
      default: ReviewStatus.PENDING,
      index: true,
    },
    response: responseSchema,
    verifiedStay: {
      type: Boolean,
      default: true,
    },
    helpful: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ propertyId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ guestId: 1, createdAt: -1 });
reviewSchema.index({ "ratings.overall": -1 });

reviewSchema.plugin(softDeletePlugin);
reviewSchema.plugin(toJSONPlugin);

export const Review = model<IReview>("Review", reviewSchema);
