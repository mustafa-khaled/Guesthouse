import { z } from "zod";
import {
  CancellationPolicyType,
  PaymentPolicyType,
} from "../../models/ratePlan.model";

const cancellationPolicySchema = z.object({
  type: z.nativeEnum(CancellationPolicyType).default(CancellationPolicyType.FLEXIBLE),
  deadlineHours: z.number().int().min(0).default(24),
  penaltyPercentage: z.number().min(0).max(100).default(0),
});

const advanceBookingSchema = z.object({
  min: z.number().int().min(0).optional(),
  max: z.number().int().min(0).optional(),
});

export const createRatePlanSchema = z.object({
  params: z.object({
    roomTypeId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200),
    code: z.string().min(1).max(20).toUpperCase(),
    description: z.string().max(2000).optional(),
    basePrice: z.number().positive(),
    inclusions: z.array(z.string()).default([]),
    cancellationPolicy: cancellationPolicySchema.optional(),
    paymentPolicy: z.nativeEnum(PaymentPolicyType).default(PaymentPolicyType.PAY_AT_HOTEL),
    depositPercentage: z.number().min(0).max(100).optional(),
    minNights: z.number().int().min(1).optional(),
    maxNights: z.number().int().min(1).optional(),
    advanceBookingDays: advanceBookingSchema.optional(),
    isActive: z.boolean().default(true),
    validFrom: z.coerce.date().optional(),
    validTo: z.coerce.date().optional(),
  }),
});

export const updateRatePlanSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    code: z.string().min(1).max(20).toUpperCase().optional(),
    description: z.string().max(2000).optional(),
    basePrice: z.number().positive().optional(),
    inclusions: z.array(z.string()).optional(),
    cancellationPolicy: cancellationPolicySchema.optional(),
    paymentPolicy: z.nativeEnum(PaymentPolicyType).optional(),
    depositPercentage: z.number().min(0).max(100).optional(),
    minNights: z.number().int().min(1).optional(),
    maxNights: z.number().int().min(1).optional(),
    advanceBookingDays: advanceBookingSchema.optional(),
    isActive: z.boolean().optional(),
    validFrom: z.coerce.date().optional(),
    validTo: z.coerce.date().optional(),
  }),
});

export const getRatePlanSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listRatePlansSchema = z.object({
  params: z.object({
    roomTypeId: z.string().min(1),
  }),
  query: z.object({
    isActive: z
      .string()
      .transform((val) => val === "true")
      .optional(),
  }),
});

export const createPriceRuleSchema = z.object({
  params: z.object({
    ratePlanId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200),
    dateRange: z.object({
      start: z.coerce.date(),
      end: z.coerce.date(),
    }),
    daysOfWeek: z
      .array(z.number().int().min(0).max(6))
      .optional(),
    priceAdjustment: z.object({
      type: z.enum(["fixed", "percentage", "absolute"]),
      value: z.number(),
    }),
    priority: z.number().int().default(0),
    isActive: z.boolean().default(true),
  }),
});

export const updatePriceRuleSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    dateRange: z
      .object({
        start: z.coerce.date(),
        end: z.coerce.date(),
      })
      .optional(),
    daysOfWeek: z
      .array(z.number().int().min(0).max(6))
      .optional(),
    priceAdjustment: z
      .object({
        type: z.enum(["fixed", "percentage", "absolute"]),
        value: z.number(),
      })
      .optional(),
    priority: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateRatePlanInput = z.infer<typeof createRatePlanSchema>;
export type UpdateRatePlanInput = z.infer<typeof updateRatePlanSchema>;
export type GetRatePlanInput = z.infer<typeof getRatePlanSchema>;
export type ListRatePlansInput = z.infer<typeof listRatePlansSchema>;
export type CreatePriceRuleInput = z.infer<typeof createPriceRuleSchema>;
export type UpdatePriceRuleInput = z.infer<typeof updatePriceRuleSchema>;
