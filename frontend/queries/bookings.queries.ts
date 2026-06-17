import { queryOptions } from '@tanstack/react-query'
import { clientFetch } from '@/lib/api/client'
import type {
  Booking,
  PaginatedResponse,
  RoomType,
  RatePlan,
  AddOn,
  Review,
  Guest,
  Folio,
  Payment,
  AvailabilityResult,
} from '@/types'

export const bookingQueries = {
  mine: () =>
    queryOptions({
      queryKey: ['bookings', 'mine'] as const,
      queryFn: () =>
        clientFetch<{ data: Booking[] }>('/v1/user/me/bookings'),
      select: (res) => res.data,
    }),

  list: (params: Record<string, string> = {}) =>
    queryOptions({
      queryKey: ['bookings', 'list', params] as const,
      queryFn: () => {
        const qs = new URLSearchParams(params).toString()
        return clientFetch<PaginatedResponse<Booking>>(`/v1/bookings?${qs}`)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: ['bookings', 'detail', id] as const,
      queryFn: () => clientFetch<{ data: Booking }>(`/v1/bookings/${id}`),
      enabled: !!id,
      select: (res) => res.data,
    }),

  availability: (params: Record<string, string>) =>
    queryOptions({
      queryKey: ['availability', params] as const,
      queryFn: () => {
        const qs = new URLSearchParams(params).toString()
        return clientFetch<{ data: AvailabilityResult[] }>(
          `/v1/availability/search?${qs}`,
        )
      },
      enabled: !!params.propertyId && !!params.checkIn && !!params.checkOut,
      select: (res) => res.data,
    }),
}

export const roomTypeQueries = {
  byProperty: (propertyId: string) =>
    queryOptions({
      queryKey: ['room-types', propertyId] as const,
      queryFn: () =>
        clientFetch<{ data: RoomType[] }>(
          `/v1/properties/${propertyId}/room-types`,
        ),
      enabled: !!propertyId,
      select: (res) => res.data,
    }),
}

export const ratePlanQueries = {
  byRoomType: (roomTypeId: string) =>
    queryOptions({
      queryKey: ['rate-plans', roomTypeId] as const,
      queryFn: () =>
        clientFetch<{ data: RatePlan[] }>(`/v1/room-types/${roomTypeId}/rate-plans`),
      enabled: !!roomTypeId,
      select: (res) => res.data,
    }),
}

export const addOnQueries = {
  byProperty: (propertyId: string) =>
    queryOptions({
      queryKey: ['add-ons', propertyId] as const,
      queryFn: () =>
        clientFetch<{ data: AddOn[] }>(`/v1/properties/${propertyId}/add-ons`),
      enabled: !!propertyId,
      select: (res) => res.data,
    }),
}

export const reviewQueries = {
  byProperty: (propertyId: string) =>
    queryOptions({
      queryKey: ['reviews', propertyId] as const,
      queryFn: () =>
        clientFetch<{ data: Review[] }>(
          `/v1/properties/${propertyId}/reviews`,
        ),
      enabled: !!propertyId,
      select: (res) => res.data,
    }),

  summary: (propertyId: string) =>
    queryOptions({
      queryKey: ['reviews', 'summary', propertyId] as const,
      queryFn: () =>
        clientFetch<{ data: { averageRating: number; totalReviews: number } }>(
          `/v1/properties/${propertyId}/reviews/summary`,
        ),
      enabled: !!propertyId,
      select: (res) => res.data,
    }),

  mine: () =>
    queryOptions({
      queryKey: ['reviews', 'mine'] as const,
      queryFn: () =>
        clientFetch<{ data: Review[] }>('/v1/user/me/reviews'),
      select: (res) => res.data,
    }),
}

export const guestQueries = {
  list: (params: Record<string, string> = {}) =>
    queryOptions({
      queryKey: ['guests', params] as const,
      queryFn: () => {
        const qs = new URLSearchParams(params).toString()
        return clientFetch<PaginatedResponse<Guest>>(`/v1/guests?${qs}`)
      },
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: ['guests', 'detail', id] as const,
      queryFn: () => clientFetch<{ data: Guest }>(`/v1/guests/${id}`),
      enabled: !!id,
      select: (res) => res.data,
    }),
}

export const folioQueries = {
  byBooking: (bookingId: string) =>
    queryOptions({
      queryKey: ['folio', bookingId] as const,
      queryFn: () =>
        clientFetch<{ data: Folio }>(`/v1/bookings/${bookingId}/folio`),
      enabled: !!bookingId,
      select: (res) => res.data,
    }),
}

export const paymentQueries = {
  byBooking: (bookingId: string) =>
    queryOptions({
      queryKey: ['payments', bookingId] as const,
      queryFn: () =>
        clientFetch<{ data: Payment[] }>(`/v1/bookings/${bookingId}/payments`),
      enabled: !!bookingId,
      select: (res) => res.data,
    }),
}
