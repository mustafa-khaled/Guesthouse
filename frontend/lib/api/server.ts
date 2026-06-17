import { cookies } from 'next/headers'
import { BACKEND_URL, ACCESS_TOKEN_COOKIE } from '../constants'
import { ApiError, parseApiError } from './errors'

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
}

export async function backendFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }

  if (options.auth !== false) {
    const token = await getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  })

  if (!res.ok) throw await parseApiError(res)
  return res.json() as Promise<T>
}

export async function backendFetchApi<T>(
  endpoint: string,
  options?: RequestInit & { auth?: boolean },
): Promise<T> {
  return backendFetch<T>(`/api/v1${endpoint}`, options)
}
