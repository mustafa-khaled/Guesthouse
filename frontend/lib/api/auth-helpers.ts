import { NextResponse } from 'next/server'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/constants'

const isProd = process.env.NODE_ENV === 'production'

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshSetCookie?: string | null,
) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60,
  })

  if (refreshSetCookie) {
    const token = extractCookieValue(refreshSetCookie, 'refreshToken')
    if (token) {
      response.cookies.set(REFRESH_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      })
    }
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE)
  response.cookies.delete(REFRESH_TOKEN_COOKIE)
}

function extractCookieValue(setCookie: string, name: string): string | null {
  const match = setCookie.match(new RegExp(`${name}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}

export async function proxyBackend(
  path: string,
  init: RequestInit,
  accessToken?: string,
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  return fetch(`${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${path}`, {
    ...init,
    headers,
  })
}
