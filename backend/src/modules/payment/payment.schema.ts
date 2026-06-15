import { z } from "zod";
import { PaymentMethod } from "../../models/payment.model";

export const createPaymentIntentSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1),
  }),
  body: z.object({
    amount: z.number().positive().optional(),
    isDeposit: z.boolean().default(false),
  }),
});

export const confirmPaymentSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1),
  }),
  body: z.object({
    paymentIntentId: z.string().min(1),
  }),
});

export const recordCashPaymentSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1),
  }),
  body: z.object({
    amount: z.number().positive(),
    notes: z.string().max(500).optional(),
  }),
});

export const processRefundSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1),
  }),
  body: z.object({
    amount: z.number().positive(),
    reason: z.string().max(500).optional(),
  }),
});

export const getFolioSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1),
  }),
});

export const addFolioChargeSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1),
  }),
  body: z.object({
    description: z.string().min(1).max(200),
    amount: z.number(),
    quantity: z.number().int().min(1).default(1),
    category: z.enum(["room", "addon", "fee", "adjustment"]).default("fee"),
  }),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type RecordCashPaymentInput = z.infer<typeof recordCashPaymentSchema>;
export type ProcessRefundInput = z.infer<typeof processRefundSchema>;
export type GetFolioInput = z.infer<typeof getFolioSchema>;
export type AddFolioChargeInput = z.infer<typeof addFolioChargeSchema>;
