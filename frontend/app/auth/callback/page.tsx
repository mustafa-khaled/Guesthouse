'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clientFetch } from '@/lib/api/client'
import { useAuth } from '@/hooks/useAuth'
import Spinner from '@/components/Spinner'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function completeAuth() {
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')

      try {
        if (accessToken) {
          await clientFetch('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ accessToken }),
          })
        } else {
          await clientFetch('/auth/refresh', { method: 'POST' })
        }

        await refreshUser()
        router.replace('/account')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed')
      }
    }

    completeAuth()
  }, [router, refreshUser])

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-red-600">{error}</p>
        <a href="/login" className="mt-4 inline-block text-green-700 hover:underline">
          Back to login
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-24">
      <Spinner />
      <p className="mt-4 text-gray-600">Completing sign in...</p>
    </div>
  )
}
