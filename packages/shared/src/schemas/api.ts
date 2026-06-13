import { z } from 'zod'

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.literal('success'),
    data: z.object({ data: dataSchema }).optional(),
    results: z.number().optional(),
    resultsPerPage: z.number().optional(),
  })

export const apiErrorSchema = z.object({
  status: z.enum(['fail', 'error']),
  message: z.string(),
})

export const authResponseSchema = z.object({
  status: z.literal('success'),
  token: z.string(),
  data: z.object({ user: z.any() }),
})

export type ApiResponse<T> = {
  status: 'success'
  data?: { data: T }
  results?: number
  resultsPerPage?: number
}

export type ApiError = z.infer<typeof apiErrorSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
