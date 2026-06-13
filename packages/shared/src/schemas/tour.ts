import { z } from 'zod'

export const geoLocationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
  address: z.string(),
  description: z.string(),
})

export const tourLocationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
  address: z.string().optional(),
  description: z.string().optional(),
  day: z.number(),
})

export const tourSchema = z.object({
  name: z.string().min(10).max(40),
  duration: z.number().positive(),
  maxGroupSize: z.number().positive(),
  difficulty: z.enum(['easy', 'medium', 'difficult']),
  ratingsAverage: z.number().min(1).max(5).default(4.5),
  ratingsQuantity: z.number().min(0).default(0),
  price: z.number().positive(),
  priceDiscount: z.number().optional(),
  summary: z.string().min(1),
  description: z.string().optional(),
  imageCover: z.string().min(1),
  images: z.array(z.string()).default([]),
  startDates: z.array(z.string()).default([]),
  secretTour: z.boolean().default(false),
  startLocation: geoLocationSchema,
  locations: z.array(tourLocationSchema).default([]),
  guides: z.array(z.string()).default([]),
})

const guideRef = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  photo: z.string(),
  role: z.enum(['user', 'guide', 'lead-guide', 'admin']),
})

export const tourResponseSchema = tourSchema.extend({
  _id: z.string(),
  slug: z.string(),
  createdAt: z.string(),
  guides: z.array(guideRef),
  reviews: z.array(z.any()).optional(),
})

export const tourQuerySchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
  sort: z.string().optional(),
  fields: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'difficult']).optional(),
  price: z.object({ gte: z.coerce.number(), lte: z.coerce.number() }).optional(),
  ratingsAverage: z.object({ gte: z.coerce.number() }).optional(),
  duration: z.object({ gte: z.coerce.number(), lte: z.coerce.number() }).optional(),
})

export type Tour = z.infer<typeof tourSchema>
export type TourResponse = z.infer<typeof tourResponseSchema>
export type GeoLocation = z.infer<typeof geoLocationSchema>
export type TourLocation = z.infer<typeof tourLocationSchema>
export type TourQuery = z.infer<typeof tourQuerySchema>
