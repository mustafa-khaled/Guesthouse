import { z } from "zod";
import { dateStringSchema } from "../../common/utils/dateUtils";

export const searchAvailabilitySchema = z.object({
  query: z.object({
    propertyId: z.string().min(1),
    checkIn: dateStringSchema,
    checkOut: dateStringSchema,
    adults: z.coerce.number().int().min(1).default(1),
    children: z.coerce.number().int().min(0).default(0),
    rooms: z.coerce.number().int().min(1).default(1),
    roomTypeId: z.string().optional(),
  }),
});

export const getInventorySchema = z.object({
  params: z.object({
    propertyId: z.string().min(1),
  }),
  query: z.object({
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    roomTypeId: z.string().optional(),
  }),
});

export const bulkUpdateInventorySchema = z.object({
  body: z.object({
    propertyId: z.string().min(1),
    roomTypeId: z.string().min(1),
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    updates: z.object({
      totalRooms: z.number().int().min(0).optional(),
      blockedRooms: z.number().int().min(0).optional(),
      closedToArrival: z.boolean().optional(),
      closedToDeparture: z.boolean().optional(),
      minStay: z.number().int().min(1).optional(),
      maxStay: z.number().int().min(1).optional(),
    }),
  }),
});

export const createHoldSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1),
    roomTypeId: z.string().min(1),
    checkIn: dateStringSchema,
    checkOut: dateStringSchema,
    rooms: z.number().int().min(1).default(1),
    sessionId: z.string().min(1),
  }),
});

export const releaseHoldSchema = z.object({
  params: z.object({
    holdId: z.string().min(1),
  }),
});

export const initializeInventorySchema = z.object({
  body: z.object({
    propertyId: z.string().min(1),
    roomTypeId: z.string().min(1),
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    totalRooms: z.number().int().min(0),
  }),
});

export type SearchAvailabilityInput = z.infer<typeof searchAvailabilitySchema>;
export type GetInventoryInput = z.infer<typeof getInventorySchema>;
export type BulkUpdateInventoryInput = z.infer<typeof bulkUpdateInventorySchema>;
export type CreateHoldInput = z.infer<typeof createHoldSchema>;
export type ReleaseHoldInput = z.infer<typeof releaseHoldSchema>;
export type InitializeInventoryInput = z.infer<typeof initializeInventorySchema>;
