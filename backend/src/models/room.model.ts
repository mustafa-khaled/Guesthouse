import { Schema, model, Types, Document } from "mongoose";
import { softDeletePlugin, toJSONPlugin } from "../common/plugins";
import { RoomStatus } from "../common/enums/roomStatus.enum";

export interface IRoom extends Document {
  propertyId: Types.ObjectId;
  roomTypeId: Types.ObjectId;
  roomNumber: string;
  floor?: number;
  status: RoomStatus;
  isOccupied: boolean;
  features: string[];
  notes?: string;
  lastCleanedAt?: Date;
  lastInspectedAt?: Date;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
      index: true,
    },
    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },
    floor: Number,
    status: {
      type: String,
      enum: Object.values(RoomStatus),
      default: RoomStatus.CLEAN,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    features: [String],
    notes: String,
    lastCleanedAt: Date,
    lastInspectedAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

roomSchema.index({ propertyId: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ propertyId: 1, roomTypeId: 1, status: 1 });
roomSchema.index({ propertyId: 1, isOccupied: 1, isActive: 1 });

roomSchema.plugin(softDeletePlugin);
roomSchema.plugin(toJSONPlugin);

export const Room = model<IRoom>("Room", roomSchema);
