import { z } from 'zod'

export const roomTypeSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  propertyId: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string(),
        caption: z.string().optional(),
        isPrimary: z.boolean().optional(),
      }),
    )
    .optional(),
  occupancy: z
    .object({
      baseAdults: z.number().optional(),
      maxAdults: z.number().optional(),
      baseChildren: z.number().optional(),
      maxChildren: z.number().optional(),
      maxOccupancy: z.number().optional(),
    })
    .optional(),
  basePrice: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

export type RoomType = z.infer<typeof roomTypeSchema>
