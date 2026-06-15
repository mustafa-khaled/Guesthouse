import { Request, Response, NextFunction } from "express";
import { roomTypeService } from "./roomType.service";
import {
  createRoomTypeSchema,
  updateRoomTypeSchema,
  getRoomTypeSchema,
  listRoomTypesSchema,
} from "./roomType.schema";
import { HttpError } from "../../common/errors/http.errors";

class RoomTypeController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createRoomTypeSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const roomType = await roomTypeService.create(
        result.data.params.propertyId,
        result.data.body
      );

      return res.status(201).json({
        message: "Room type created successfully",
        data: roomType,
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
      const result = getRoomTypeSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const roomType = await roomTypeService.findById(result.data.params.id);

      return res.status(200).json({
        data: roomType,
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
      const result = updateRoomTypeSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const roomType = await roomTypeService.update(
        result.data.params.id,
        result.data.body
      );

      return res.status(200).json({
        message: "Room type updated successfully",
        data: roomType,
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
      const result = getRoomTypeSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      await roomTypeService.delete(result.data.params.id);

      return res.status(200).json({
        message: "Room type deleted successfully",
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async listByProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const result = listRoomTypesSchema.safeParse({
        params: req.params,
        query: req.query,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const { page, limit, ...filters } = result.data.query;

      const roomTypes = await roomTypeService.listByProperty(
        result.data.params.propertyId,
        filters,
        page,
        limit
      );

      return res.status(200).json(roomTypes);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export const roomTypeController = new RoomTypeController();
