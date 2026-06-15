import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib";
import { User } from "../models";
import { Role } from "../common/enums/role.enum";

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header is required" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token is required" });
  }

  try {
    const payload = verifyAccessToken(token);

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ message: "Token version mismatch" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role as Role,
      isEmailVerified: user.isEmailVerified,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export default requireAuth;
