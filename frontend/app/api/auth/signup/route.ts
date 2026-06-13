import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/constants'

export async function POST(request: Request) {
  const body = await request.json()

  const res = await fetch(`${BACKEND_URL}/api/v1/users/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  const response = NextResponse.json(data, { status: res.status })

  const setCookie = res.headers.get('set-cookie')
  if (setCookie) {
    response.headers.set('Set-Cookie', setCookie)
  }

  return response
}
