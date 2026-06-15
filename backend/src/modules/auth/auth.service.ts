import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User, AuthProvider } from "../../models/user.model";
import {
  hashPassword,
  checkPassword,
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  sendEmail,
} from "../../lib";
import { Role } from "../../common/enums/role.enum";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../common/errors";

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface SanitizedUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  isEmailVerified: boolean;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: SanitizedUser;
}

function getAppUrl(): string {
  return process.env.APP_URL || `http://localhost:${process.env.PORT}`;
}

class AuthService {
  async register(input: RegisterInput): Promise<SanitizedUser> {
    const { email, password, name } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ConflictError("Email is already in use.");
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      email: normalizedEmail,
      password: passwordHash,
      name,
      role: Role.USER,
      authProvider: AuthProvider.LOCAL,
      isEmailVerified: false,
    });

    await this.sendVerificationEmail(user.id, user.email);

    return this.sanitizeUser(user);
  }

  async sendVerificationEmail(userId: string, email: string): Promise<void> {
    const verifyToken = jwt.sign(
      { sub: userId },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "1d" },
    );

    const verifyUrl = `${getAppUrl()}/auth/verify-email?token=${verifyToken}`;

    await sendEmail(
      email,
      "Verify your email",
      `<p>Please verify your email by clicking this link:</p>
       <p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    );
  }

  async verifyEmail(token: string): Promise<string> {
    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
        sub: string;
      };

      const user = await User.findById(payload.sub);
      if (!user) {
        throw new NotFoundError("User not found.");
      }

      if (user.isEmailVerified) {
        return "Email already verified.";
      }

      user.isEmailVerified = true;
      await user.save();

      return "Email verified successfully. You can now login.";
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError("Invalid or expired verification token.");
    }
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    if (!user.password) {
      throw new UnauthorizedError(
        "This account uses social login. Please sign in with Google.",
      );
    }

    const isPasswordValid = await checkPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenError("Please verify your email before logging in.");
    }

    const tokens = this.generateTokens(user.id, user.role as Role, user.tokenVersion);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    try {
      const payload = verifyRefreshToken(refreshToken);

      const user = await User.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedError("User not found.");
      }

      if (user.tokenVersion !== payload.tokenVersion) {
        throw new UnauthorizedError("Refresh token invalidated.");
      }

      const tokens = this.generateTokens(user.id, user.role as Role, user.tokenVersion);

      return {
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError("Invalid refresh token.");
    }
  }

  async logout(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
  }

  async forgotPassword(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetUrl = `${getAppUrl()}/auth/reset-password?token=${rawToken}`;

    await sendEmail(
      user.email,
      "Reset your password",
      `<p>Reset your password by clicking this link:</p>
       <p><a href="${resetUrl}">${resetUrl}</a></p>`,
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestError("Invalid or expired reset token.");
    }

    const passwordHash = await hashPassword(newPassword);

    user.password = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.tokenVersion = user.tokenVersion + 1;
    await user.save();
  }

  async handleGoogleAuth(
    googleId: string,
    email: string,
    name?: string,
  ): Promise<AuthResult> {
    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email: normalizedEmail });

      if (user) {
        user.googleId = googleId;
        user.isEmailVerified = true;
        if (!user.name && name) {
          user.name = name;
        }
        await user.save();
      } else {
        user = await User.create({
          email: normalizedEmail,
          name,
          googleId,
          authProvider: AuthProvider.GOOGLE,
          role: Role.USER,
          isEmailVerified: true,
        });
      }
    }

    const tokens = this.generateTokens(user.id, user.role as Role, user.tokenVersion);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  generateOAuthState(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  private generateTokens(
    userId: string,
    role: Role,
    tokenVersion: number,
  ): TokenPair {
    return {
      accessToken: createAccessToken(userId, role, tokenVersion),
      refreshToken: createRefreshToken(userId, tokenVersion),
    };
  }

  private sanitizeUser(user: any): SanitizedUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      isEmailVerified: user.isEmailVerified,
    };
  }
}

export const authService = new AuthService();
