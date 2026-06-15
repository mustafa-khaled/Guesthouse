import { Request, Response, NextFunction } from "express";
import { roomService } from "./room.service";
import {
  createRoomSchema,
  updateRoomSchema,
  updateRoomStatusSchema,
  getRoomSchema,
  listRoomsSchema,
  bulkCreateRoomsSchema,
} from "./room.schema";
import { HttpError } from "../../common/errors/http.errors";

class RoomController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createRoomSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const room = await roomService.create(
        result.data.params.propertyId,
        result.data.body
      );

      return res.status(201).json({
        message: "Room created successfully",
        data: room,
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
      const result = getRoomSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const room = await roomService.findById(result.data.params.id);

      return res.status(200).json({
        data: room,
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
      const result = updateRoomSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const room = await roomService.update(
        result.data.params.id,
        result.data.body
      );

      return res.status(200).json({
        message: "Room updated successfully",
        data: room,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = updateRoomStatusSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const room = await roomService.updateStatus(
        result.data.params.id,
        result.data.body.status,
        result.data.body.notes
      );

      return res.status(200).json({
        message: "Room status updated successfully",
        data: room,
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
      const result = getRoomSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      await roomService.delete(result.data.params.id);

      return res.status(200).json({
        message: "Room deleted successfully",
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
      const result = listRoomsSchema.safeParse({
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

      const rooms = await roomService.listByProperty(
        result.data.params.propertyId,
        filters,
        page,
        limit
      );

      return res.status(200).json(rooms);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = bulkCreateRoomsSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const rooms = await roomService.bulkCreate(
        result.data.params.propertyId,
        result.data.body.roomTypeId,
        result.data.body.floors,
        result.data.body.features
      );

      return res.status(201).json({
        message: `${rooms.length} rooms created successfully`,
        data: rooms,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getStatusSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const propertyId = req.params.propertyId;
      if (!propertyId) {
        return res.status(400).json({ message: "Property ID is required" });
      }

      const summary = await roomService.getStatusSummary(propertyId);

      return res.status(200).json({
        data: summary,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export const roomController = new RoomController();
