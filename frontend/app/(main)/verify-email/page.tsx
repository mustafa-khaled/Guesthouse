'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { clientFetch } from '@/lib/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Spinner from '@/components/Spinner'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  )
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Verification token is missing.')
      return
    }

    clientFetch<{ message?: string }>(
      `/auth/verify-email?token=${encodeURIComponent(token)}`,
    )
      .then((data) => {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Verification failed')
      })
  }, [token])

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>
            {status === 'loading' && 'Verifying email...'}
            {status === 'success' && 'Email verified'}
            {status === 'error' && 'Verification failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          )}
          {status !== 'loading' && (
            <p
              className={
                status === 'success' ? 'text-green-700' : 'text-red-600'
              }
            >
              {message}
            </p>
          )}
          {status === 'success' && (
            <Link href="/login">
              <Button className="w-full">Continue to login</Button>
            </Link>
          )}
          {status === 'error' && (
            <Link href="/" className="text-sm text-green-700 hover:underline">
              Back to home
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
