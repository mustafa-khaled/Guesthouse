import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { authService } from "./auth.service";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schema";
import { HttpError } from "../../common/errors";
import { env } from "../../config/env";

function getFrontendUrl(): string {
  return env.FRONTEND_URL;
}

async function getGoogleClient(): Promise<OAuth2Client> {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const redirectUri = env.GOOGLE_CALLBACK_URL;

  if (!clientId || !clientSecret) {
    throw new Error("Google client credentials are not set.");
  }

  return new OAuth2Client({ clientId, clientSecret, redirectUri });
}

function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  const isProd = env.NODE_ENV === "production";

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function registerHandler(req: Request, res: Response) {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    const user = await authService.register(result.data);

    return res.status(201).json({
      message: "User registered. Please check your email to verify your account.",
      user,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function verifyEmailHandler(req: Request, res: Response) {
  try {
    const result = verifyEmailSchema.safeParse({ token: req.query.token });
    if (!result.success) {
      return res.status(400).json({
        message: "Verification token is missing.",
      });
    }

    const message = await authService.verifyEmail(result.data.token, req);

    return res.json({ message });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    const authResult = await authService.login(result.data, req);

    setRefreshTokenCookie(res, authResult.refreshToken);

    return res.json({
      message: "Login successful.",
      accessToken: authResult.accessToken,
      user: authResult.user,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function refreshHandler(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken as string | undefined;

    if (!token) {
      return res.status(401).json({ message: "Refresh token is missing." });
    }

    const authResult = await authService.refresh(token);

    setRefreshTokenCookie(res, authResult.refreshToken);

    return res.json({
      message: "Token refreshed.",
      accessToken: authResult.accessToken,
      user: authResult.user,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function logoutHandler(req: Request, res: Response) {
  try {
    if (req.user?.id) {
      await authService.logout(req.user.id, req);
    }

    res.clearCookie("refreshToken", { path: "/" });

    return res.json({ message: "Logged out successfully." });
  } catch (error) {
    res.clearCookie("refreshToken", { path: "/" });
    return res.json({ message: "Logged out successfully." });
  }
}

export async function forgotPasswordHandler(req: Request, res: Response) {
  try {
    const result = forgotPasswordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Valid email is required." });
    }

    await authService.forgotPassword(result.data.email);

    return res.json({
      message: "If an account exists, you will receive a reset link.",
    });
  } catch (error) {
    return res.json({
      message: "If an account exists, you will receive a reset link.",
    });
  }
}

export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    await authService.resetPassword(result.data.token, result.data.password, req);

    return res.json({ message: "Password reset successfully." });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function googleAuthStartHandler(_req: Request, res: Response) {
  try {
    const state = authService.generateOAuthState();
    const isProd = env.NODE_ENV === "production";

    res.cookie("oauth_state", state, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });

    const client = await getGoogleClient();
    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
      state,
    });

    return res.redirect(authUrl);
  } catch (error) {
    return res.redirect(`${getFrontendUrl()}/auth/error?message=oauth_init_failed`);
  }
}

export async function googleAuthCallbackHandler(req: Request, res: Response) {
  const { code, state, error } = req.query as {
    code?: string;
    state?: string;
    error?: string;
  };

  const frontendUrl = getFrontendUrl();

  if (error) {
    return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error)}`);
  }

  const storedState = req.cookies?.oauth_state;
  res.clearCookie("oauth_state");

  if (!state || state !== storedState) {
    return res.redirect(`${frontendUrl}/auth/error?message=invalid_state`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/auth/error?message=code_missing`);
  }

  try {
    const client = await getGoogleClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      return res.redirect(`${frontendUrl}/auth/error?message=invalid_code`);
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID!,
    });
    const payload = ticket.getPayload();

    const email = payload?.email;
    const emailVerified = payload?.email_verified;
    const googleId = payload?.sub;

    if (!email || !emailVerified || !googleId) {
      return res.redirect(`${frontendUrl}/auth/error?message=invalid_google_profile`);
    }

    const authResult = await authService.handleGoogleAuth(
      googleId,
      email,
      payload?.name,
    );

    setRefreshTokenCookie(res, authResult.refreshToken);

    return res.redirect(
      `${frontendUrl}/auth/callback#access_token=${authResult.accessToken}`,
    );
  } catch (error) {
    return res.redirect(`${frontendUrl}/auth/error?message=oauth_failed`);
  }
}
