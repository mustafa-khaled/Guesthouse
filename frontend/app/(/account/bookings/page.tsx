'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { bookingQueries } from '@/queries/bookings.queries'
import { BookingStatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Spinner from '@/components/Spinner'
import { formatDate, getId } from '@/lib/utils'
import type { Property } from '@/types'

function getPropertyName(propertyId: unknown): string {
  if (typeof propertyId === 'string') return 'Property'
  if (propertyId && typeof propertyId === 'object' && 'name' in propertyId) {
    return String((propertyId as Property).name)
  }
  return 'Property'
}

export default function MyBookingsPage() {
  const { data: bookings, isLoading, isError } = useQuery(bookingQueries.mine())

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/account"
        className="mb-6 inline-block text-sm text-green-700 hover:underline"
      >
        ← Back to account
      </Link>

      <h1 className="mb-6 text-2xl font-bold">My bookings</h1>

      {isError && (
        <p className="text-red-600">Failed to load bookings. Please try again.</p>
      )}

      {bookings && bookings.length === 0 && (
        <p className="text-gray-500">
          You have no bookings yet.{' '}
          <Link href="/" className="text-green-700 hover:underline">
            Browse properties
          </Link>
        </p>
      )}

      <div className="space-y-4">
        {bookings?.map((booking) => (
          <Link key={getId(booking)} href={`/account/bookings/${getId(booking)}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">
                  {booking.confirmationNumber || getId(booking)}
                </CardTitle>
                <BookingStatusBadge status={booking.status} />
              </CardHeader>
              <CardContent>
                <p className="font-medium">{getPropertyName(booking.propertyId)}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                </p>
                <p className="text-sm text-gray-500">
                  {booking.adults} guest{booking.adults !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
