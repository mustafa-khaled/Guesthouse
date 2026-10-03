'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bookingQueries, folioQueries } from '@/queries/bookings.queries';
import { bookingMutations, bookingDateMutations } from '@/mutations/bookings.mutations';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Spinner from '@/components/Spinner';
import { formatCurrency, formatDate, getId } from '@/lib/utils';
import type { Property } from '@/types';

function getPropertyName(propertyId: unknown): string {
  if (typeof propertyId === 'string') return 'Property';
  if (propertyId && typeof propertyId === 'object' && 'name' in propertyId) {
    return String((propertyId as Property).name);
  }
  return 'Property';
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bookingId = String(params.id);
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');

  const { data: booking, isLoading, isError } = useQuery(bookingQueries.detail(bookingId));
  const { data: folio } = useQuery(folioQueries.byBooking(bookingId));

  const modifyMutation = useMutation({
    ...bookingDateMutations.modify(),
    onSuccess: () => {
      toast.success('Dates updated');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not change dates'),
  });

  const cancelMutation = useMutation({
    ...bookingMutations.cancel(),
    onSuccess: () => {
      toast.success('Booking cancelled');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      router.push('/account/bookings');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Cancellation failed');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-600">Booking not found.</p>
        <Link href="/account/bookings" className="mt-4 inline-block text-green-700">
          ← Back to bookings
        </Link>
      </div>
    );
  }

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canReview = booking.status === 'checked-out';
  const folioLines = folio?.lineItems ?? folio?.entries ?? [];

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
          <CardTitle>{booking.confirmationNumber || getId(booking)}</CardTitle>
          <BookingStatusBadge status={booking.status} />
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <span className="text-gray-500">Property:</span> {getPropertyName(booking.propertyId)}
          </p>
          <p>
            <span className="text-gray-500">Check-in:</span> {formatDate(booking.checkIn)}
          </p>
          <p>
            <span className="text-gray-500">Check-out:</span> {formatDate(booking.checkOut)}
          </p>
          <p>
            <span className="text-gray-500">Guests:</span> {booking.adults} adult
            {booking.adults !== 1 ? 's' : ''}
            {booking.children
              ? `, ${booking.children} child${booking.children !== 1 ? 'ren' : ''}`
              : ''}
          </p>
          {booking.pricing?.total != null && (
            <p>
              <span className="text-gray-500">Total:</span>{' '}
              {formatCurrency(booking.pricing.total, booking.pricing.currency ?? 'USD')}
            </p>
          )}
          {booking.specialRequests && (
            <p>
              <span className="text-gray-500">Special requests:</span> {booking.specialRequests}
            </p>
          )}

          {folio && (
            <div className="mt-4 space-y-2 border-t pt-4">
              <p className="font-medium">Folio {folio.folioNumber ?? ''}</p>
              {folioLines.map((item, index) => (
                <div key={index} className="flex justify-between text-gray-600">
                  <span>{item.description}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))}
              {folio.balance != null && (
                <p className="font-medium">Balance: {formatCurrency(folio.balance)}</p>
              )}
            </div>
          )}

          {canCancel && (
            <div className="mt-4 space-y-2 border-t pt-4">
              <p className="font-medium">Change dates</p>
              <Label htmlFor="newCheckIn">Check-in</Label>
              <Input
                id="newCheckIn"
                type="date"
                value={newCheckIn}
                onChange={(e) => setNewCheckIn(e.target.value)}
              />
              <Label htmlFor="newCheckOut">Check-out</Label>
              <Input
                id="newCheckOut"
                type="date"
                value={newCheckOut}
                onChange={(e) => setNewCheckOut(e.target.value)}
              />
              <Button
                variant="outline"
                disabled={modifyMutation.isPending || (!newCheckIn && !newCheckOut)}
                onClick={() =>
                  modifyMutation.mutate({
                    id: bookingId,
                    checkIn: newCheckIn || undefined,
                    checkOut: newCheckOut || undefined,
                  })
                }
              >
                {modifyMutation.isPending ? 'Updating...' : 'Update dates'}
              </Button>
            </div>
          )}

          {canReview && (
            <Button className="mt-4" href={`/review/${bookingId}`}>
              Write a review
            </Button>
          )}

          {canCancel && (
            <Button
              variant="destructive"
              className="mt-4"
              disabled={cancelMutation.isPending}
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this booking?')) {
                  cancelMutation.mutate({ id: bookingId });
                }
              }}
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel booking'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
