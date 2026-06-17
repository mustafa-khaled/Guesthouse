import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  BACKEND_URL,
} from '@/lib/constants'
import {
  clearAuthCookies,
  proxyBackend,
  setAuthCookies,
} from '@/lib/api/auth-helpers'

export async function POST(request: Request) {
  const body = await request.json()

  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  const response = NextResponse.json(data, { status: res.status })

  if (res.ok && data.accessToken) {
    setAuthCookies(response, data.accessToken, res.headers.get('set-cookie'))
  }

  return response
}
