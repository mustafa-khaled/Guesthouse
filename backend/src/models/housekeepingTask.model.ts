import { Schema, model, Types, Document } from "mongoose";
import { toJSONPlugin } from "../common/plugins";
import {
  HousekeepingTaskType,
  HousekeepingTaskStatus,
  HousekeepingPriority,
} from "../common/enums/roomStatus.enum";

export interface ITaskIssue {
  description: string;
  severity: string;
  reportedAt: Date;
  resolvedAt?: Date;
}

export interface IHousekeepingTask extends Document {
  propertyId: Types.ObjectId;
  roomId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  type: HousekeepingTaskType;
  priority: HousekeepingPriority;
  status: HousekeepingTaskStatus;
  assignedTo?: Types.ObjectId;
  scheduledDate: Date;
  startedAt?: Date;
  completedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  notes?: string;
  issues: ITaskIssue[];
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

const issueSchema = new Schema(
  {
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    reportedAt: { type: Date, default: Date.now },
    resolvedAt: Date,
  },
  { _id: true }
);

const housekeepingTaskSchema = new Schema<IHousekeepingTask>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    type: {
      type: String,
      enum: Object.values(HousekeepingTaskType),
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(HousekeepingPriority),
      default: HousekeepingPriority.NORMAL,
    },
    status: {
      type: String,
      enum: Object.values(HousekeepingTaskStatus),
      default: HousekeepingTaskStatus.PENDING,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    startedAt: Date,
    completedAt: Date,
    verifiedAt: Date,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notes: String,
    issues: [issueSchema],
    duration: Number,
  },
  { timestamps: true }
);

housekeepingTaskSchema.index({ propertyId: 1, scheduledDate: 1, status: 1 });
housekeepingTaskSchema.index({ assignedTo: 1, status: 1, scheduledDate: 1 });
housekeepingTaskSchema.index({ roomId: 1, scheduledDate: 1 });

housekeepingTaskSchema.plugin(toJSONPlugin);

export const HousekeepingTask = model<IHousekeepingTask>(
  "HousekeepingTask",
  housekeepingTaskSchema
);
