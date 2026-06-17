import { ApiError, parseApiError } from './errors'

let refreshPromise: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/auth/refresh', { method: 'POST' })
      .then((res) => res.ok)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export async function clientFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  })

  if (res.status === 401 && !endpoint.includes('/auth/refresh')) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      const retry = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      })
      if (!retry.ok) throw await parseApiError(retry)
      return retry.json() as Promise<T>
    }
  }

  if (!res.ok) throw await parseApiError(res)
  return res.json() as Promise<T>
}

export { ApiError }
