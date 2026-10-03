import { queryOptions } from '@tanstack/react-query';
import { clientFetch } from '@/lib/api/client';
import type { PaymentMethodsResponse } from '@/types';

export const billingQueries = {
  paymentMethods: () =>
    queryOptions({
      queryKey: ['billing', 'payment-methods'] as const,
      queryFn: () => clientFetch<{ data: PaymentMethodsResponse }>('/v1/user/me/payment-methods'),
      select: (res) => res.data,
    }),

  setupIntent: () =>
    queryOptions({
      queryKey: ['billing', 'setup-intent'] as const,
      queryFn: () =>
        clientFetch<{ data: { clientSecret: string } }>(
          '/v1/user/me/payment-methods/setup-intent',
          {
            method: 'POST',
          },
        ),
      select: (res) => res.data,
      staleTime: Infinity,
    }),
};
