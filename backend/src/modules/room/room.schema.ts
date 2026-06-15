import { z } from "zod";
import { RoomStatus } from "../../common/enums/roomStatus.enum";

export const createRoomSchema = z.object({
  params: z.object({
    propertyId: z.string().min(1),
  }),
  body: z.object({
    roomTypeId: z.string().min(1),
    roomNumber: z.string().min(1).max(20),
    floor: z.number().int().optional(),
    status: z.nativeEnum(RoomStatus).default(RoomStatus.CLEAN),
    features: z.array(z.string()).default([]),
    notes: z.string().max(1000).optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateRoomSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    roomTypeId: z.string().min(1).optional(),
    roomNumber: z.string().min(1).max(20).optional(),
    floor: z.number().int().optional(),
    features: z.array(z.string()).optional(),
    notes: z.string().max(1000).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateRoomStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.nativeEnum(RoomStatus),
    notes: z.string().max(500).optional(),
  }),
});

export const getRoomSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listRoomsSchema = z.object({
  params: z.object({
    propertyId: z.string().min(1),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    roomTypeId: z.string().optional(),
    status: z.nativeEnum(RoomStatus).optional(),
    floor: z.coerce.number().int().optional(),
    isOccupied: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    isActive: z
      .string()
      .transform((val) => val === "true")
      .optional(),
  }),
});

export const bulkCreateRoomsSchema = z.object({
  params: z.object({
    propertyId: z.string().min(1),
  }),
  body: z.object({
    roomTypeId: z.string().min(1),
    floors: z.array(
      z.object({
        floor: z.number().int(),
        roomNumbers: z.array(z.string().min(1)),
      })
    ),
    features: z.array(z.string()).default([]),
  }),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type UpdateRoomStatusInput = z.infer<typeof updateRoomStatusSchema>;
export type GetRoomInput = z.infer<typeof getRoomSchema>;
export type ListRoomsInput = z.infer<typeof listRoomsSchema>;
export type BulkCreateRoomsInput = z.infer<typeof bulkCreateRoomsSchema>;
