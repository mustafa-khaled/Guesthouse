import { Request, Response, NextFunction } from "express";
import { searchService } from "./search.service";
import { BadRequestError } from "../../common/errors/http.errors";

class SearchController {
  async unifiedSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, types, limit, skip, propertyId } = req.query;

      if (!q || typeof q !== "string" || q.trim().length < 2) {
        throw new BadRequestError("Search query must be at least 2 characters");
      }

      const typeArray = types
        ? (types as string).split(",").map((t) => t.trim())
        : undefined;

      const results = await searchService.unifiedSearch(q, {
        types: typeArray,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        skip: skip ? parseInt(skip as string, 10) : undefined,
        propertyId: propertyId as string | undefined,
      });

      res.json({
        message: "Search completed",
        query: q,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async quickSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, limit } = req.query;

      if (!q || typeof q !== "string" || q.trim().length < 2) {
        throw new BadRequestError("Search query must be at least 2 characters");
      }

      const results = await searchService.quickSearch(
        q,
        limit ? parseInt(limit as string, 10) : undefined
      );

      res.json({
        message: "Quick search completed",
        query: q,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchGuests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, limit, skip } = req.query;

      if (!q || typeof q !== "string" || q.trim().length < 2) {
        throw new BadRequestError("Search query must be at least 2 characters");
      }

      const results = await searchService.searchGuests(q, {
        limit: limit ? parseInt(limit as string, 10) : undefined,
        skip: skip ? parseInt(skip as string, 10) : undefined,
      });

      res.json({
        message: "Guest search completed",
        query: q,
        data: results.items,
        pagination: {
          total: results.total,
          limit: limit ? parseInt(limit as string, 10) : 20,
          skip: skip ? parseInt(skip as string, 10) : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async searchBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, limit, skip, propertyId } = req.query;

      if (!q || typeof q !== "string" || q.trim().length < 2) {
        throw new BadRequestError("Search query must be at least 2 characters");
      }

      const results = await searchService.searchBookings(q, {
        limit: limit ? parseInt(limit as string, 10) : undefined,
        skip: skip ? parseInt(skip as string, 10) : undefined,
        propertyId: propertyId as string | undefined,
      });

      res.json({
        message: "Booking search completed",
        query: q,
        data: results.items,
        pagination: {
          total: results.total,
          limit: limit ? parseInt(limit as string, 10) : 20,
          skip: skip ? parseInt(skip as string, 10) : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async searchProperties(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, limit, skip } = req.query;

      if (!q || typeof q !== "string" || q.trim().length < 2) {
        throw new BadRequestError("Search query must be at least 2 characters");
      }

      const results = await searchService.searchProperties(q, {
        limit: limit ? parseInt(limit as string, 10) : undefined,
        skip: skip ? parseInt(skip as string, 10) : undefined,
      });

      res.json({
        message: "Property search completed",
        query: q,
        data: results.items,
        pagination: {
          total: results.total,
          limit: limit ? parseInt(limit as string, 10) : 20,
          skip: skip ? parseInt(skip as string, 10) : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async searchRoomTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, limit, skip, propertyId } = req.query;

      if (!q || typeof q !== "string" || q.trim().length < 2) {
        throw new BadRequestError("Search query must be at least 2 characters");
      }

      const results = await searchService.searchRoomTypes(q, {
        limit: limit ? parseInt(limit as string, 10) : undefined,
        skip: skip ? parseInt(skip as string, 10) : undefined,
        propertyId: propertyId as string | undefined,
      });

      res.json({
        message: "Room type search completed",
        query: q,
        data: results.items,
        pagination: {
          total: results.total,
          limit: limit ? parseInt(limit as string, 10) : 20,
          skip: skip ? parseInt(skip as string, 10) : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
