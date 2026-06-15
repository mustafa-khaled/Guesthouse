import { z } from "zod";

const idDocumentSchema = z.object({
  type: z.enum(["passport", "national_id", "drivers_license", "other"]),
  number: z.string().min(1),
  expiryDate: z.coerce.date().optional(),
  country: z.string().optional(),
});

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

const preferencesSchema = z.object({
  roomPreferences: z.array(z.string()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  specialRequests: z.string().optional(),
});

export const createGuestSchema = z.object({
  body: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    dateOfBirth: z.coerce.date().optional(),
    nationality: z.string().optional(),
    idDocument: idDocumentSchema.optional(),
    address: addressSchema.optional(),
    preferences: preferencesSchema.optional(),
    tags: z.array(z.string()).default([]),
    notes: z.string().max(2000).optional(),
    marketingConsent: z.boolean().default(false),
  }),
});

export const updateGuestSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    dateOfBirth: z.coerce.date().optional(),
    nationality: z.string().optional(),
    idDocument: idDocumentSchema.optional(),
    address: addressSchema.optional(),
    preferences: preferencesSchema.optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().max(2000).optional(),
    marketingConsent: z.boolean().optional(),
  }),
});

export const getGuestSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listGuestsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    tag: z.string().optional(),
    sortBy: z.enum(["lastName", "createdAt", "lastStayDate", "stayCount"]).default("lastName"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),
});

export const linkUserSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    userId: z.string().min(1),
  }),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type GetGuestInput = z.infer<typeof getGuestSchema>;
export type ListGuestsInput = z.infer<typeof listGuestsSchema>;
export type LinkUserInput = z.infer<typeof linkUserSchema>;
