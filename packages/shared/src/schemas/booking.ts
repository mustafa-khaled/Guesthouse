import { z } from 'zod'

export const bookingSchema = z.object({
  tour: z.string(),
  user: z.string(),
  price: z.number().positive(),
  paid: z.boolean().default(true),
})

export const bookingResponseSchema = bookingSchema.extend({
  _id: z.string(),
  createdAt: z.string(),
  // Populated tour and user objects from API
  tour: z.any(),
  user: z.any(),
})

export type Booking = z.infer<typeof bookingSchema>
export type BookingResponse = z.infer<typeof bookingResponseSchema>
