import { mutationOptions } from '@tanstack/react-query';
import { clientFetch } from '@/lib/api/client';

export const reviewMutations = {
  create: () =>
    mutationOptions({
      mutationFn: (data: Record<string, unknown>) =>
        clientFetch('/v1/reviews', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    }),
};
