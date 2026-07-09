import { mutationOptions } from '@tanstack/react-query';
import { clientFetch } from '@/lib/api/client';

export const promotionMutations = {
  validate: () =>
    mutationOptions({
      mutationFn: (code: string) =>
        clientFetch('/v1/promotions/validate', {
          method: 'POST',
          body: JSON.stringify({ code }),
        }),
    }),
};
