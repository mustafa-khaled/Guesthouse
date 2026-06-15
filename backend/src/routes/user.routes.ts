import { Request, Response, Router } from "express";
import { requireAuth } from "../middleware";

const router = Router();

router.get("/me", requireAuth, (req: Request, res: Response) => {
  return res.json({
    message: "User profile retrieved successfully",
    user: req.user,
  });
});

export default router;

