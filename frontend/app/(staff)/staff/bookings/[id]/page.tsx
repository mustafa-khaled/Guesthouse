'use client'

import Link from 'next/link'
import { use, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { bookingQueries } from '@/queries/bookings.queries'
import { roomQueries } from '@/queries/staff.queries'
import { bookingMutations } from '@/mutations/bookings.mutations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { BookingStatusBadge } from '@/components/shared/StatusBadge'
import Spinner from '@/components/Spinner'
import { formatCurrency, formatDate, getId, getRefLabel } from '@/lib/utils'

export default function StaffBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const [roomId, setRoomId] = useState('')

  const { data: booking, isLoading, isError, error } = useQuery(
    bookingQueries.detail(id),
  )

  const propertyId =
    typeof booking?.propertyId === 'string'
      ? booking.propertyId
      : getId(booking?.propertyId as { id?: string; _id?: string })

  const { data: rooms } = useQuery(roomQueries.byProperty(propertyId))

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] })
    queryClient.invalidateQueries({ queryKey: ['front-desk'] })
  }

  const confirmMutation = useMutation({
    ...bookingMutations.confirm(),
    onSuccess: () => {
      toast.success('Booking confirmed')
      invalidate()
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Failed to confirm'),
  })

  const checkInMutation = useMutation({
    ...bookingMutations.checkIn(),
    onSuccess: () => {
      toast.success('Guest checked in')
      invalidate()
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Failed to check in'),
  })

  const checkOutMutation = useMutation({
    ...bookingMutations.checkOut(),
    onSuccess: () => {
      toast.success('Guest checked out')
      invalidate()
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Failed to check out'),
  })

  const assignRoomMutation = useMutation({
    ...bookingMutations.assignRoom(),
    onSuccess: () => {
      toast.success('Room assigned')
      invalidate()
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Failed to assign room'),
  })

  const isPending =
    confirmMutation.isPending ||
    checkInMutation.isPending ||
    checkOutMutation.isPending ||
    assignRoomMutation.isPending

  if (isLoading) return <Spinner />

  if (isError || !booking) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Booking not found'}
      </div>
    )
  }

  const assignedRoomId =
    typeof booking.assignedRoomId === 'string'
      ? booking.assignedRoomId
      : getId(booking.assignedRoomId as { id?: string; _id?: string })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/staff/bookings"
            className="text-sm text-green-700 hover:underline"
          >
            &larr; Back to bookings
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {booking.confirmationNumber || `Booking ${getId(booking).slice(-8)}`}
          </h1>
          <div className="mt-2">
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {booking.status === 'pending' && (
            <Button
              disabled={isPending}
              onClick={() => confirmMutation.mutate(id)}
            >
              Confirm
            </Button>
          )}
          {booking.status === 'confirmed' && (
            <Button
              disabled={isPending}
              onClick={() => checkInMutation.mutate(id)}
            >
              Check In
            </Button>
          )}
          {booking.status === 'checked-in' && (
            <Button
              disabled={isPending}
              onClick={() => checkOutMutation.mutate(id)}
            >
              Check Out
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stay Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Guest</span>
              <span>{getRefLabel(booking.guestId as never)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Property</span>
              <span>{getRefLabel(booking.propertyId as never)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Room Type</span>
              <span>{getRefLabel(booking.roomTypeId as never)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-in</span>
              <span>{formatDate(booking.checkIn)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Check-out</span>
              <span>{formatDate(booking.checkOut)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Guests</span>
              <span>
                {booking.adults} adult{booking.adults !== 1 ? 's' : ''}
                {booking.children ? `, ${booking.children} child` : ''}
              </span>
            </div>
            {assignedRoomId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Assigned Room</span>
                <span>{getRefLabel(booking.assignedRoomId as never) || assignedRoomId}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {booking.pricing ? (
              <>
                {booking.pricing.subtotal != null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>
                      {formatCurrency(
                        booking.pricing.subtotal,
                        booking.pricing.currency,
                      )}
                    </span>
                  </div>
                )}
                {booking.pricing.tax != null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax</span>
                    <span>
                      {formatCurrency(booking.pricing.tax, booking.pricing.currency)}
                    </span>
                  </div>
                )}
                {booking.pricing.total != null && (
                  <div className="flex justify-between border-t pt-3 font-semibold">
                    <span>Total</span>
                    <span>
                      {formatCurrency(booking.pricing.total, booking.pricing.currency)}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">No pricing information</p>
            )}
          </CardContent>
        </Card>
      </div>

      {(booking.status === 'confirmed' || booking.status === 'checked-in') && (
        <Card>
          <CardHeader>
            <CardTitle>Assign Room</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[200px] flex-1">
                <Label htmlFor="roomId">Room</Label>
                <select
                  id="roomId"
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                >
                  <option value="">Select a room</option>
                  {(rooms ?? []).map((room) => {
                    const rid = getId(room as { id?: string; _id?: string })
                    const label =
                      getRefLabel(room as Record<string, unknown>) ||
                      String((room as Record<string, unknown>).number ?? rid)
                    return (
                      <option key={rid} value={rid}>
                        {label}
                      </option>
                    )
                  })}
                </select>
              </div>
              <Button
                disabled={!roomId || isPending}
                onClick={() => assignRoomMutation.mutate({ id, roomId })}
              >
                Assign Room
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(booking.specialRequests || booking.internalNotes) && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {booking.specialRequests && (
              <div>
                <p className="font-medium text-gray-700">Special Requests</p>
                <p className="mt-1 text-gray-600">{booking.specialRequests}</p>
              </div>
            )}
            {booking.internalNotes && (
              <div>
                <p className="font-medium text-gray-700">Internal Notes</p>
                <p className="mt-1 text-gray-600">{booking.internalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
