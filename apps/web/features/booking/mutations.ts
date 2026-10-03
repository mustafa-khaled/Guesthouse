import { mutationOptions } from '@tanstack/react-query';
import { clientFetch } from '@/lib/api/client';
import type { CreateBookingInput, Booking } from '@/types';

export const bookingMutations = {
  create: () =>
    mutationOptions({
      mutationFn: (data: CreateBookingInput) =>
        clientFetch<{ data: Booking }>('/v1/bookings', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    }),

  cancel: () =>
    mutationOptions({
      mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
        clientFetch(`/v1/bookings/${id}/cancel`, {
          method: 'POST',
          body: JSON.stringify({ reason }),
        }),
    }),

  confirm: () =>
    mutationOptions({
      mutationFn: (id: string) => clientFetch(`/v1/bookings/${id}/confirm`, { method: 'POST' }),
    }),

  checkIn: () =>
    mutationOptions({
      mutationFn: ({ id, roomId }: { id: string; roomId: string }) =>
        clientFetch(`/v1/bookings/${id}/check-in`, {
          method: 'POST',
          body: JSON.stringify({ roomId }),
        }),
    }),

  checkOut: () =>
    mutationOptions({
      mutationFn: (id: string) => clientFetch(`/v1/bookings/${id}/check-out`, { method: 'POST' }),
    }),

  assignRoom: () =>
    mutationOptions({
      mutationFn: ({ id, roomId }: { id: string; roomId: string }) =>
        clientFetch(`/v1/bookings/${id}/assign-room`, {
          method: 'POST',
          body: JSON.stringify({ roomId }),
        }),
    }),
};

export const inventoryMutations = {
  hold: () =>
    mutationOptions({
      mutationFn: (data: Record<string, unknown>) =>
        clientFetch<{ data: { holdId: string; expiresAt: string } }>('/v1/inventory/hold', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    }),

  releaseHold: () =>
    mutationOptions({
      mutationFn: (holdId: string) =>
        clientFetch(`/v1/inventory/hold/${holdId}`, { method: 'DELETE' }),
    }),
};

export const paymentMutations = {
  createIntent: () =>
    mutationOptions({
      mutationFn: ({
        bookingId,
        isDeposit,
        saveCard,
      }: {
        bookingId: string;
        isDeposit?: boolean;
        saveCard?: boolean;
      }) =>
        clientFetch<{
          data: { clientSecret: string; paymentIntentId: string; amount: number };
        }>(`/v1/bookings/${bookingId}/payments/intent`, {
          method: 'POST',
          body: JSON.stringify({ isDeposit, saveCard }),
        }),
    }),

  chargeSaved: () =>
    mutationOptions({
      mutationFn: ({
        bookingId,
        paymentMethodId,
        isDeposit,
      }: {
        bookingId: string;
        paymentMethodId: string;
        isDeposit?: boolean;
      }) =>
        clientFetch<{
          data: {
            requiresAction: boolean;
            clientSecret?: string;
          };
        }>(`/v1/bookings/${bookingId}/payments/charge-saved`, {
          method: 'POST',
          body: JSON.stringify({ paymentMethodId, isDeposit }),
        }),
    }),

  confirm: () =>
    mutationOptions({
      mutationFn: ({
        bookingId,
        paymentIntentId,
      }: {
        bookingId: string;
        paymentIntentId: string;
      }) =>
        clientFetch(`/v1/bookings/${bookingId}/payments/confirm`, {
          method: 'POST',
          body: JSON.stringify({ paymentIntentId }),
        }),
    }),
};

export const bookingDateMutations = {
  modify: () =>
    mutationOptions({
      mutationFn: ({
        id,
        checkIn,
        checkOut,
      }: {
        id: string;
        checkIn?: string;
        checkOut?: string;
      }) =>
        clientFetch(`/v1/bookings/${id}/modify-dates`, {
          method: 'POST',
          body: JSON.stringify({ checkIn, checkOut }),
        }),
    }),
};
