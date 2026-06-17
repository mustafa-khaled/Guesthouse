import { queryOptions } from '@tanstack/react-query'
import { clientFetch } from '@/lib/api/client'
import type { Property, PaginatedResponse } from '@/types'

export const propertyQueries = {
  all: () =>
    queryOptions({
      queryKey: ['properties'] as const,
      queryFn: () =>
        clientFetch<PaginatedResponse<Property>>('/v1/?limit=50'),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: ['properties', 'detail', id] as const,
      queryFn: () => clientFetch<{ data: Property }>(`/v1/${id}`),
      enabled: !!id,
      select: (res) => res.data,
    }),

  bySlug: (slug: string) =>
    queryOptions({
      queryKey: ['properties', 'slug', slug] as const,
      queryFn: () => clientFetch<{ data: Property }>(`/v1/slug/${slug}`),
      enabled: !!slug,
      select: (res) => res.data,
    }),

  search: (q: string) =>
    queryOptions({
      queryKey: ['properties', 'search', q] as const,
      queryFn: () =>
        clientFetch<{ items: Property[] }>(
          `/v1/search/properties?q=${encodeURIComponent(q)}`,
        ),
      enabled: q.length >= 2,
    }),
}
