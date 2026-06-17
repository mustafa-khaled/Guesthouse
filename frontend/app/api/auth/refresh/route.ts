import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/constants'
import { proxyBackend, setAuthCookies } from '@/lib/api/auth-helpers'

export async function POST(request: Request) {
  let body: { accessToken?: string } = {}
  try {
    body = await request.json()
  } catch {
    // empty body is fine
  }

  if (body.accessToken) {
    const response = NextResponse.json({ message: 'Session established' })
    setAuthCookies(response, body.accessToken)
    return response
  }

  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value

  if (!refreshToken) {
    return NextResponse.json({ message: 'Refresh token is missing.' }, { status: 401 })
  }

  const res = await proxyBackend('/auth/refresh', {
    method: 'POST',
    headers: { Cookie: `refreshToken=${refreshToken}` },
  })

  const data = await res.json()
  const response = NextResponse.json(data, { status: res.status })

  if (res.ok && data.accessToken) {
    setAuthCookies(response, data.accessToken, res.headers.get('set-cookie'))
  }

  return response
}
