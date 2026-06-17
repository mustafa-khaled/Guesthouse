import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import {
  getHealthStatus,
  getReadinessStatus,
  getLivenessStatus,
  getUptime,
} from "./lib/health";
import { authRouter } from "./modules/auth";
import { propertyRouter } from "./modules/property";
import { roomTypeRouter } from "./modules/roomType";
import { roomRouter } from "./modules/room";
import { ratePlanRouter } from "./modules/ratePlan";
import { inventoryRouter } from "./modules/inventory";
import { guestRouter } from "./modules/guest";
import { bookingRouter } from "./modules/booking";
import { addOnRouter } from "./modules/addOn";
import { promotionRouter } from "./modules/promotion";
import { paymentRouter } from "./modules/payment";
import webhookRouter from "./modules/payment/webhook.routes";
import { notificationRouter } from "./modules/notification";
import { housekeepingRouter } from "./modules/housekeeping";
import { frontDeskRouter } from "./modules/frontDesk";
import { reportsRouter } from "./modules/reports";
import { dashboardRouter } from "./modules/dashboard";
import { reviewRouter } from "./modules/review";
import { uploadRouter } from "./modules/upload";
import { searchRouter } from "./modules/search";
import { exportRouter } from "./modules/export";
import userRouter from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import docsRouter from "./routes/docs.routes";
import { errorHandler, notFoundHandler } from "./middleware";
import { apiLimiter, uploadLimiter } from "./common/middleware";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
        frameSrc: ["'self'", "https://js.stripe.com"],
        connectSrc: ["'self'", env.FRONTEND_URL, "https://api.stripe.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

app.use(mongoSanitize());

app.use(hpp());

app.use(pinoHttp({ logger }));

app.use(
  "/api/v1/webhooks",
  express.raw({ type: "application/json" }),
  webhookRouter
);

app.use(express.json());

app.use(cookieParser());

app.get("/health", async (req, res) => {
  const health = await getHealthStatus();
  const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;
  res.status(statusCode).json(health);
});

app.get("/health/ready", async (req, res) => {
  const readiness = await getReadinessStatus();
  const statusCode = readiness.status === "ready" ? 200 : 503;
  res.status(statusCode).json(readiness);
});

app.get("/health/live", (req, res) => {
  const liveness = getLivenessStatus();
  res.status(200).json(liveness);
});

app.get("/health/uptime", (req, res) => {
  res.status(200).json({
    uptime: getUptime(),
    uptimeHuman: `${Math.floor(getUptime() / 3600)}h ${Math.floor((getUptime() % 3600) / 60)}m ${getUptime() % 60}s`,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/docs", docsRouter);

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/admin", adminRoutes);

app.use("/api/v1", apiLimiter);

app.use("/api/v1", propertyRouter);
app.use("/api/v1", roomTypeRouter);
app.use("/api/v1", roomRouter);
app.use("/api/v1", ratePlanRouter);
app.use("/api/v1", inventoryRouter);
app.use("/api/v1", guestRouter);
app.use("/api/v1", bookingRouter);
app.use("/api/v1", addOnRouter);
app.use("/api/v1", promotionRouter);
app.use("/api/v1", paymentRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", housekeepingRouter);
app.use("/api/v1", frontDeskRouter);
app.use("/api/v1", reportsRouter);
app.use("/api/v1", dashboardRouter);
app.use("/api/v1", reviewRouter);
app.use("/api/v1/upload", uploadLimiter, uploadRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/export", exportRouter);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
