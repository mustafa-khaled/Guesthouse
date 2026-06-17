import { queryOptions } from '@tanstack/react-query'
import { clientFetch } from '@/lib/api/client'

export const frontDeskQueries = {
  dashboard: () =>
    queryOptions({
      queryKey: ['front-desk', 'dashboard'] as const,
      queryFn: () => clientFetch<{ data: Record<string, unknown> }>('/v1/dashboard/property'),
      select: (res) => res.data,
    }),

  arrivals: (date?: string) =>
    queryOptions({
      queryKey: ['front-desk', 'arrivals', date] as const,
      queryFn: () => {
        const qs = date ? `?date=${date}` : ''
        return clientFetch<{ data: unknown[] }>(`/v1/front-desk/arrivals${qs}`)
      },
      select: (res) => res.data,
    }),

  departures: (date?: string) =>
    queryOptions({
      queryKey: ['front-desk', 'departures', date] as const,
      queryFn: () => {
        const qs = date ? `?date=${date}` : ''
        return clientFetch<{ data: unknown[] }>(`/v1/front-desk/departures${qs}`)
      },
      select: (res) => res.data,
    }),

  inHouse: () =>
    queryOptions({
      queryKey: ['front-desk', 'in-house'] as const,
      queryFn: () => clientFetch<{ data: unknown[] }>('/v1/front-desk/in-house'),
      select: (res) => res.data,
    }),

  roomRack: (propertyId?: string) =>
    queryOptions({
      queryKey: ['front-desk', 'room-rack', propertyId] as const,
      queryFn: () => {
        const qs = propertyId ? `?propertyId=${propertyId}` : ''
        return clientFetch<{ data: unknown[] }>(`/v1/front-desk/room-rack${qs}`)
      },
      select: (res) => res.data,
    }),
}

export const housekeepingQueries = {
  dashboard: () =>
    queryOptions({
      queryKey: ['housekeeping', 'dashboard'] as const,
      queryFn: () =>
        clientFetch<{ data: Record<string, unknown> }>('/v1/housekeeping/dashboard'),
      select: (res) => res.data,
    }),

  tasks: (params: Record<string, string> = {}) =>
    queryOptions({
      queryKey: ['housekeeping', 'tasks', params] as const,
      queryFn: () => {
        const qs = new URLSearchParams(params).toString()
        return clientFetch<{ data: unknown[] }>(`/v1/housekeeping/tasks?${qs}`)
      },
      select: (res) => res.data,
    }),
}

export const roomQueries = {
  byProperty: (propertyId: string) =>
    queryOptions({
      queryKey: ['rooms', propertyId] as const,
      queryFn: () =>
        clientFetch<{ data: unknown[] }>(`/v1/properties/${propertyId}/rooms`),
      enabled: !!propertyId,
      select: (res) => res.data,
    }),

  statusSummary: (propertyId: string) =>
    queryOptions({
      queryKey: ['rooms', 'status-summary', propertyId] as const,
      queryFn: () =>
        clientFetch<{ data: Record<string, number> }>(
          `/v1/properties/${propertyId}/rooms/status-summary`,
        ),
      enabled: !!propertyId,
      select: (res) => res.data,
    }),
}
