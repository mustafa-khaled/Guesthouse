import { z } from 'zod'

export const ratePlanSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  roomTypeId: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  basePrice: z.number(),
  currency: z.string().optional(),
  minNights: z.number().optional(),
  maxNights: z.number().optional(),
  isActive: z.boolean().optional(),
})

export type RatePlan = z.infer<typeof ratePlanSchema>
