import { Request, Response, NextFunction } from "express";
import { notificationService } from "./notification.service";
import { bookingService } from "../booking/booking.service";
import { HttpError } from "../../common/errors/http.errors";
import { z } from "zod";

const resendConfirmationSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1),
  }),
});

const testEmailSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

class NotificationController {
  async resendConfirmation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = resendConfirmationSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const booking = await bookingService.findById(result.data.params.bookingId);
      await notificationService.sendBookingConfirmation(booking);

      return res.status(200).json({
        message: "Confirmation email sent successfully",
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async sendTestEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = testEmailSchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      await notificationService.sendTestEmail(result.data.body.email);

      return res.status(200).json({
        message: "Test email sent successfully",
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
