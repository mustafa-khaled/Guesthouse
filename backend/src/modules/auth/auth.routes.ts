import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  verifyEmailHandler,
  refreshHandler,
  logoutHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  googleAuthStartHandler,
  googleAuthCallbackHandler,
} from "./auth.controller";
import requireAuth from "../../middleware/requireAuth";
import { authLimiter } from "../../common/middleware";

const router = Router();

router.post("/register", authLimiter, registerHandler);
router.post("/login", authLimiter, loginHandler);
router.get("/verify-email", verifyEmailHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", requireAuth, logoutHandler);
router.post("/forgot-password", authLimiter, forgotPasswordHandler);
router.post("/reset-password", authLimiter, resetPasswordHandler);
router.get("/google", googleAuthStartHandler);
router.get("/google/callback", googleAuthCallbackHandler);

export default router;
