import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ACCESS_TOKEN_COOKIE } from '@/lib/constants'
import type { Role } from '@guesthouse/shared'
import { hasMinimumRole } from '@guesthouse/shared'

const protectedPrefixes = ['/account', '/book', '/staff', '/admin']

function getRequiredRole(pathname: string): Role | null {
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/staff')) return 'editor'
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const requiredRole = getRequiredRole(pathname)
  if (requiredRole) {
    try {
      const meRes = await fetch(new URL('/api/auth/me', request.url), {
        headers: { Cookie: request.headers.get('cookie') || '' },
      })
      if (!meRes.ok) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      const me = await meRes.json()
      const role = me.user?.role as Role
      if (!role || !hasMinimumRole(role, requiredRole)) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/book/:path*', '/staff/:path*', '/admin/:path*'],
}
