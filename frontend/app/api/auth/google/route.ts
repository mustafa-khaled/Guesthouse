import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/constants'

export async function GET() {
  return NextResponse.redirect(`${BACKEND_URL}/auth/google`)
}
