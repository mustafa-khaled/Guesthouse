import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/constants'
import { clearAuthCookies, proxyBackend, setAuthCookies } from '@/lib/api/auth-helpers'

export async function POST() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value

  const res = await proxyBackend(
    '/auth/logout',
    {
      method: 'POST',
      headers: refreshToken ? { Cookie: `refreshToken=${refreshToken}` } : {},
    },
    accessToken,
  )

  const data = await res.json().catch(() => ({ message: 'Logged out' }))
  const response = NextResponse.json(data, { status: res.status })
  clearAuthCookies(response)
  return response
}
