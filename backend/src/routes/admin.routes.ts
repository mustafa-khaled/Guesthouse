import { Request, Response, Router } from "express";
import { requireAuth, requiredRole } from "../middleware";
import { User } from "../models";
import { Role } from "../common/enums/role.enum";

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

export default router;
