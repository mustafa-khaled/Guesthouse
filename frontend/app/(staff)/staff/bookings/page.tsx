'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { bookingQueries } from '@/queries/bookings.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BookingStatusBadge } from '@/components/shared/StatusBadge'
import Spinner from '@/components/Spinner'
import { formatDate, getId, getRefLabel } from '@/lib/utils'
import type { Booking, BookingStatus } from '@/types'

export default function StaffBookingsPage() {
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, isError, error, isFetching } = useQuery(
    bookingQueries.list({ page: String(page), limit: String(limit) }),
  )

  if (isLoading) return <Spinner />

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Failed to load bookings'}
      </div>
    )
  }

  const bookings = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-sm text-gray-500">Manage reservations and stays</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            All Bookings
            {pagination ? ` (${pagination.total})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-sm text-gray-500">No bookings found.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Confirmation</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking: Booking) => (
                    <TableRow key={getId(booking)}>
                      <TableCell>
                        <Link
                          href={`/staff/bookings/${getId(booking)}`}
                          className="font-medium text-green-700 hover:underline"
                        >
                          {booking.confirmationNumber || getId(booking).slice(-8)}
                        </Link>
                      </TableCell>
                      <TableCell>{getRefLabel(booking.guestId as never)}</TableCell>
                      <TableCell>{formatDate(booking.checkIn)}</TableCell>
                      <TableCell>{formatDate(booking.checkOut)}</TableCell>
                      <TableCell>
                        <BookingStatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell>
                        {booking.pricing?.total != null
                          ? `${booking.pricing.currency ?? 'USD'} ${booking.pricing.total.toFixed(2)}`
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrevPage || isFetching}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNextPage || isFetching}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
