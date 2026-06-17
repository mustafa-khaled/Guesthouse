import { Request } from "express";
import { Types } from "mongoose";
import {
  AuditLog,
  AuditAction,
  AuditResource,
  IAuditLog,
} from "../models/auditLog.model";
import { logger } from "./logger";

export { AuditAction, AuditResource } from "../models/auditLog.model";

export interface AuditOptions {
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string | Types.ObjectId;
  resourceName?: string;
  details?: Record<string, unknown>;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  success?: boolean;
  errorMessage?: string;
}

export interface AuditContext {
  userId?: string | Types.ObjectId;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

function extractContextFromRequest(req?: Request): AuditContext {
  if (!req) {
    return {};
  }

  const user = req.user as
    | { _id?: string; id?: string; email?: string; name?: string; role?: string }
    | undefined;

  return {
    userId: user?._id || user?.id,
    userEmail: user?.email,
    userName: user?.name,
    userRole: user?.role,
    ipAddress:
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip,
    userAgent: req.headers["user-agent"],
    requestId: (req as Request & { id?: string }).id,
  };
}

function sanitizeData(
  data: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!data) return undefined;

  const sensitiveFields = [
    "password",
    "passwordConfirm",
    "currentPassword",
    "newPassword",
    "token",
    "accessToken",
    "refreshToken",
    "resetPasswordToken",
    "secret",
    "apiKey",
    "creditCard",
    "cvv",
    "ssn",
  ];

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  }

  return sanitized;
}

export async function audit(
  options: AuditOptions,
  reqOrContext?: Request | AuditContext
): Promise<IAuditLog | null> {
  try {
    const context =
      reqOrContext && "headers" in reqOrContext
        ? extractContextFromRequest(reqOrContext as Request)
        : (reqOrContext as AuditContext) || {};

    const auditEntry = new AuditLog({
      action: options.action,
      resource: options.resource,
      resourceId: options.resourceId
        ? new Types.ObjectId(options.resourceId.toString())
        : undefined,
      resourceName: options.resourceName,
      userId: context.userId
        ? new Types.ObjectId(context.userId.toString())
        : undefined,
      userEmail: context.userEmail,
      userName: context.userName,
      userRole: context.userRole,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestId: context.requestId,
      details: options.details,
      previousData: sanitizeData(options.previousData),
      newData: sanitizeData(options.newData),
      success: options.success ?? true,
      errorMessage: options.errorMessage,
    });

    const saved = await auditEntry.save();

    logger.debug(
      {
        action: options.action,
        resource: options.resource,
        resourceId: options.resourceId,
        userId: context.userId,
      },
      "Audit log created"
    );

    return saved;
  } catch (err) {
    logger.error({ err, options }, "Failed to create audit log");
    return null;
  }
}

export async function auditSuccess(
  options: Omit<AuditOptions, "success" | "errorMessage">,
  reqOrContext?: Request | AuditContext
): Promise<IAuditLog | null> {
  return audit({ ...options, success: true }, reqOrContext);
}

export async function auditFailure(
  options: Omit<AuditOptions, "success"> & { errorMessage: string },
  reqOrContext?: Request | AuditContext
): Promise<IAuditLog | null> {
  return audit({ ...options, success: false }, reqOrContext);
}

export interface AuditQueryOptions {
  action?: AuditAction | AuditAction[];
  resource?: AuditResource | AuditResource[];
  resourceId?: string;
  userId?: string;
  userEmail?: string;
  success?: boolean;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
}

export async function queryAuditLogs(options: AuditQueryOptions = {}): Promise<{
  logs: IAuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const {
    action,
    resource,
    resourceId,
    userId,
    userEmail,
    success,
    startDate,
    endDate,
    page = 1,
    limit = 50,
    sort = "desc",
  } = options;

  const query: Record<string, unknown> = {};

  if (action) {
    query.action = Array.isArray(action) ? { $in: action } : action;
  }

  if (resource) {
    query.resource = Array.isArray(resource) ? { $in: resource } : resource;
  }

  if (resourceId) {
    query.resourceId = new Types.ObjectId(resourceId);
  }

  if (userId) {
    query.userId = new Types.ObjectId(userId);
  }

  if (userEmail) {
    query.userEmail = { $regex: userEmail, $options: "i" };
  }

  if (typeof success === "boolean") {
    query.success = success;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      (query.createdAt as Record<string, Date>).$gte = startDate;
    }
    if (endDate) {
      (query.createdAt as Record<string, Date>).$lte = endDate;
    }
  }

  const skip = (page - 1) * limit;
  const sortOrder = sort === "asc" ? 1 : -1;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs: logs as IAuditLog[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getResourceHistory(
  resource: AuditResource,
  resourceId: string,
  limit: number = 100
): Promise<IAuditLog[]> {
  return AuditLog.find({
    resource,
    resourceId: new Types.ObjectId(resourceId),
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean() as Promise<IAuditLog[]>;
}

export async function getUserActivity(
  userId: string,
  limit: number = 100
): Promise<IAuditLog[]> {
  return AuditLog.find({
    userId: new Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean() as Promise<IAuditLog[]>;
}
