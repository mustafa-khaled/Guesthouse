import { Request, Response, NextFunction } from "express";
import { reportsService } from "./reports.service";
import { HttpError } from "../../common/errors/http.errors";
import { z } from "zod";
import { dateStringSchema } from "../../common/utils/dateUtils";

const reportQuerySchema = z.object({
  propertyId: z.string().min(1),
  startDate: dateStringSchema,
  endDate: dateStringSchema,
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});

const dailySummarySchema = z.object({
  propertyId: z.string().min(1),
  date: dateStringSchema.optional(),
});

class ReportsController {
  async getOccupancy(req: Request, res: Response, next: NextFunction) {
    try {
      const result = reportQuerySchema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const report = await reportsService.getOccupancyReport(
        result.data.propertyId,
        result.data.startDate,
        result.data.endDate,
        result.data.groupBy
      );

      return res.status(200).json({
        data: report,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const result = reportQuerySchema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const report = await reportsService.getRevenueReport(
        result.data.propertyId,
        result.data.startDate,
        result.data.endDate,
        result.data.groupBy
      );

      return res.status(200).json({
        data: report,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getRoomTypePerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = reportQuerySchema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const report = await reportsService.getRoomTypePerformance(
        result.data.propertyId,
        result.data.startDate,
        result.data.endDate
      );

      return res.status(200).json({
        data: report,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getSourceAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const result = reportQuerySchema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const report = await reportsService.getSourceAnalysis(
        result.data.propertyId,
        result.data.startDate,
        result.data.endDate
      );

      return res.status(200).json({
        data: report,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getCancellationAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const result = reportQuerySchema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const report = await reportsService.getCancellationAnalysis(
        result.data.propertyId,
        result.data.startDate,
        result.data.endDate
      );

      return res.status(200).json({
        data: report,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getDailySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = dailySummarySchema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const summary = await reportsService.getDailySummary(
        result.data.propertyId,
        result.data.date
      );

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

export const reportsController = new ReportsController();
