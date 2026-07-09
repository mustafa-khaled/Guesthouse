import { mutationOptions } from '@tanstack/react-query';
import { clientFetch } from '@/lib/api/client';

export const staffPaymentMutations = {
  recordCash: () =>
    mutationOptions({
      mutationFn: ({
        bookingId,
        amount,
        notes,
      }: {
        bookingId: string;
        amount: number;
        notes?: string;
      }) =>
        clientFetch(`/v1/bookings/${bookingId}/payments/cash`, {
          method: 'POST',
          body: JSON.stringify({ amount, notes }),
        }),
    }),

  refund: () =>
    mutationOptions({
      mutationFn: ({
        bookingId,
        amount,
        reason,
      }: {
        bookingId: string;
        amount: number;
        reason?: string;
      }) =>
        clientFetch(`/v1/bookings/${bookingId}/refund`, {
          method: 'POST',
          body: JSON.stringify({ amount, reason }),
        }),
    }),

  addFolioCharge: () =>
    mutationOptions({
      mutationFn: ({
        bookingId,
        description,
        amount,
        quantity = 1,
        category = 'misc',
      }: {
        bookingId: string;
        description: string;
        amount: number;
        quantity?: number;
        category?: string;
      }) =>
        clientFetch(`/v1/bookings/${bookingId}/folio/charge`, {
          method: 'POST',
          body: JSON.stringify({ description, amount, quantity, category }),
        }),
    }),
};
