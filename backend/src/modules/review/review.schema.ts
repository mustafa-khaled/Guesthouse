import { z } from "zod";
import { ReviewStatus } from "../../models/review.model";

const ratingsSchema = z.object({
  overall: z.number().min(1).max(5),
  cleanliness: z.number().min(1).max(5).optional(),
  comfort: z.number().min(1).max(5).optional(),
  location: z.number().min(1).max(5).optional(),
  service: z.number().min(1).max(5).optional(),
  value: z.number().min(1).max(5).optional(),
});

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1),
    ratings: ratingsSchema,
    title: z.string().max(200).optional(),
    text: z.string().max(2000).optional(),
    pros: z.array(z.string().max(100)).max(5).optional(),
    cons: z.array(z.string().max(100)).max(5).optional(),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    ratings: ratingsSchema.partial().optional(),
    title: z.string().max(200).optional(),
    text: z.string().max(2000).optional(),
    pros: z.array(z.string().max(100)).max(5).optional(),
    cons: z.array(z.string().max(100)).max(5).optional(),
  }),
});

export const getReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listReviewsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    propertyId: z.string().optional(),
    status: z.nativeEnum(ReviewStatus).optional(),
    minRating: z.coerce.number().min(1).max(5).optional(),
    sortBy: z.enum(["createdAt", "ratings.overall", "helpful"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const moderateReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    action: z.enum(["approve", "reject"]),
    reason: z.string().max(500).optional(),
  }),
});

export const respondToReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    text: z.string().min(1).max(1000),
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type GetReviewInput = z.infer<typeof getReviewSchema>;
export type ListReviewsInput = z.infer<typeof listReviewsSchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
export type RespondToReviewInput = z.infer<typeof respondToReviewSchema>;
