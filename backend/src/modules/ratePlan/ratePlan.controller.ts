import { Request, Response, NextFunction } from "express";
import { ratePlanService } from "./ratePlan.service";
import {
  createRatePlanSchema,
  updateRatePlanSchema,
  getRatePlanSchema,
  listRatePlansSchema,
  createPriceRuleSchema,
  updatePriceRuleSchema,
} from "./ratePlan.schema";
import { HttpError } from "../../common/errors/http.errors";

class RatePlanController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createRatePlanSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const ratePlan = await ratePlanService.create(
        result.data.params.roomTypeId,
        result.data.body
      );

      return res.status(201).json({
        message: "Rate plan created successfully",
        data: ratePlan,
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
      const result = getRatePlanSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const ratePlan = await ratePlanService.findById(result.data.params.id);

      return res.status(200).json({
        data: ratePlan,
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
      const result = updateRatePlanSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const ratePlan = await ratePlanService.update(
        result.data.params.id,
        result.data.body
      );

      return res.status(200).json({
        message: "Rate plan updated successfully",
        data: ratePlan,
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
      const result = getRatePlanSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      await ratePlanService.delete(result.data.params.id);

      return res.status(200).json({
        message: "Rate plan deleted successfully",
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async listByRoomType(req: Request, res: Response, next: NextFunction) {
    try {
      const result = listRatePlansSchema.safeParse({
        params: req.params,
        query: req.query,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const ratePlans = await ratePlanService.listByRoomType(
        result.data.params.roomTypeId,
        result.data.query.isActive
      );

      return res.status(200).json({
        data: ratePlans,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async createPriceRule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createPriceRuleSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const priceRule = await ratePlanService.createPriceRule(
        result.data.params.ratePlanId,
        result.data.body
      );

      return res.status(201).json({
        message: "Price rule created successfully",
        data: priceRule,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async updatePriceRule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = updatePriceRuleSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const priceRule = await ratePlanService.updatePriceRule(
        result.data.params.id,
        result.data.body
      );

      return res.status(200).json({
        message: "Price rule updated successfully",
        data: priceRule,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async deletePriceRule(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ message: "Price rule ID is required" });
      }

      await ratePlanService.deletePriceRule(id);

      return res.status(200).json({
        message: "Price rule deleted successfully",
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async listPriceRules(req: Request, res: Response, next: NextFunction) {
    try {
      const ratePlanId = req.params.ratePlanId;
      if (!ratePlanId) {
        return res.status(400).json({ message: "Rate plan ID is required" });
      }

      const priceRules = await ratePlanService.listPriceRules(ratePlanId);

      return res.status(200).json({
        data: priceRules,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export const ratePlanController = new RatePlanController();
