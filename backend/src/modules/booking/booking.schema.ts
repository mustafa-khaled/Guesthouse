import { z } from "zod";
import { dateStringSchema } from "../../common/utils/dateUtils";
import { BookingStatus, BookingSource } from "../../common/enums/bookingStatus.enum";

const additionalGuestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
});

export const createBookingSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1),
    roomTypeId: z.string().min(1),
    ratePlanId: z.string().min(1),
    checkIn: dateStringSchema,
    checkOut: dateStringSchema,
    adults: z.number().int().min(1).default(1),
    children: z.number().int().min(0).default(0),
    rooms: z.number().int().min(1).default(1),
    guest: z.object({
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      phone: z.string().optional(),
    }),
    additionalGuests: z.array(additionalGuestSchema).default([]),
    specialRequests: z.string().max(1000).optional(),
    source: z.nativeEnum(BookingSource).default(BookingSource.DIRECT),
    promotionCode: z.string().optional(),
    holdId: z.string().optional(),
  }),
});

export const updateBookingSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    additionalGuests: z.array(additionalGuestSchema).optional(),
    specialRequests: z.string().max(1000).optional(),
    internalNotes: z.string().max(2000).optional(),
  }),
});

export const getBookingSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listBookingsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    propertyId: z.string().optional(),
    guestId: z.string().optional(),
    status: z.nativeEnum(BookingStatus).optional(),
    checkInFrom: dateStringSchema.optional(),
    checkInTo: dateStringSchema.optional(),
    confirmationNumber: z.string().optional(),
    sortBy: z.enum(["createdAt", "checkIn", "checkOut"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const cancelBookingSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    reason: z.string().max(500).optional(),
  }),
});

export const checkInSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    roomId: z.string().min(1),
  }),
});

export const checkOutSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const assignRoomSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    roomId: z.string().min(1),
  }),
});

export const modifyDatesSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    checkIn: dateStringSchema.optional(),
    checkOut: dateStringSchema.optional(),
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type GetBookingInput = z.infer<typeof getBookingSchema>;
export type ListBookingsInput = z.infer<typeof listBookingsSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type AssignRoomInput = z.infer<typeof assignRoomSchema>;
export type ModifyDatesInput = z.infer<typeof modifyDatesSchema>;
