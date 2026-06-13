import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/constants'

export async function GET() {
  const res = await fetch(`${BACKEND_URL}/api/v1/users/logout`)

  const data = await res.json()

  const response = NextResponse.json(data, { status: res.status })

  const setCookie = res.headers.get('set-cookie')
  if (setCookie) {
    response.headers.set('Set-Cookie', setCookie)
  }

  return response
}
