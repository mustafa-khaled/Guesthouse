import { z } from "zod";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export function getPaginationParams(
  page: number = 1,
  limit: number = 20
): PaginationParams {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(100, Math.max(1, limit));
  const skip = (validPage - 1) * validLimit;

  return {
    page: validPage,
    limit: validLimit,
    skip,
  };
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / params.limit);

  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPrevPage: params.page > 1,
    },
  };
}

export interface SortParams {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const sortSchema = z.object({
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export function getSortParams(
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): Record<string, 1 | -1> {
  return { [sortBy]: sortOrder === "asc" ? 1 : -1 };
}
