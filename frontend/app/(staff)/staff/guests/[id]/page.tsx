'use client'

import Link from 'next/link'
import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { guestQueries } from '@/queries/bookings.queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Spinner from '@/components/Spinner'
import { formatCurrency, formatDate, getId } from '@/lib/utils'

export default function StaffGuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const { data: guest, isLoading, isError, error } = useQuery(
    guestQueries.detail(id),
  )

  if (isLoading) return <Spinner />

  if (isError || !guest) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Guest not found'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/staff/guests"
          className="text-sm text-green-700 hover:underline"
        >
          &larr; Back to guests
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {guest.firstName} {guest.lastName}
        </h1>
        <p className="text-sm text-gray-500">{guest.email}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span>{guest.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phone</span>
              <span>{guest.phone || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nationality</span>
              <span>{guest.nationality || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date of Birth</span>
              <span>
                {guest.dateOfBirth ? formatDate(guest.dateOfBirth) : '—'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stay History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Stays</span>
              <span>{guest.stats?.totalStays ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Spent</span>
              <span>
                {guest.stats?.totalSpent != null
                  ? formatCurrency(guest.stats.totalSpent)
                  : '—'}
              </span>
            </div>
            {guest.userId && (
              <div className="flex justify-between">
                <span className="text-gray-500">User Account</span>
                <span>{getId(guest.userId as never) || guest.userId}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
