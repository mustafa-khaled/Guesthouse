import { z } from "zod";
import { DiscountType } from "../../models/promotion.model";
import { dateStringSchema } from "../../common/utils/dateUtils";

const conditionsSchema = z.object({
  validFrom: z.coerce.date(),
  validTo: z.coerce.date(),
  minNights: z.number().int().min(1).optional(),
  minSpend: z.number().min(0).optional(),
  applicableRoomTypes: z.array(z.string()).optional(),
  applicableRatePlans: z.array(z.string()).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  blackoutDates: z.array(z.coerce.date()).optional(),
});

const limitsSchema = z.object({
  maxUses: z.number().int().min(1).optional(),
  maxUsesPerGuest: z.number().int().min(1).optional(),
});

export const createPromotionSchema = z.object({
  body: z.object({
    propertyId: z.string().optional(),
    code: z.string().min(1).max(30).toUpperCase(),
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    discountType: z.nativeEnum(DiscountType),
    discountValue: z.number().min(0),
    conditions: conditionsSchema,
    limits: limitsSchema.optional(),
    stackable: z.boolean().default(false),
    isActive: z.boolean().default(true),
  }),
});

export const updatePromotionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    discountType: z.nativeEnum(DiscountType).optional(),
    discountValue: z.number().min(0).optional(),
    conditions: conditionsSchema.partial().optional(),
    limits: limitsSchema.optional(),
    stackable: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getPromotionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listPromotionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    propertyId: z.string().optional(),
    isActive: z
      .string()
      .transform((val) => val === "true")
      .optional(),
  }),
});

export const validatePromotionSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    propertyId: z.string().min(1),
    roomTypeId: z.string().min(1),
    ratePlanId: z.string().min(1),
    checkIn: dateStringSchema,
    checkOut: dateStringSchema,
    roomTotal: z.number().min(0),
  }),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
export type GetPromotionInput = z.infer<typeof getPromotionSchema>;
export type ListPromotionsInput = z.infer<typeof listPromotionsSchema>;
export type ValidatePromotionInput = z.infer<typeof validatePromotionSchema>;
