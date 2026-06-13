import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/constants'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const jwt = cookieStore.get('jwt')

  const res = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
    headers: {
      'Content-Type': 'application/json',
      Cookie: jwt ? `jwt=${jwt.value}` : '',
    },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
