'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { bookingQueries } from '@/queries/bookings.queries'
import { bookingMutations } from '@/mutations/bookings.mutations'
import { BookingStatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Spinner from '@/components/Spinner'
import { formatCurrency, formatDate, getId } from '@/lib/utils'
import type { Property } from '@/types'

function getPropertyName(propertyId: unknown): string {
  if (typeof propertyId === 'string') return 'Property'
  if (propertyId && typeof propertyId === 'object' && 'name' in propertyId) {
    return String((propertyId as Property).name)
  }
  return 'Property'
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const bookingId = String(params.id)

  const { data: booking, isLoading, isError } = useQuery(
    bookingQueries.detail(bookingId),
  )

  const cancelMutation = useMutation({
    ...bookingMutations.cancel(),
    onSuccess: () => {
      toast.success('Booking cancelled')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      router.push('/account/bookings')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Cancellation failed')
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (isError || !booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-600">Booking not found.</p>
        <Link href="/account/bookings" className="mt-4 inline-block text-green-700">
          ← Back to bookings
        </Link>
      </div>
    )
  }

  const canCancel =
    booking.status === 'pending' || booking.status === 'confirmed'

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Link
        href="/account/bookings"
        className="mb-6 inline-block text-sm text-green-700 hover:underline"
      >
        ← Back to bookings
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {booking.confirmationNumber || getId(booking)}
          </CardTitle>
          <BookingStatusBadge status={booking.status} />
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="text-gray-500">Property:</span>{' '}
            {getPropertyName(booking.propertyId)}
          </p>
          <p>
            <span className="text-gray-500">Check-in:</span>{' '}
            {formatDate(booking.checkIn)}
          </p>
          <p>
            <span className="text-gray-500">Check-out:</span>{' '}
            {formatDate(booking.checkOut)}
          </p>
          <p>
            <span className="text-gray-500">Guests:</span> {booking.adults}{' '}
            adult{booking.adults !== 1 ? 's' : ''}
            {booking.children
              ? `, ${booking.children} child${booking.children !== 1 ? 'ren' : ''}`
              : ''}
          </p>
          {booking.pricing?.total != null && (
            <p>
              <span className="text-gray-500">Total:</span>{' '}
              {formatCurrency(
                booking.pricing.total,
                booking.pricing.currency ?? 'USD',
              )}
            </p>
          )}
          {booking.specialRequests && (
            <p>
              <span className="text-gray-500">Special requests:</span>{' '}
              {booking.specialRequests}
            </p>
          )}

          {canCancel && (
            <Button
              variant="destructive"
              className="mt-4"
              disabled={cancelMutation.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    'Are you sure you want to cancel this booking?',
                  )
                ) {
                  cancelMutation.mutate({ id: bookingId })
                }
              }}
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel booking'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
