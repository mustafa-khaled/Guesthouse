'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function Header() {
  const { user, logout, isLoading } = useAuth()

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white shadow-md">
      <nav className="flex items-center gap-8">
        <Link href="/" className="font-semibold text-gray-700 hover:text-green-600">
          All tours
        </Link>
      </nav>

      <Link href="/" className="flex-shrink-0">
        <span className="text-2xl font-bold text-green-600">Guesthouse</span>
      </Link>

      <nav className="flex items-center gap-4">
        {isLoading ? (
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
        ) : user ? (
          <>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-red-500"
            >
              Log out
            </button>
            <Link
              href="/account"
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              {user.photo && (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span>{user.name.split(' ')[0]}</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-green-600"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm text-white bg-green-600 rounded-full hover:bg-green-700"
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
