import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/constants'

export async function POST(request: Request) {
  const body = await request.json()
  const { passwordConfirm, ...rest } = body

  const res = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rest),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
