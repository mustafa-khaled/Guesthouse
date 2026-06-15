import { z } from "zod";

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    })
    .optional(),
});

const contactSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

const settingsSchema = z.object({
  timezone: z.string().default("UTC"),
  currency: z.string().length(3).default("USD"),
  checkInTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in HH:mm format")
    .default("15:00"),
  checkOutTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in HH:mm format")
    .default("11:00"),
  cancellationPolicy: z.string().optional(),
  taxRate: z.number().min(0).max(100).default(0),
  serviceFeeRate: z.number().min(0).max(100).default(0),
});

const imageSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const createPropertySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
    description: z.string().max(5000).optional(),
    address: addressSchema.optional(),
    contact: contactSchema.optional(),
    settings: settingsSchema.optional(),
    amenities: z.array(z.string()).default([]),
    images: z.array(imageSchema).default([]),
    starRating: z.number().int().min(1).max(5).optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updatePropertySchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
      .optional(),
    description: z.string().max(5000).optional(),
    address: addressSchema.optional(),
    contact: contactSchema.optional(),
    settings: settingsSchema.partial().optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(imageSchema).optional(),
    starRating: z.number().int().min(1).max(5).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getPropertySchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listPropertiesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    city: z.string().optional(),
    country: z.string().optional(),
    minRating: z.coerce.number().min(1).max(5).optional(),
    amenities: z.string().optional(),
    isActive: z
      .string()
      .transform((val) => val === "true")
      .optional(),
    sortBy: z.enum(["name", "createdAt", "starRating"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type GetPropertyInput = z.infer<typeof getPropertySchema>;
export type ListPropertiesInput = z.infer<typeof listPropertiesSchema>;
