import { z } from 'zod'

export const addOnSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  propertyId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type AddOn = z.infer<typeof addOnSchema>
