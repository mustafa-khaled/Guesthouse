import { Schema, model, Document, Types } from "mongoose";
import { env } from "../config/env";

export enum AuditAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LOGIN = "login",
  LOGOUT = "logout",
  LOGIN_FAILED = "login_failed",
  PASSWORD_RESET = "password_reset",
  PASSWORD_CHANGE = "password_change",
  EMAIL_VERIFIED = "email_verified",
  ROLE_CHANGE = "role_change",
  BOOKING_CONFIRM = "booking_confirm",
  BOOKING_CANCEL = "booking_cancel",
  BOOKING_CHECK_IN = "booking_check_in",
  BOOKING_CHECK_OUT = "booking_check_out",
  PAYMENT_RECEIVED = "payment_received",
  PAYMENT_REFUND = "payment_refund",
  SETTINGS_CHANGE = "settings_change",
  EXPORT_DATA = "export_data",
}

export enum AuditResource {
  USER = "user",
  PROPERTY = "property",
  ROOM_TYPE = "room_type",
  ROOM = "room",
  RATE_PLAN = "rate_plan",
  INVENTORY = "inventory",
  BOOKING = "booking",
  GUEST = "guest",
  PAYMENT = "payment",
  PROMOTION = "promotion",
  ADD_ON = "add_on",
  REVIEW = "review",
  HOUSEKEEPING = "housekeeping",
  NOTIFICATION = "notification",
  SYSTEM = "system",
}

export interface IAuditLog extends Document {
  action: AuditAction;
  resource: AuditResource;
  resourceId?: Types.ObjectId;
  resourceName?: string;
  userId?: Types.ObjectId;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  details?: Record<string, unknown>;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
      index: true,
    },
    resource: {
      type: String,
      enum: Object.values(AuditResource),
      required: true,
      index: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    resourceName: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    userEmail: {
      type: String,
      index: true,
    },
    userName: {
      type: String,
    },
    userRole: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    requestId: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    previousData: {
      type: Schema.Types.Mixed,
    },
    newData: {
      type: Schema.Types.Mixed,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: env.AUDIT_LOG_RETENTION_DAYS * 24 * 60 * 60 }
);

auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
