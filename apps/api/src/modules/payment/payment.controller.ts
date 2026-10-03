import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import {
  createPaymentIntentSchema,
  chargeSavedCardSchema,
  confirmPaymentSchema,
  recordCashPaymentSchema,
  processRefundSchema,
  getFolioSchema,
  addFolioChargeSchema,
  savePaymentMethodSchema,
  paymentMethodIdSchema,
} from './payment.schema';
import { HttpError } from '../../common/errors/http.errors';

class PaymentController {
  async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createPaymentIntentSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: result.error.flatten(),
        });
      }

      const paymentIntent = await paymentService.createPaymentIntent(
        result.data.params.bookingId,
        result.data.body.amount,
        result.data.body.isDeposit,
        req.user,
        result.data.body.saveCard,
      );

      return res.status(200).json({
        message: 'Payment intent created',
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
          message: 'Validation failed',
          errors: result.error.flatten(),
        });
      }

      const payment = await paymentService.confirmPayment(
        result.data.params.bookingId,
        result.data.body.paymentIntentId,
        req.user,
      );

      return res.status(200).json({
        message: 'Payment confirmed',
        data: payment,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async chargeSavedCard(req: Request, res: Response, next: NextFunction) {
    try {
      const result = chargeSavedCardSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: result.error.flatten(),
        });
      }

      const charged = await paymentService.chargeSavedCard(
        result.data.params.bookingId,
        result.data.body.paymentMethodId,
        req.user!,
        result.data.body.isDeposit,
        result.data.body.amount,
      );

      return res.status(200).json({
        message: charged.requiresAction ? 'Additional authentication required' : 'Payment charged',
        data: charged,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async createSetupIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await paymentService.createSetupIntent(req.user!.id);
      return res.status(200).json({ data });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async listPaymentMethods(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await paymentService.listSavedPaymentMethods(req.user!.id);
      return res.status(200).json({ data });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async savePaymentMethod(req: Request, res: Response, next: NextFunction) {
    try {
      const result = savePaymentMethodSchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: result.error.flatten(),
        });
      }

      const paymentMethod = await paymentService.savePaymentMethod(
        req.user!.id,
        result.data.body.stripePaymentMethodId,
      );

      return res.status(201).json({
        message: 'Payment method saved',
        data: paymentMethod,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async setDefaultPaymentMethod(req: Request, res: Response, next: NextFunction) {
    try {
      const result = paymentMethodIdSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: result.error.flatten(),
        });
      }

      const paymentMethod = await paymentService.setDefaultPaymentMethod(
        req.user!.id,
        result.data.params.id,
      );

      return res.status(200).json({
        message: 'Default payment method updated',
        data: paymentMethod,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async deletePaymentMethod(req: Request, res: Response, next: NextFunction) {
    try {
      const result = paymentMethodIdSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: result.error.flatten(),
        });
      }

      await paymentService.deletePaymentMethod(req.user!.id, result.data.params.id);

      return res.status(200).json({ message: 'Payment method removed' });
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
          message: 'Validation failed',
          errors: result.error.flatten(),
        });
      }

      const payment = await paymentService.recordCashPayment(
        result.data.params.bookingId,
        result.data.body.amount,
        req.user!.id,
        result.data.body.notes,
      );

      return res.status(201).json({
        message: 'Cash payment recorded',
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
          message: 'Validation failed',
          errors: result.error.flatten(),
        });
      }

      const refund = await paymentService.processRefund(
        result.data.params.bookingId,
        result.data.body.amount,
        req.user!.id,
        result.data.body.reason,
      );

      return res.status(200).json({
        message: 'Refund processed',
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
          message: 'Validation failed',
          errors: result.error.flatten(),
        });
      }

      const folio = await paymentService.getFolio(result.data.params.bookingId, req.user);

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
          message: 'Validation failed',
          errors: result.error.flatten(),
        });
      }

      const folio = await paymentService.addCharge(
        result.data.params.bookingId,
        result.data.body.description,
        result.data.body.amount,
        result.data.body.quantity,
        result.data.body.category,
      );

      return res.status(200).json({
        message: 'Charge added to folio',
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
          message: 'Validation failed',
          errors: result.error.flatten(),
        });
      }

      const payments = await paymentService.getPaymentHistory(result.data.params.bookingId);

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
