import { Request, Response, NextFunction } from "express";
import { guestService } from "./guest.service";
import {
  createGuestSchema,
  updateGuestSchema,
  getGuestSchema,
  listGuestsSchema,
  linkUserSchema,
} from "./guest.schema";
import { HttpError } from "../../common/errors/http.errors";

class GuestController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createGuestSchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const guest = await guestService.create(result.data.body);

      return res.status(201).json({
        message: "Guest created successfully",
        data: guest,
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
      const result = getGuestSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const guest = await guestService.findById(result.data.params.id);

      return res.status(200).json({
        data: guest,
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
      const result = updateGuestSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const guest = await guestService.update(
        result.data.params.id,
        result.data.body
      );

      return res.status(200).json({
        message: "Guest updated successfully",
        data: guest,
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
      const result = getGuestSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      await guestService.delete(result.data.params.id);

      return res.status(200).json({
        message: "Guest deleted successfully",
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
      const result = listGuestsSchema.safeParse({ query: req.query });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const { page, limit, sortBy, sortOrder, ...filters } = result.data.query;

      const guests = await guestService.list(
        filters,
        page,
        limit,
        sortBy,
        sortOrder
      );

      return res.status(200).json(guests);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = getGuestSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const bookings = await guestService.getBookings(result.data.params.id);

      return res.status(200).json({
        data: bookings,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async linkUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = linkUserSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const guest = await guestService.linkToUser(
        result.data.params.id,
        result.data.body.userId
      );

      return res.status(200).json({
        message: "Guest linked to user successfully",
        data: guest,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const guest = await guestService.getGuestProfile(req.user.id);

      if (!guest) {
        return res.status(404).json({ message: "Guest profile not found" });
      }

      return res.status(200).json({
        data: guest,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async updateMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = createGuestSchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const guest = await guestService.updateGuestProfile(
        req.user.id,
        result.data.body
      );

      return res.status(200).json({
        message: "Profile updated successfully",
        data: guest,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export const guestController = new GuestController();
