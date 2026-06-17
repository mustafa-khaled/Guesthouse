import { queryOptions } from '@tanstack/react-query'
import { clientFetch } from '@/lib/api/client'
import type { Property, Promotion, PaginatedResponse, AuditLog } from '@/types'

export const adminQueries = {
  managerDashboard: () =>
    queryOptions({
      queryKey: ['admin', 'dashboard'] as const,
      queryFn: () => clientFetch<{ data: Record<string, unknown> }>('/v1/dashboard/manager'),
      select: (res) => res.data,
    }),

  properties: () =>
    queryOptions({
      queryKey: ['admin', 'properties'] as const,
      queryFn: () => clientFetch<PaginatedResponse<Property>>('/v1/?limit=100'),
    }),

  promotions: () =>
    queryOptions({
      queryKey: ['admin', 'promotions'] as const,
      queryFn: () => clientFetch<{ data: Promotion[] }>('/v1/promotions'),
      select: (res) => res.data,
    }),

  auditLogs: (params: Record<string, string> = {}) =>
    queryOptions({
      queryKey: ['admin', 'audit-logs', params] as const,
      queryFn: () => {
        const qs = new URLSearchParams(params).toString()
        return clientFetch<PaginatedResponse<AuditLog>>(`/admin/audit-logs?${qs}`)
      },
    }),

  users: () =>
    queryOptions({
      queryKey: ['admin', 'users'] as const,
      queryFn: () => clientFetch<{ data: unknown[] }>('/admin/users'),
      select: (res) => res.data,
    }),

  report: (type: string, params: Record<string, string> = {}) =>
    queryOptions({
      queryKey: ['admin', 'reports', type, params] as const,
      queryFn: () => {
        const qs = new URLSearchParams(params).toString()
        return clientFetch<{ data: unknown }>(`/v1/reports/${type}?${qs}`)
      },
    }),
}
