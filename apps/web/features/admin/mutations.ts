import { mutationOptions } from '@tanstack/react-query';
import { clientFetch } from '@/lib/api/client';
import type { Property, Promotion, Role } from '@/types';

export const promotionMutations = {
  validate: () =>
    mutationOptions({
      mutationFn: (code: string) =>
        clientFetch('/v1/promotions/validate', {
          method: 'POST',
          body: JSON.stringify({ code }),
        }),
    }),

  create: () =>
    mutationOptions({
      mutationFn: (body: Record<string, unknown>) =>
        clientFetch<{ data: Promotion }>('/v1/promotions', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
    }),

  update: () =>
    mutationOptions({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
        clientFetch<{ data: Promotion }>(`/v1/promotions/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        }),
    }),
};

export const adminPropertyMutations = {
  create: () =>
    mutationOptions({
      mutationFn: (body: Record<string, unknown>) =>
        clientFetch<{ data: Property }>('/v1/', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
    }),

  update: () =>
    mutationOptions({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
        clientFetch<{ data: Property }>(`/v1/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        }),
    }),
};

export const adminUserMutations = {
  updateRole: () =>
    mutationOptions({
      mutationFn: ({ id, role }: { id: string; role: Role }) =>
        clientFetch(`/admin/users/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ role }),
        }),
    }),
};
