import { Request, Response, NextFunction } from "express";
import { paymentService } from "./payment.service";
import {
  createPaymentIntentSchema,
  confirmPaymentSchema,
  recordCashPaymentSchema,
  processRefundSchema,
  getFolioSchema,
  addFolioChargeSchema,
} from "./payment.schema";
import { HttpError } from "../../common/errors/http.errors";

class PaymentController {
  async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createPaymentIntentSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const paymentIntent = await paymentService.createPaymentIntent(
        result.data.params.bookingId,
        result.data.body.amount,
        result.data.body.isDeposit
      );

      return res.status(200).json({
        message: "Payment intent created",
        data: paymentIntent,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = confirmPaymentSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const payment = await paymentService.confirmPayment(
        result.data.params.bookingId,
        result.data.body.paymentIntentId
      );

      return res.status(200).json({
        message: "Payment confirmed",
        data: payment,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async recordCashPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = recordCashPaymentSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const payment = await paymentService.recordCashPayment(
        result.data.params.bookingId,
        result.data.body.amount,
        req.user!.id,
        result.data.body.notes
      );

      return res.status(201).json({
        message: "Cash payment recorded",
        data: payment,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async processRefund(req: Request, res: Response, next: NextFunction) {
    try {
      const result = processRefundSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const refund = await paymentService.processRefund(
        result.data.params.bookingId,
        result.data.body.amount,
        req.user!.id,
        result.data.body.reason
      );

      return res.status(200).json({
        message: "Refund processed",
        data: refund,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getFolio(req: Request, res: Response, next: NextFunction) {
    try {
      const result = getFolioSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const folio = await paymentService.getFolio(result.data.params.bookingId);

      return res.status(200).json({
        data: folio,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async addCharge(req: Request, res: Response, next: NextFunction) {
    try {
      const result = addFolioChargeSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const folio = await paymentService.addCharge(
        result.data.params.bookingId,
        result.data.body.description,
        result.data.body.amount,
        result.data.body.quantity,
        result.data.body.category
      );

      return res.status(200).json({
        message: "Charge added to folio",
        data: folio,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getPaymentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = getFolioSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const payments = await paymentService.getPaymentHistory(
        result.data.params.bookingId
      );

      return res.status(200).json({
        data: payments,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
