import { mutationOptions } from '@tanstack/react-query'
import { clientFetch } from '@/lib/api/client'
import type { CreateBookingInput, Booking } from '@/types'

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
      mutationFn: (id: string) =>
        clientFetch(`/v1/bookings/${id}/confirm`, { method: 'POST' }),
    }),

  checkIn: () =>
    mutationOptions({
      mutationFn: (id: string) =>
        clientFetch(`/v1/bookings/${id}/check-in`, { method: 'POST' }),
    }),

  checkOut: () =>
    mutationOptions({
      mutationFn: (id: string) =>
        clientFetch(`/v1/bookings/${id}/check-out`, { method: 'POST' }),
    }),

  assignRoom: () =>
    mutationOptions({
      mutationFn: ({ id, roomId }: { id: string; roomId: string }) =>
        clientFetch(`/v1/bookings/${id}/assign-room`, {
          method: 'POST',
          body: JSON.stringify({ roomId }),
        }),
    }),
}

export const inventoryMutations = {
  hold: () =>
    mutationOptions({
      mutationFn: (data: Record<string, unknown>) =>
        clientFetch<{ data: { holdId: string; expiresAt: string } }>(
          '/v1/inventory/hold',
          { method: 'POST', body: JSON.stringify(data) },
        ),
    }),

  releaseHold: () =>
    mutationOptions({
      mutationFn: (holdId: string) =>
        clientFetch(`/v1/inventory/hold/${holdId}`, { method: 'DELETE' }),
    }),
}

export const paymentMutations = {
  createIntent: () =>
    mutationOptions({
      mutationFn: (bookingId: string) =>
        clientFetch<{ data: { clientSecret: string } }>(
          `/v1/bookings/${bookingId}/payments/intent`,
          { method: 'POST' },
        ),
    }),

  confirm: () =>
    mutationOptions({
      mutationFn: ({
        bookingId,
        paymentIntentId,
      }: {
        bookingId: string
        paymentIntentId: string
      }) =>
        clientFetch(`/v1/bookings/${bookingId}/payments/confirm`, {
          method: 'POST',
          body: JSON.stringify({ paymentIntentId }),
        }),
    }),
}

export const promotionMutations = {
  validate: () =>
    mutationOptions({
      mutationFn: (code: string) =>
        clientFetch('/v1/promotions/validate', {
          method: 'POST',
          body: JSON.stringify({ code }),
        }),
    }),
}

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
}

export const reviewMutations = {
  create: () =>
    mutationOptions({
      mutationFn: (data: Record<string, unknown>) =>
        clientFetch('/v1/reviews', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    }),
}
