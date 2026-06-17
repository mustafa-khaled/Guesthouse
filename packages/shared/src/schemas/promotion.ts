import { z } from 'zod'

export const promotionSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.number(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  maxUses: z.number().optional(),
  usedCount: z.number().optional(),
  isActive: z.boolean().optional(),
})

export type Promotion = z.infer<typeof promotionSchema>
