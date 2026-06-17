'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export default function Header() {
  const { user, logout, isLoading, hasRole } = useAuth()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-green-700">
          Guesthouse
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm text-gray-600 hover:text-green-700">
            Properties
          </Link>
          <Link href="/search" className="text-sm text-gray-600 hover:text-green-700">
            Search
          </Link>
          {user && (
            <Link
              href="/account/bookings"
              className="text-sm text-gray-600 hover:text-green-700"
            >
              My Bookings
            </Link>
          )}
          {hasRole('editor') && (
            <Link
              href="/staff/front-desk"
              className="text-sm text-gray-600 hover:text-green-700"
            >
              Staff Portal
            </Link>
          )}
          {hasRole('admin') && (
            <Link
              href="/admin"
              className="text-sm text-gray-600 hover:text-green-700"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isLoading ? null : user ? (
            <>
              <Link
                href="/account"
                className="text-sm text-gray-600 hover:text-green-700"
              >
                {user.name || user.email}
              </Link>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
