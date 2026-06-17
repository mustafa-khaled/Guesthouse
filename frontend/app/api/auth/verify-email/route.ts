import { NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ message: 'Token is required' }, { status: 400 })
  }

  const res = await fetch(
    `${BACKEND_URL}/auth/verify-email?token=${encodeURIComponent(token)}`,
  )
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
