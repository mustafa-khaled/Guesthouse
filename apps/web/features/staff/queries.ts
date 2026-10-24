import { queryOptions } from '@tanstack/react-query';
import { clientFetch } from '@/lib/api/client';

export const frontDeskQueries = {
  dashboard: (propertyId: string) =>
    queryOptions({
      queryKey: ['front-desk', 'dashboard', propertyId] as const,
      queryFn: () =>
        clientFetch<{ data: Record<string, unknown> }>(
          `/v1/dashboard/property?propertyId=${propertyId}`,
        ),
      enabled: !!propertyId,
      select: (res) => res.data,
    }),

  arrivals: (propertyId: string, date?: string) =>
    queryOptions({
      queryKey: ['front-desk', 'arrivals', propertyId, date] as const,
      queryFn: () => {
        const params = new URLSearchParams({ propertyId });
        if (date) params.set('date', date);
        return clientFetch<{ data: unknown[] }>(`/v1/front-desk/arrivals?${params.toString()}`);
      },
      enabled: !!propertyId,
      select: (res) => res.data,
    }),

  departures: (propertyId: string, date?: string) =>
    queryOptions({
      queryKey: ['front-desk', 'departures', propertyId, date] as const,
      queryFn: () => {
        const params = new URLSearchParams({ propertyId });
        if (date) params.set('date', date);
        return clientFetch<{ data: unknown[] }>(`/v1/front-desk/departures?${params.toString()}`);
      },
      enabled: !!propertyId,
      select: (res) => res.data,
    }),

  inHouse: (propertyId: string) =>
    queryOptions({
      queryKey: ['front-desk', 'in-house', propertyId] as const,
      queryFn: () =>
        clientFetch<{ data: unknown[] }>(`/v1/front-desk/in-house?propertyId=${propertyId}`),
      enabled: !!propertyId,
      select: (res) => res.data,
    }),

  roomRack: (propertyId?: string) =>
    queryOptions({
      queryKey: ['front-desk', 'room-rack', propertyId] as const,
      queryFn: () => {
        const qs = propertyId ? `?propertyId=${propertyId}` : '';
        return clientFetch<{ data: unknown[] }>(`/v1/front-desk/room-rack${qs}`);
      },
      enabled: !!propertyId,
      select: (res) => res.data,
    }),
};

export const housekeepingQueries = {
  dashboard: (propertyId: string) =>
    queryOptions({
      queryKey: ['housekeeping', 'dashboard', propertyId] as const,
      queryFn: () =>
        clientFetch<{ data: Record<string, unknown> }>(
          `/v1/housekeeping/dashboard?propertyId=${encodeURIComponent(propertyId)}`,
        ),
      enabled: !!propertyId,
      select: (res) => res.data,
    }),

  tasks: (params: Record<string, string> = {}) =>
    queryOptions({
      queryKey: ['housekeeping', 'tasks', params] as const,
      queryFn: () => {
        const qs = new URLSearchParams(params).toString();
        return clientFetch<{ data: unknown[] }>(`/v1/housekeeping/tasks?${qs}`);
      },
      select: (res) => res.data,
    }),
};

export const roomQueries = {
  byProperty: (propertyId: string) =>
    queryOptions({
      queryKey: ['rooms', propertyId] as const,
      queryFn: () => clientFetch<{ data: unknown[] }>(`/v1/properties/${propertyId}/rooms`),
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
};
