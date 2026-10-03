import { mutationOptions } from '@tanstack/react-query';
import { clientFetch } from '@/lib/api/client';

export const housekeepingMutations = {
  updateStatus: () =>
    mutationOptions({
      mutationFn: ({ id, status }: { id: string; status: string }) =>
        clientFetch(`/v1/housekeeping/tasks/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }),
    }),

  complete: () =>
    mutationOptions({
      mutationFn: (id: string) =>
        clientFetch(`/v1/housekeeping/tasks/${id}/complete`, {
          method: 'POST',
        }),
    }),
};
