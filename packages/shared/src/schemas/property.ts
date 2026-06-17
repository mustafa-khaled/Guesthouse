import { z } from 'zod'

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
})

const imageSchema = z.object({
  url: z.string(),
  caption: z.string().optional(),
  isPrimary: z.boolean().optional(),
})

export const propertySchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  address: addressSchema.optional(),
  contact: z
    .object({
      phone: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
  settings: z
    .object({
      timezone: z.string().optional(),
      currency: z.string().optional(),
      checkInTime: z.string().optional(),
      checkOutTime: z.string().optional(),
      taxRate: z.number().optional(),
      serviceFeeRate: z.number().optional(),
    })
    .optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(imageSchema).optional(),
  starRating: z.number().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
})

export type Property = z.infer<typeof propertySchema>
