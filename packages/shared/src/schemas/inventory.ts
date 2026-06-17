import { z } from 'zod'

export const availabilityResultSchema = z.object({
  propertyId: z.string(),
  roomTypeId: z.string(),
  roomTypeName: z.string().optional(),
  availableRooms: z.number(),
  totalPrice: z.number().optional(),
  pricePerNight: z.number().optional(),
  currency: z.string().optional(),
  ratePlanId: z.string().optional(),
})

export const inventoryHoldSchema = z.object({
  holdId: z.string(),
  expiresAt: z.string(),
})

export type AvailabilityResult = z.infer<typeof availabilityResultSchema>
export type InventoryHold = z.infer<typeof inventoryHoldSchema>
