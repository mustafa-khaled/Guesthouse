import { z } from 'zod'
import { BookingStatusEnum, BookingSourceEnum, PaymentStatusEnum } from './enums.js'

export const bookingSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  confirmationNumber: z.string().optional(),
  propertyId: z.union([z.string(), z.record(z.unknown())]),
  roomTypeId: z.union([z.string(), z.record(z.unknown())]),
  ratePlanId: z.union([z.string(), z.record(z.unknown())]).optional(),
  guestId: z.union([z.string(), z.record(z.unknown())]).optional(),
  checkIn: z.string(),
  checkOut: z.string(),
  adults: z.number(),
  children: z.number().optional(),
  rooms: z.number().optional(),
  status: BookingStatusEnum,
  paymentStatus: PaymentStatusEnum.optional(),
  source: BookingSourceEnum.optional(),
  pricing: z
    .object({
      subtotal: z.number().optional(),
      tax: z.number().optional(),
      serviceFee: z.number().optional(),
      discount: z.number().optional(),
      total: z.number().optional(),
      currency: z.string().optional(),
    })
    .optional(),
  specialRequests: z.string().optional(),
  internalNotes: z.string().optional(),
  assignedRoomId: z.union([z.string(), z.record(z.unknown())]).optional(),
  createdAt: z.string().optional(),
})

export const createBookingSchema = z.object({
  propertyId: z.string(),
  roomTypeId: z.string(),
  ratePlanId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  adults: z.number().min(1).default(1),
  children: z.number().min(0).default(0),
  rooms: z.number().min(1).default(1),
  guest: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
  }),
  specialRequests: z.string().optional(),
  promotionCode: z.string().optional(),
  holdId: z.string().optional(),
})

export type Booking = z.infer<typeof bookingSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
