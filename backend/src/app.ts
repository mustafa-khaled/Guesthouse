import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
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
import { notificationRouter } from "./modules/notification";
import { housekeepingRouter } from "./modules/housekeeping";
import { frontDeskRouter } from "./modules/frontDesk";
import { reportsRouter } from "./modules/reports";
import { dashboardRouter } from "./modules/dashboard";
import { reviewRouter } from "./modules/review";
import userRouter from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import { errorHandler, notFoundHandler } from "./middleware";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK", timestamp: new Date().toISOString() });
});

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/admin", adminRoutes);

app.use("/api", propertyRouter);
app.use("/api", roomTypeRouter);
app.use("/api", roomRouter);
app.use("/api", ratePlanRouter);
app.use("/api", inventoryRouter);
app.use("/api", guestRouter);
app.use("/api", bookingRouter);
app.use("/api", addOnRouter);
app.use("/api", promotionRouter);
app.use("/api", paymentRouter);
app.use("/api", notificationRouter);
app.use("/api", housekeepingRouter);
app.use("/api", frontDeskRouter);
app.use("/api", reportsRouter);
app.use("/api", dashboardRouter);
app.use("/api", reviewRouter);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
