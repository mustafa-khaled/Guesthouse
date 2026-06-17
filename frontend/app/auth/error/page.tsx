'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ERROR_MESSAGES: Record<string, string> = {
  oauth_init_failed: 'Could not start Google sign-in. Please try again.',
  invalid_state: 'Sign-in session expired. Please try again.',
  code_missing: 'Authorization code was not received.',
  invalid_code: 'Invalid authorization code.',
  invalid_google_profile: 'Could not retrieve your Google profile.',
  oauth_failed: 'Google sign-in failed. Please try again.',
  access_denied: 'You denied access to your Google account.',
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const rawMessage = searchParams.get('message') ?? 'unknown_error'
  const message =
    ERROR_MESSAGES[rawMessage] ??
    decodeURIComponent(rawMessage).replace(/_/g, ' ')

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-700">Sign-in error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">{message}</p>
          <div className="flex gap-3">
            <Link href="/login">
              <Button>Try again</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24 text-gray-500">Loading...</div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  )
}
