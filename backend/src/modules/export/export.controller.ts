import { Request, Response, NextFunction } from "express";
import { Booking } from "../../models/booking.model";
import { Guest } from "../../models/guest.model";
import { Payment } from "../../models/payment.model";
import { BadRequestError } from "../../common/errors/http.errors";
import {
  sendCSVResponse,
  bookingExportFields,
  guestExportFields,
  paymentExportFields,
} from "../../lib/export";

class ExportController {
  async exportBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId, startDate, endDate, status } = req.query;

      if (!propertyId) {
        throw new BadRequestError("propertyId is required");
      }

      const query: any = {
        propertyId,
        isDeleted: { $ne: true },
      };

      if (startDate || endDate) {
        query["dates.checkIn"] = {};
        if (startDate) {
          query["dates.checkIn"].$gte = new Date(startDate as string);
        }
        if (endDate) {
          query["dates.checkIn"].$lte = new Date(endDate as string);
        }
      }

      if (status) {
        query.status = status;
      }

      const bookings = await Booking.find(query)
        .populate("guestId", "firstName lastName email phone")
        .populate("propertyId", "name slug")
        .populate("roomTypeId", "name code")
        .sort({ "dates.checkIn": -1 })
        .limit(10000)
        .lean();

      const filename = `bookings_export_${propertyId}`;

      sendCSVResponse(res, bookings, {
        filename,
        fields: bookingExportFields,
      });
    } catch (error) {
      next(error);
    }
  }

  async exportGuests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { minStays, minSpend, tags, marketingConsent } = req.query;

      const query: any = {
        isDeleted: { $ne: true },
      };

      if (minStays) {
        query.stayCount = { $gte: parseInt(minStays as string, 10) };
      }

      if (minSpend) {
        query.totalSpend = { $gte: parseFloat(minSpend as string) };
      }

      if (tags) {
        const tagArray = (tags as string).split(",").map((t) => t.trim());
        query.tags = { $in: tagArray };
      }

      if (marketingConsent === "true") {
        query.marketingConsent = true;
      }

      const guests = await Guest.find(query)
        .sort({ lastName: 1, firstName: 1 })
        .limit(10000)
        .lean();

      sendCSVResponse(res, guests, {
        filename: "guests_export",
        fields: guestExportFields,
      });
    } catch (error) {
      next(error);
    }
  }

  async exportPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId, startDate, endDate, status, method } = req.query;

      const query: any = {};

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate as string);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate as string);
        }
      }

      if (status) {
        query.status = status;
      }

      if (method) {
        query.method = method;
      }

      let payments = await Payment.find(query)
        .populate({
          path: "bookingId",
          select: "confirmationNumber propertyId",
          populate: { path: "propertyId", select: "name" },
        })
        .populate("guestId", "firstName lastName email")
        .sort({ createdAt: -1 })
        .limit(10000)
        .lean();

      if (propertyId) {
        payments = payments.filter((p: any) => 
          p.bookingId?.propertyId?._id?.toString() === propertyId ||
          p.bookingId?.propertyId?.toString() === propertyId
        );
      }

      sendCSVResponse(res, payments, {
        filename: "payments_export",
        fields: paymentExportFields,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const exportController = new ExportController();
