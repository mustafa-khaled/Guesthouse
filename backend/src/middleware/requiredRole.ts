import { NextFunction, Request, Response } from "express";
import { Role, hasMinimumRole } from "../common/enums/role.enum";
import { AuthUser } from "../common/types/express.d";

function requiredRole(...allowedRoles: Role[]) {
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

export default requiredRole;
