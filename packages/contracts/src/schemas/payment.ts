import { z } from 'zod';

export const paymentSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  bookingId: z.string(),
  amount: z.number(),
  currency: z.string().optional(),
  method: z.string().optional(),
  status: z.string().optional(),
  stripePaymentIntentId: z.string().optional(),
  createdAt: z.string().optional(),
});

export const folioEntrySchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(['charge', 'payment', 'adjustment', 'refund']).optional(),
  createdAt: z.string().optional(),
});

export const folioLineItemSchema = z.object({
  date: z.string().optional(),
  description: z.string(),
  category: z.string().optional(),
  amount: z.number(),
  quantity: z.number().optional(),
  total: z.number().optional(),
  reference: z.string().optional(),
});

export const folioSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  bookingId: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  folioNumber: z.string().optional(),
  entries: z.array(folioEntrySchema).optional(),
  lineItems: z.array(folioLineItemSchema).optional(),
  balance: z.number().optional(),
  amountPaid: z.number().optional(),
  grandTotal: z.number().optional(),
  totalCharges: z.number().optional(),
  totalPayments: z.number().optional(),
});

export const savedPaymentMethodSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  brand: z.string(),
  last4: z.string(),
  expMonth: z.number(),
  expYear: z.number(),
  isDefault: z.boolean().optional(),
});

export const paymentMethodsResponseSchema = z.object({
  paymentMethods: z.array(savedPaymentMethodSchema),
  canAddPaymentMethod: z.boolean(),
  defaultCardId: z.string().nullable(),
});

export type Payment = z.infer<typeof paymentSchema>;
export type Folio = z.infer<typeof folioSchema>;
export type SavedPaymentMethod = z.infer<typeof savedPaymentMethodSchema>;
export type PaymentMethodsResponse = z.infer<typeof paymentMethodsResponseSchema>;
