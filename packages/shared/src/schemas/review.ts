import { z } from 'zod'

export const reviewSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  propertyId: z.union([z.string(), z.record(z.unknown())]),
  userId: z.union([z.string(), z.record(z.unknown())]).optional(),
  bookingId: z.string().optional(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  response: z.string().optional(),
  helpfulCount: z.number().optional(),
  createdAt: z.string().optional(),
})

export type Review = z.infer<typeof reviewSchema>
