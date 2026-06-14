import { Router } from "express";
import {
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
  verifyEmailHandler,
  resetPasswordHandler
} from "../controllers";

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/verify-email", verifyEmailHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);
router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);

export default router;
