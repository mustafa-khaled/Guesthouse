import { z } from 'zod'

export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
})

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: paginationMetaSchema,
  })

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    message: z.string().optional(),
    data: dataSchema,
  })

export const messageResponseSchema = z.object({
  message: z.string(),
})

export const authResponseSchema = z.object({
  message: z.string(),
  accessToken: z.string().optional(),
  user: z.any().optional(),
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

export interface ApiResponse<T> {
  message?: string
  data: T
}
