import { mutationOptions } from '@tanstack/react-query';
import { clientFetch } from '@/lib/api/client';
import type { SavedPaymentMethod } from '@/types';

export const billingMutations = {
  saveCard: () =>
    mutationOptions({
      mutationFn: (stripePaymentMethodId: string) =>
        clientFetch<{ data: SavedPaymentMethod }>('/v1/user/me/payment-methods', {
          method: 'POST',
          body: JSON.stringify({ stripePaymentMethodId }),
        }),
    }),

  setDefault: () =>
    mutationOptions({
      mutationFn: (id: string) =>
        clientFetch(`/v1/user/me/payment-methods/${id}/default`, {
          method: 'PUT',
        }),
    }),

  remove: () =>
    mutationOptions({
      mutationFn: (id: string) =>
        clientFetch(`/v1/user/me/payment-methods/${id}`, {
          method: 'DELETE',
        }),
    }),
};
