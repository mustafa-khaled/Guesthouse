import { z } from 'zod'
import { RoomStatusEnum } from './enums.js'

export const roomSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  propertyId: z.string(),
  roomTypeId: z.string(),
  roomNumber: z.string(),
  floor: z.number().optional(),
  status: RoomStatusEnum.optional(),
  isOccupied: z.boolean().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
})

export type Room = z.infer<typeof roomSchema>
