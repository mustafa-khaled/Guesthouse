import { NextFunction, Request, Response } from "express";
import { Role, hasMinimumRole } from "../enums/role.enum";
import { AuthUser } from "../types/express.d";

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser | undefined;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const hasAccess = allowedRoles.some(
      (role) => user.role === role || hasMinimumRole(user.role, role),
    );

    if (!hasAccess) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}

export function requireMinimumRole(minimumRole: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser | undefined;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!hasMinimumRole(user.role, minimumRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}
