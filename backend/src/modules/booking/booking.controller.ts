import { Request, Response, NextFunction } from "express";
import { bookingService } from "./booking.service";
import {
  createBookingSchema,
  updateBookingSchema,
  getBookingSchema,
  listBookingsSchema,
  cancelBookingSchema,
  checkInSchema,
  checkOutSchema,
  assignRoomSchema,
} from "./booking.schema";
import { HttpError } from "../../common/errors/http.errors";

class BookingController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createBookingSchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const booking = await bookingService.create(
        result.data.body,
        req.user?.id
      );

      return res.status(201).json({
        message: "Booking created successfully",
        data: booking,
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
      const result = getBookingSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const booking = await bookingService.findById(result.data.params.id);

      return res.status(200).json({
        data: booking,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getByConfirmationNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const confirmationNumber = req.params.confirmationNumber;
      if (!confirmationNumber) {
        return res.status(400).json({ message: "Confirmation number required" });
      }

      const booking = await bookingService.findByConfirmationNumber(
        confirmationNumber
      );

      return res.status(200).json({
        data: booking,
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
      const result = updateBookingSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const booking = await bookingService.update(
        result.data.params.id,
        result.data.body
      );

      return res.status(200).json({
        message: "Booking updated successfully",
        data: booking,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const result = cancelBookingSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const booking = await bookingService.cancel(
        result.data.params.id,
        result.data.body.reason,
        req.user?.id
      );

      return res.status(200).json({
        message: "Booking cancelled successfully",
        data: booking,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = checkInSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const booking = await bookingService.checkIn(
        result.data.params.id,
        result.data.body.roomId,
        req.user!.id
      );

      return res.status(200).json({
        message: "Guest checked in successfully",
        data: booking,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const result = checkOutSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const booking = await bookingService.checkOut(
        result.data.params.id,
        req.user!.id
      );

      return res.status(200).json({
        message: "Guest checked out successfully",
        data: booking,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async assignRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const result = assignRoomSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const booking = await bookingService.assignRoom(
        result.data.params.id,
        result.data.body.roomId
      );

      return res.status(200).json({
        message: "Room assigned successfully",
        data: booking,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const result = getBookingSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const booking = await bookingService.confirmBooking(result.data.params.id);

      return res.status(200).json({
        message: "Booking confirmed successfully",
        data: booking,
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
      const result = listBookingsSchema.safeParse({ query: req.query });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const { page, limit, sortBy, sortOrder, ...filters } = result.data.query;

      const bookings = await bookingService.list(
        filters,
        page,
        limit,
        sortBy,
        sortOrder
      );

      return res.status(200).json(bookings);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const bookings = await bookingService.getMyBookings(req.user.id);

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

  async getAddOns(req: Request, res: Response, next: NextFunction) {
    try {
      const result = getBookingSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const addOns = await bookingService.getBookingAddOns(result.data.params.id);

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
}

export const bookingController = new BookingController();
