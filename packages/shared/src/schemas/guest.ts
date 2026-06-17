import { z } from 'zod'

export const guestSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  dateOfBirth: z.string().optional(),
  preferences: z.record(z.unknown()).optional(),
  userId: z.string().optional(),
  stats: z
    .object({
      totalStays: z.number().optional(),
      totalSpent: z.number().optional(),
    })
    .optional(),
})

export type Guest = z.infer<typeof guestSchema>
