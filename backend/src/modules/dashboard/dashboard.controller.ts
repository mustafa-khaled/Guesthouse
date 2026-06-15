import { Request, Response, NextFunction } from "express";
import { dashboardService } from "./dashboard.service";
import { HttpError } from "../../common/errors/http.errors";
import { z } from "zod";

const propertyDashboardSchema = z.object({
  propertyId: z.string().min(1),
});

const managerDashboardSchema = z.object({
  propertyId: z.string().optional(),
});

class DashboardController {
  async getPropertyDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const result = propertyDashboardSchema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const dashboard = await dashboardService.getPropertyDashboard(
        result.data.propertyId
      );

      return res.status(200).json({
        data: dashboard,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getManagerDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const result = managerDashboardSchema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const dashboard = await dashboardService.getManagerDashboard(
        result.data.propertyId
      );

      return res.status(200).json({
        data: dashboard,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
