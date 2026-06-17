import { Request, Response, Router } from "express";
import { requireAuth, requiredRole } from "../middleware";
import { User } from "../models";
import { Role } from "../common/enums/role.enum";
import {
  queryAuditLogs,
  getResourceHistory,
  getUserActivity,
  AuditAction,
  AuditResource,
} from "../lib/audit";

const router = Router();

router.get(
  "/users",
  requireAuth,
  requiredRole(Role.ADMIN),
  async (_req: Request, res: Response) => {
    try {
      const users = await User.find({}).select("-password");
      return res.json({
        message: "Users fetched successfully",
        users,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
);

router.get(
  "/audit-logs",
  requireAuth,
  requiredRole(Role.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const {
        action,
        resource,
        resourceId,
        userId,
        userEmail,
        success,
        startDate,
        endDate,
        page,
        limit,
        sort,
      } = req.query;

      const result = await queryAuditLogs({
        action: action as AuditAction | AuditAction[] | undefined,
        resource: resource as AuditResource | AuditResource[] | undefined,
        resourceId: resourceId as string | undefined,
        userId: userId as string | undefined,
        userEmail: userEmail as string | undefined,
        success: success === "true" ? true : success === "false" ? false : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        sort: sort as "asc" | "desc" | undefined,
      });

      return res.json({
        message: "Audit logs fetched successfully",
        data: result.logs,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
);

router.get(
  "/audit-logs/resource/:resource/:resourceId",
  requireAuth,
  requiredRole(Role.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { resource, resourceId } = req.params;
      const { limit } = req.query;

      const logs = await getResourceHistory(
        resource as AuditResource,
        resourceId,
        limit ? parseInt(limit as string, 10) : undefined
      );

      return res.json({
        message: "Resource audit history fetched successfully",
        data: logs,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
);

router.get(
  "/audit-logs/user/:userId",
  requireAuth,
  requiredRole(Role.ADMIN),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;

      const logs = await getUserActivity(
        userId,
        limit ? parseInt(limit as string, 10) : undefined
      );

      return res.json({
        message: "User activity fetched successfully",
        data: logs,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
);

router.get(
  "/audit-logs/actions",
  requireAuth,
  requiredRole(Role.ADMIN),
  (_req: Request, res: Response) => {
    return res.json({
      message: "Available audit actions",
      data: Object.values(AuditAction),
    });
  },
);

router.get(
  "/audit-logs/resources",
  requireAuth,
  requiredRole(Role.ADMIN),
  (_req: Request, res: Response) => {
    return res.json({
      message: "Available audit resources",
      data: Object.values(AuditResource),
    });
  },
);

export default router;
