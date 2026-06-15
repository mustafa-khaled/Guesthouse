import { Schema, model, Types, Document } from "mongoose";
import { toJSONPlugin } from "../common/plugins";

export interface IInventory extends Document {
  propertyId: Types.ObjectId;
  roomTypeId: Types.ObjectId;
  date: Date;
  totalRooms: number;
  bookedRooms: number;
  heldRooms: number;
  blockedRooms: number;
  availableRooms: number;
  closedToArrival: boolean;
  closedToDeparture: boolean;
  minStay?: number;
  maxStay?: number;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    totalRooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bookedRooms: {
      type: Number,
      default: 0,
      min: 0,
    },
    heldRooms: {
      type: Number,
      default: 0,
      min: 0,
    },
    blockedRooms: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableRooms: {
      type: Number,
      default: 0,
      min: 0,
    },
    closedToArrival: {
      type: Boolean,
      default: false,
    },
    closedToDeparture: {
      type: Boolean,
      default: false,
    },
    minStay: { type: Number, min: 1 },
    maxStay: { type: Number, min: 1 },
  },
  { timestamps: true }
);

inventorySchema.index(
  { propertyId: 1, roomTypeId: 1, date: 1 },
  { unique: true }
);
inventorySchema.index({ propertyId: 1, date: 1 });
inventorySchema.index({ roomTypeId: 1, date: 1, availableRooms: 1 });

inventorySchema.pre("save", function (next) {
  this.availableRooms = Math.max(
    0,
    this.totalRooms - this.bookedRooms - this.heldRooms - this.blockedRooms
  );
  next();
});

inventorySchema.plugin(toJSONPlugin);

export const Inventory = model<IInventory>("Inventory", inventorySchema);

export interface IInventoryHold extends Document {
  propertyId: Types.ObjectId;
  roomTypeId: Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  rooms: number;
  sessionId: string;
  userId?: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

const inventoryHoldSchema = new Schema<IInventoryHold>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    rooms: {
      type: Number,
      required: true,
      min: 1,
    },
    sessionId: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

inventoryHoldSchema.index({ propertyId: 1, roomTypeId: 1, checkIn: 1, checkOut: 1 });
inventoryHoldSchema.index({ sessionId: 1 });

inventoryHoldSchema.plugin(toJSONPlugin);

export const InventoryHold = model<IInventoryHold>("InventoryHold", inventoryHoldSchema);
