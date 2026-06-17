import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE } from '@/lib/constants'
import { proxyBackend } from '@/lib/api/auth-helpers'

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

  const res = await proxyBackend('/user/me', { method: 'GET' }, accessToken)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  const body = await request.json()

  const res = await proxyBackend(
    '/user/me',
    { method: 'PATCH', body: JSON.stringify(body) },
    accessToken,
  )

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
