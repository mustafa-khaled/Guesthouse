import { z } from "zod";
import { dateStringSchema } from "../../common/utils/dateUtils";

export const getArrivalsSchema = z.object({
  query: z.object({
    propertyId: z.string().min(1),
    date: dateStringSchema.optional(),
  }),
});

export const getDeparturesSchema = z.object({
  query: z.object({
    propertyId: z.string().min(1),
    date: dateStringSchema.optional(),
  }),
});

export const getInHouseSchema = z.object({
  query: z.object({
    propertyId: z.string().min(1),
  }),
});

export const getRoomRackSchema = z.object({
  query: z.object({
    propertyId: z.string().min(1),
  }),
});

export const walkInSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1),
    roomTypeId: z.string().min(1),
    ratePlanId: z.string().min(1),
    nights: z.number().int().min(1),
    guest: z.object({
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phone: z.string().optional(),
    }),
    adults: z.number().int().min(1),
    children: z.number().int().min(0).default(0),
    roomId: z.string().min(1),
  }),
});

export const roomMoveSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1),
    newRoomId: z.string().min(1),
    reason: z.string().max(500).optional(),
  }),
});

export const extendStaySchema = z.object({
  body: z.object({
    bookingId: z.string().min(1),
    newCheckOut: dateStringSchema,
  }),
});

export const earlyCheckoutSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1),
  }),
});

export type GetArrivalsInput = z.infer<typeof getArrivalsSchema>;
export type GetDeparturesInput = z.infer<typeof getDeparturesSchema>;
export type GetInHouseInput = z.infer<typeof getInHouseSchema>;
export type GetRoomRackInput = z.infer<typeof getRoomRackSchema>;
export type WalkInInput = z.infer<typeof walkInSchema>;
export type RoomMoveInput = z.infer<typeof roomMoveSchema>;
export type ExtendStayInput = z.infer<typeof extendStaySchema>;
export type EarlyCheckoutInput = z.infer<typeof earlyCheckoutSchema>;
