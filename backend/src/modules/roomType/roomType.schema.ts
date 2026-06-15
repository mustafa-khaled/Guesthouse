import { z } from "zod";

const occupancySchema = z.object({
  adults: z.number().int().min(1),
  children: z.number().int().min(0).default(0),
  total: z.number().int().min(1),
});

const sizeSchema = z.object({
  value: z.number().positive(),
  unit: z.enum(["sqm", "sqft"]).default("sqm"),
});

const imageSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional(),
});

export const createRoomTypeSchema = z.object({
  params: z.object({
    propertyId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200),
    code: z.string().min(1).max(20).toUpperCase(),
    description: z.string().max(2000).optional(),
    amenities: z.array(z.string()).default([]),
    maxOccupancy: occupancySchema,
    bedConfiguration: z.string().max(100).optional(),
    size: sizeSchema.optional(),
    images: z.array(imageSchema).default([]),
    basePrice: z.number().positive(),
    isActive: z.boolean().default(true),
  }),
});

export const updateRoomTypeSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    code: z.string().min(1).max(20).toUpperCase().optional(),
    description: z.string().max(2000).optional(),
    amenities: z.array(z.string()).optional(),
    maxOccupancy: occupancySchema.optional(),
    bedConfiguration: z.string().max(100).optional(),
    size: sizeSchema.optional(),
    images: z.array(imageSchema).optional(),
    basePrice: z.number().positive().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getRoomTypeSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listRoomTypesSchema = z.object({
  params: z.object({
    propertyId: z.string().min(1),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    isActive: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    minOccupancy: z.coerce.number().int().min(1).optional(),
  }),
});

export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;
export type GetRoomTypeInput = z.infer<typeof getRoomTypeSchema>;
export type ListRoomTypesInput = z.infer<typeof listRoomTypesSchema>;
