import { Request, Response, NextFunction } from "express";
import { addOnService } from "./addOn.service";
import { bookingService } from "../booking/booking.service";
import {
  createAddOnSchema,
  updateAddOnSchema,
  getAddOnSchema,
  listAddOnsSchema,
  addToBookingSchema,
  removeFromBookingSchema,
} from "./addOn.schema";
import { HttpError } from "../../common/errors/http.errors";

class AddOnController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createAddOnSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const addOn = await addOnService.create(
        result.data.params.propertyId,
        result.data.body
      );

      return res.status(201).json({
        message: "Add-on created successfully",
        data: addOn,
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
      const result = getAddOnSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const addOn = await addOnService.findById(result.data.params.id);

      return res.status(200).json({
        data: addOn,
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
      const result = updateAddOnSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const addOn = await addOnService.update(
        result.data.params.id,
        result.data.body
      );

      return res.status(200).json({
        message: "Add-on updated successfully",
        data: addOn,
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
      const result = getAddOnSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      await addOnService.delete(result.data.params.id);

      return res.status(200).json({
        message: "Add-on deleted successfully",
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
      const result = listAddOnsSchema.safeParse({
        params: req.params,
        query: req.query,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const addOns = await addOnService.listByProperty(
        result.data.params.propertyId,
        result.data.query.category,
        result.data.query.isActive
      );

      return res.status(200).json({
        data: addOns,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async addToBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const result = addToBookingSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const bookingAddOn = await addOnService.addToBooking(
        result.data.params.bookingId,
        result.data.body.addOnId,
        result.data.body.quantity,
        result.data.body.scheduledDate,
        result.data.body.notes
      );

      await bookingService.recalculateTotals(result.data.params.bookingId);

      return res.status(201).json({
        message: "Add-on added to booking successfully",
        data: bookingAddOn,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async removeFromBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const result = removeFromBookingSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      await addOnService.removeFromBooking(
        result.data.params.bookingId,
        result.data.params.addOnId
      );

      await bookingService.recalculateTotals(result.data.params.bookingId);

      return res.status(200).json({
        message: "Add-on removed from booking successfully",
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export const addOnController = new AddOnController();
