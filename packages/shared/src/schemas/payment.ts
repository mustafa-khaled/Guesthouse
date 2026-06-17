import { z } from 'zod'

export const paymentSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  bookingId: z.string(),
  amount: z.number(),
  currency: z.string().optional(),
  method: z.string().optional(),
  status: z.string().optional(),
  stripePaymentIntentId: z.string().optional(),
  createdAt: z.string().optional(),
})

export const folioEntrySchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(['charge', 'payment', 'adjustment', 'refund']).optional(),
  createdAt: z.string().optional(),
})

export const folioSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  bookingId: z.string(),
  entries: z.array(folioEntrySchema).optional(),
  balance: z.number().optional(),
  totalCharges: z.number().optional(),
  totalPayments: z.number().optional(),
})

export type Payment = z.infer<typeof paymentSchema>
export type Folio = z.infer<typeof folioSchema>
