import { BACKEND_URL } from './constants'

export async function serverFetch<T>(
  endpoint: string,
  options?: RequestInit & { cookie?: string },
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  }

  if (options?.cookie) {
    headers.Cookie = options.cookie
  }

  const res = await fetch(`${BACKEND_URL}/api/v1${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export async function clientFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message || `Request failed: ${res.status}`)
  }

  return res.json()
}
