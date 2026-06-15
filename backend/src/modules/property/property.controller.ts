import { Request, Response, NextFunction } from "express";
import { propertyService } from "./property.service";
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertySchema,
  listPropertiesSchema,
} from "./property.schema";
import { HttpError } from "../../common/errors/http.errors";

class PropertyController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createPropertySchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const property = await propertyService.create(
        result.data.body,
        req.user?.id
      );

      return res.status(201).json({
        message: "Property created successfully",
        data: property,
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
      const result = getPropertySchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const property = await propertyService.findById(result.data.params.id);

      return res.status(200).json({
        data: property,
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
      const result = updatePropertySchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const property = await propertyService.update(
        result.data.params.id,
        result.data.body
      );

      return res.status(200).json({
        message: "Property updated successfully",
        data: property,
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
      const result = getPropertySchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      await propertyService.delete(result.data.params.id);

      return res.status(200).json({
        message: "Property deleted successfully",
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
      const result = listPropertiesSchema.safeParse({ query: req.query });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const { page, limit, sortBy, sortOrder, amenities, ...filters } =
        result.data.query;

      const amenitiesArray = amenities
        ? amenities.split(",").map((a) => a.trim())
        : undefined;

      const properties = await propertyService.list(
        { ...filters, amenities: amenitiesArray },
        page,
        limit,
        sortBy,
        sortOrder
      );

      return res.status(200).json(properties);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = getPropertySchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const stats = await propertyService.getPropertyStats(result.data.params.id);

      return res.status(200).json({
        data: stats,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export const propertyController = new PropertyController();
