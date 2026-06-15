import { Request, Response, NextFunction } from "express";
import { frontDeskService } from "./frontDesk.service";
import {
  getArrivalsSchema,
  getDeparturesSchema,
  getInHouseSchema,
  getRoomRackSchema,
  walkInSchema,
  roomMoveSchema,
  extendStaySchema,
  earlyCheckoutSchema,
} from "./frontDesk.schema";
import { HttpError } from "../../common/errors/http.errors";

class FrontDeskController {
  async getArrivals(req: Request, res: Response, next: NextFunction) {
    try {
      const result = getArrivalsSchema.safeParse({ query: req.query });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const arrivals = await frontDeskService.getArrivals(
        result.data.query.propertyId,
        result.data.query.date
      );

      return res.status(200).json({
        data: arrivals,
        count: arrivals.length,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getDepartures(req: Request, res: Response, next: NextFunction) {
    try {
      const result = getDeparturesSchema.safeParse({ query: req.query });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const departures = await frontDeskService.getDepartures(
        result.data.query.propertyId,
        result.data.query.date
      );

      return res.status(200).json({
        data: departures,
        count: departures.length,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getInHouse(req: Request, res: Response, next: NextFunction) {
    try {
      const result = getInHouseSchema.safeParse({ query: req.query });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const inHouse = await frontDeskService.getInHouseGuests(
        result.data.query.propertyId
      );

      return res.status(200).json({
        data: inHouse,
        count: inHouse.length,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getRoomRack(req: Request, res: Response, next: NextFunction) {
    try {
      const result = getRoomRackSchema.safeParse({ query: req.query });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const roomRack = await frontDeskService.getRoomRack(
        result.data.query.propertyId
      );

      return res.status(200).json(roomRack);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async walkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = walkInSchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const booking = await frontDeskService.createWalkIn(
        result.data.body.propertyId,
        result.data.body,
        req.user!.id
      );

      return res.status(201).json({
        message: "Walk-in booking created and checked in",
        data: booking,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async roomMove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = roomMoveSchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const booking = await frontDeskService.moveRoom(
        result.data.body.bookingId,
        result.data.body.newRoomId,
        req.user!.id,
        result.data.body.reason
      );

      return res.status(200).json({
        message: "Guest moved to new room successfully",
        data: booking,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async extendStay(req: Request, res: Response, next: NextFunction) {
    try {
      const result = extendStaySchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const booking = await frontDeskService.extendStay(
        result.data.body.bookingId,
        result.data.body.newCheckOut,
        req.user!.id
      );

      return res.status(200).json({
        message: "Stay extended successfully",
        data: booking,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async earlyCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const result = earlyCheckoutSchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const booking = await frontDeskService.earlyCheckout(
        result.data.body.bookingId,
        req.user!.id
      );

      return res.status(200).json({
        message: "Early checkout processed successfully",
        data: booking,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export const frontDeskController = new FrontDeskController();
