import { Request, Response, NextFunction } from "express";
import { inventoryService } from "./inventory.service";
import {
  searchAvailabilitySchema,
  getInventorySchema,
  bulkUpdateInventorySchema,
  createHoldSchema,
  releaseHoldSchema,
  initializeInventorySchema,
} from "./inventory.schema";
import { HttpError } from "../../common/errors/http.errors";

class InventoryController {
  async searchAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const result = searchAvailabilitySchema.safeParse({ query: req.query });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const availability = await inventoryService.searchAvailability(
        result.data.query
      );

      return res.status(200).json({
        data: availability,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = getInventorySchema.safeParse({
        params: req.params,
        query: req.query,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const inventory = await inventoryService.getInventoryCalendar(
        result.data.params.propertyId,
        result.data.query.startDate,
        result.data.query.endDate,
        result.data.query.roomTypeId
      );

      return res.status(200).json({
        data: inventory,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async bulkUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = bulkUpdateInventorySchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const { propertyId, roomTypeId, startDate, endDate, updates } =
        result.data.body;

      const updatedCount = await inventoryService.bulkUpdateInventory(
        propertyId,
        roomTypeId,
        startDate,
        endDate,
        updates
      );

      return res.status(200).json({
        message: `${updatedCount} inventory records updated`,
        data: { updatedCount },
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async initialize(req: Request, res: Response, next: NextFunction) {
    try {
      const result = initializeInventorySchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const { propertyId, roomTypeId, startDate, endDate, totalRooms } =
        result.data.body;

      const createdCount = await inventoryService.initializeInventory(
        propertyId,
        roomTypeId,
        startDate,
        endDate,
        totalRooms
      );

      return res.status(201).json({
        message: `${createdCount} inventory records initialized`,
        data: { createdCount },
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async createHold(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createHoldSchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const { propertyId, roomTypeId, checkIn, checkOut, rooms, sessionId } =
        result.data.body;

      const hold = await inventoryService.createHold(
        propertyId,
        roomTypeId,
        checkIn,
        checkOut,
        rooms,
        sessionId,
        req.user?.id
      );

      return res.status(201).json({
        message: "Hold created successfully",
        data: hold,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async releaseHold(req: Request, res: Response, next: NextFunction) {
    try {
      const result = releaseHoldSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      await inventoryService.releaseHold(result.data.params.holdId);

      return res.status(200).json({
        message: "Hold released successfully",
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();
