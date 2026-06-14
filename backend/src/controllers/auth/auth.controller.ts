import { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.schema";
import { User } from "../../models";
import {
  checkPassword,
  createAccessToken,
  createRefreshToken,
  hashPassword,
  sendEmail,
  verifyRefreshToken,
} from "../../lib";
import jwt from "jsonwebtoken";
import crypto from "crypto";

function getAppUrl() {
  return process.env.APP_URL || `http://localhost:${process.env.PORT}`;
}

export async function registerHandler(req: Request, res: Response) {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: result.error.message,
        errors: result.error.flatten(),
      });
    }

    const { email, password, name } = result.data;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "Email is already in use.",
      });
    }

    const passwordHash = await hashPassword(password);

    const newlyCreatedUser = await User.create({
      email: normalizedEmail,
      password: passwordHash,
      name,
      role: "user",
      isEmailVerified: false,
      twoFactorEnabled: false,
    });

    const verifyToken = jwt.sign(
      {
        sub: newlyCreatedUser.id,
      },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "1d",
      },
    );

    const verifyUrl = `${getAppUrl()}/auth/verify-email?token=${verifyToken}`;

    await sendEmail(
      newlyCreatedUser.email,
      "Verify your email",
      `<p>Please verify your email by clicking this link:</p> 
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        `,
    );

    return res.status(201).json({
      message: "User registered",
      user: {
        id: newlyCreatedUser.id,
        email: newlyCreatedUser.email,
        role: newlyCreatedUser.role,
        isEmailVerified: newlyCreatedUser.isEmailVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function verifyEmailHandler(req: Request, res: Response) {
  const token = req.query.token as string | undefined;

  if (!token) {
    return res.status(400).json({ message: "Verification token is missing." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      sub: string;
    };

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    if (user.isEmailVerified) {
      return res.json({ message: "Email already verified." });
    }

    user.isEmailVerified = true;

    await user.save();

    return res.json({ message: "Email now is verified you can login." });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Invalid or expired verification token." });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: result.error.message,
        errors: result.error.flatten(),
      });
    }
    const { email, password } = result.data;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password.",
      });
    }

    const ok = await checkPassword(password, user.password);

    if (!ok) {
      return res.status(400).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }

    const accessToken = createAccessToken(
      user.id,
      user.role,
      user.tokenVersion,
    );

    const refreshToken = createRefreshToken(user.id, user.tokenVersion);

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successfully done.",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function refreshHandler(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken as string | undefined;

    if (!token) {
      return res.status(401).json({
        message: "Refresh token is missing.",
      });
    }

    const payload = verifyRefreshToken(token);

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({
        message: "Refresh token invalidated.",
      });
    }

    const newAccessToken = createAccessToken(
      user.id,
      user.role,
      user.tokenVersion,
    );

    const newRefreshToken = createRefreshToken(user.id, user.tokenVersion);

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Token refreshed.",
      accessToken: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function logoutHandler(_req: Request, res: Response) {
  res.clearCookie("refreshToken", { path: "/" });

  return res.status(200).json({ message: "Logged out successfully" });
}

export async function forgotPasswordHandler(req: Request, res: Response) {
  const { email } = req.body as { email?: string };

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({
        message: "If an account exist, ypu will receive a reset link.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await user.save();

    const resetUrl = `${getAppUrl()}/auth/reset-password?token=${rawToken}`;

    await sendEmail(
      user.email,
      "Reset your password",
      `<p> Reset your password by clicking this link:</p> 
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        `,
    );

    return res.json({
      message: "If an account exist, ypu will receive a reset link.",
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function resetPasswordHandler(req: Request, res: Response) {
  const { token, password } = req.body as { token?: string; password?: string };

  if (!token) {
    return res.status(400).json({ message: "Reset token is missing." });
  }

  if (!password || password?.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 char long." });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() }, // expiry must be in future
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const newPasswordHash = await hashPassword(password);

    user.password = newPasswordHash;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.tokenVersion = user.tokenVersion + 1;

    await user.save();

    return res.json({
      message: "Password reset successfully.",
    });
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired reset token." });
  }
}
