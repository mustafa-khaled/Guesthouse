import { Request, Response, Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware";
import { User } from "../models/user.model";
import { hashPassword, checkPassword } from "../lib";
import { BadRequestError, ConflictError } from "../common/errors";

const router = Router();

router.get("/me", requireAuth, (req: Request, res: Response) => {
  return res.json({
    message: "User profile retrieved successfully",
    user: req.user,
  });
});

const updateMeSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  passwordCurrent: z.string().optional(),
  password: z.string().min(6).optional(),
});

router.patch("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = updateMeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, email, passwordCurrent, password } = result.data;

    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        throw new ConflictError("Email is already in use.");
      }
      user.email = email.toLowerCase();
      user.isEmailVerified = false;
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      if (!passwordCurrent) {
        throw new BadRequestError("Current password is required.");
      }
      const valid = await checkPassword(passwordCurrent, user.password!);
      if (!valid) {
        throw new BadRequestError("Current password is incorrect.");
      }
      user.password = await hashPassword(password);
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    if (error instanceof ConflictError || error instanceof BadRequestError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
