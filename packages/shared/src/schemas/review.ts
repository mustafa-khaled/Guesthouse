import { z } from 'zod'

export const reviewSchema = z.object({
  review: z.string().min(1, 'Review cannot be empty!'),
  rating: z.number().min(1).max(5),
  tour: z.string(),
  user: z.string(),
})

export const reviewResponseSchema = reviewSchema.extend({
  _id: z.string(),
  createdAt: z.string(),
  user: z.object({
    _id: z.string(),
    name: z.string(),
    photo: z.string(),
  }),
})

export type Review = z.infer<typeof reviewSchema>
export type ReviewResponse = z.infer<typeof reviewResponseSchema>
