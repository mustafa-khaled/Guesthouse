import { Request, Response, NextFunction } from "express";
import { reviewService } from "./review.service";
import {
  createReviewSchema,
  updateReviewSchema,
  getReviewSchema,
  listReviewsSchema,
  moderateReviewSchema,
  respondToReviewSchema,
} from "./review.schema";
import { HttpError } from "../../common/errors/http.errors";

class ReviewController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = createReviewSchema.safeParse({ body: req.body });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const review = await reviewService.create(result.data.body, req.user!.id);

      return res.status(201).json({
        message: "Review submitted successfully",
        data: review,
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
      const result = getReviewSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const review = await reviewService.findById(result.data.params.id);

      return res.status(200).json({
        data: review,
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
      const result = updateReviewSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const review = await reviewService.update(
        result.data.params.id,
        result.data.body,
        req.user!.id
      );

      return res.status(200).json({
        message: "Review updated successfully",
        data: review,
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
      const result = getReviewSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      await reviewService.delete(result.data.params.id, req.user!.id);

      return res.status(200).json({
        message: "Review deleted successfully",
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async moderate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = moderateReviewSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const review = await reviewService.moderate(
        result.data.params.id,
        result.data.body.action,
        req.user!.id,
        result.data.body.reason
      );

      return res.status(200).json({
        message: `Review ${result.data.body.action}d successfully`,
        data: review,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async respond(req: Request, res: Response, next: NextFunction) {
    try {
      const result = respondToReviewSchema.safeParse({
        params: req.params,
        body: req.body,
      });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const review = await reviewService.respond(
        result.data.params.id,
        result.data.body.text,
        req.user!.id
      );

      return res.status(200).json({
        message: "Response added successfully",
        data: review,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async markHelpful(req: Request, res: Response, next: NextFunction) {
    try {
      const result = getReviewSchema.safeParse({ params: req.params });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const review = await reviewService.markHelpful(result.data.params.id);

      return res.status(200).json({
        message: "Marked as helpful",
        data: review,
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
      const result = listReviewsSchema.safeParse({ query: req.query });
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten(),
        });
      }

      const { page, limit, sortBy, sortOrder, ...filters } = result.data.query;

      const reviews = await reviewService.list(
        filters,
        page,
        limit,
        sortBy,
        sortOrder
      );

      return res.status(200).json(reviews);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getPropertyReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const propertyId = req.params.propertyId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const reviews = await reviewService.getPropertyReviews(propertyId, page, limit);

      return res.status(200).json(reviews);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }

  async getPropertyRatingSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const propertyId = req.params.propertyId;

      const summary = await reviewService.getPropertyRatingSummary(propertyId);

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

  async getMyReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await reviewService.getMyReviews(req.user!.id);

      return res.status(200).json({
        data: reviews,
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
