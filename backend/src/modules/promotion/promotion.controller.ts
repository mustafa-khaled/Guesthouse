import { Request, Response, NextFunction } from "express";
import { promotionService } from "./promotion.service";
import {
  createPromotionSchema,
  updatePromotionSchema,
  getPromotionSchema,
  listPromotionsSchema,
  validatePromotionSchema,
} from "./promotion.schema";
import { HttpError } from "../../common/errors/http.errors";
import { parseDate, getNightsBetween } from "../../common/utils/dateUtils";

class PromotionController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createPromotionSchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const promotion = await promotionService.create(result.data.body);

      return res.status(201).json({
        message: "Promotion created successfully",
        data: promotion,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = getPromotionSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const promotion = await promotionService.findById(result.data.params.id);

      return res.status(200).json({
        data: promotion,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = updatePromotionSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const promotion = await promotionService.update(
        result.data.params.id,
        result.data.body
      );

      return res.status(200).json({
        message: "Promotion updated successfully",
        data: promotion,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = getPromotionSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      await promotionService.delete(result.data.params.id);

      return res.status(200).json({
        message: "Promotion deleted successfully",
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = listPromotionsSchema.safeParse({ query: req.query });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const { page, limit, propertyId, isActive } = result.data.query;

      const promotions = await promotionService.list(
        propertyId,
        isActive,
        page,
        limit
      );

      return res.status(200).json(promotions);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = validatePromotionSchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const { code, propertyId, roomTypeId, ratePlanId, checkIn, checkOut, roomTotal } =
        result.data.body;

      const checkInDate = parseDate(checkIn);
      const checkOutDate = parseDate(checkOut);
      const nights = getNightsBetween(checkInDate, checkOutDate);

      const validation = await promotionService.validate(code, {
        propertyId,
        roomTypeId,
        ratePlanId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        roomTotal,
        guestId: req.user?.id,
      });

      return res.status(200).json({
        data: validation,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export const promotionController = new PromotionController();
