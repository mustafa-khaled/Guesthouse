import { Request, Response, NextFunction } from "express";
import { housekeepingService } from "./housekeeping.service";
import {
  createTaskSchema,
  updateTaskStatusSchema,
  completeTaskSchema,
  verifyTaskSchema,
  getTaskSchema,
  listTasksSchema,
  assignTaskSchema,
  reportIssueSchema,
} from "./housekeeping.schema";
import { HttpError } from "../../common/errors/http.errors";

class HousekeepingController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createTaskSchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const task = await housekeepingService.create(result.data.body);

      return res.status(201).json({
        message: "Task created successfully",
        data: task,
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
      const result = getTaskSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const task = await housekeepingService.findById(result.data.params.id);

      return res.status(200).json({
        data: task,
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
      const result = updateTaskStatusSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const task = await housekeepingService.updateStatus(
        result.data.params.id,
        result.data.body.status,
        result.data.body.notes
      );

      return res.status(200).json({
        message: "Task status updated",
        data: task,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = completeTaskSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const task = await housekeepingService.complete(
        result.data.params.id,
        req.user!.id,
        result.data.body.notes,
        result.data.body.issues
      );

      return res.status(200).json({
        message: "Task completed successfully",
        data: task,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const result = verifyTaskSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const task = await housekeepingService.verify(
        result.data.params.id,
        req.user!.id,
        result.data.body.notes
      );

      return res.status(200).json({
        message: "Task verified successfully",
        data: task,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const result = assignTaskSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const task = await housekeepingService.assign(
        result.data.params.id,
        result.data.body.assignedTo
      );

      return res.status(200).json({
        message: "Task assigned successfully",
        data: task,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async reportIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const result = reportIssueSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const task = await housekeepingService.reportIssue(
        result.data.params.id,
        result.data.body.description,
        result.data.body.severity
      );

      return res.status(200).json({
        message: "Issue reported successfully",
        data: task,
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
      const result = listTasksSchema.safeParse({ query: req.query });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const { page, limit, ...filters } = result.data.query;

      const tasks = await housekeepingService.list(filters, page, limit);

      return res.status(200).json(tasks);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const propertyId = req.query.propertyId as string;
      if (!propertyId) {
        return res.status(400).json({ message: "Property ID is required" });
      }

      const dashboard = await housekeepingService.getDashboard(propertyId);

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

export const housekeepingController = new HousekeepingController();
