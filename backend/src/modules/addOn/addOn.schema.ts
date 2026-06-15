import { z } from "zod";
import { AddOnPricingType, AddOnCategory } from "../../models/addOn.model";

const pricingSchema = z.object({
  type: z.nativeEnum(AddOnPricingType),
  amount: z.number().min(0),
});

const availabilitySchema = z.object({
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  requiresAdvanceBooking: z.boolean().default(false),
  advanceBookingHours: z.number().min(0).optional(),
});

export const createAddOnSchema = z.object({
  params: z.object({
    propertyId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200),
    code: z.string().min(1).max(20).toUpperCase(),
    description: z.string().max(1000).optional(),
    category: z.nativeEnum(AddOnCategory).default(AddOnCategory.OTHER),
    pricing: pricingSchema,
    availability: availabilitySchema.optional(),
    maxQuantity: z.number().int().min(1).optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateAddOnSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    code: z.string().min(1).max(20).toUpperCase().optional(),
    description: z.string().max(1000).optional(),
    category: z.nativeEnum(AddOnCategory).optional(),
    pricing: pricingSchema.optional(),
    availability: availabilitySchema.optional(),
    maxQuantity: z.number().int().min(1).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getAddOnSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listAddOnsSchema = z.object({
  params: z.object({
    propertyId: z.string().min(1),
  }),
  query: z.object({
    category: z.nativeEnum(AddOnCategory).optional(),
    isActive: z
      .string()
      .transform((val) => val === "true")
      .optional(),
  }),
});

export const addToBookingSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1),
  }),
  body: z.object({
    addOnId: z.string().min(1),
    quantity: z.number().int().min(1).default(1),
    scheduledDate: z.coerce.date().optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const removeFromBookingSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1),
    addOnId: z.string().min(1),
  }),
});

export type CreateAddOnInput = z.infer<typeof createAddOnSchema>;
export type UpdateAddOnInput = z.infer<typeof updateAddOnSchema>;
export type GetAddOnInput = z.infer<typeof getAddOnSchema>;
export type ListAddOnsInput = z.infer<typeof listAddOnsSchema>;
export type AddToBookingInput = z.infer<typeof addToBookingSchema>;
export type RemoveFromBookingInput = z.infer<typeof removeFromBookingSchema>;
