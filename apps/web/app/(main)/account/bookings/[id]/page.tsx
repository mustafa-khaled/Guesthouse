'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CalendarDays, Receipt } from 'lucide-react';
import { bookingQueries, folioQueries } from '@/queries/bookings.queries';
import { bookingMutations, bookingDateMutations } from '@/mutations/bookings.mutations';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
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

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-muted text-sm">{label}</dt>
      <dd className="text-ink text-right text-sm">{value}</dd>
    </div>
  );
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
      <Container className="py-12 md:py-16">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-72" />
        <Skeleton className="mt-10 h-64 w-full" />
      </Container>
    );
  }

  if (isError || !booking) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<CalendarDays />}
          title="We could not find this booking"
          description="The link may be out of date. Head back to your bookings to find it."
          action={<Button href="/account/bookings">Back to bookings</Button>}
        />
      </Container>
    );
  }

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canReview = booking.status === 'checked-out';
  const folioLines = folio?.lineItems ?? folio?.entries ?? [];

  return (
    <Container className="max-w-[980px] py-12 md:py-16">
      <PageHeader
        folio="—"
        title={booking.confirmationNumber || getId(booking)}
        description={`${getPropertyName(booking.propertyId)} · ${formatDate(booking.checkIn)} – ${formatDate(booking.checkOut)}`}
        backHref="/account/bookings"
        backLabel="My bookings"
        actions={<BookingStatusBadge status={booking.status} />}
      />

      <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <h2 className="text-brand text-xs font-medium uppercase tracking-[0.16em]">Your stay</h2>
          <dl className="border-line divide-line mt-3 divide-y border-y">
            <DetailRow label="Property" value={getPropertyName(booking.propertyId)} />
            <DetailRow label="Check-in" value={formatDate(booking.checkIn)} />
            <DetailRow label="Check-out" value={formatDate(booking.checkOut)} />
            <DetailRow
              label="Guests"
              value={`${booking.adults} adult${booking.adults !== 1 ? 's' : ''}${
                booking.children
                  ? `, ${booking.children} child${booking.children !== 1 ? 'ren' : ''}`
                  : ''
              }`}
            />
            {booking.pricing?.total != null && (
              <DetailRow
                label="Total"
                value={
                  <span className="tabular font-serif text-lg leading-none">
                    {formatCurrency(booking.pricing.total, booking.pricing.currency ?? 'USD')}
                  </span>
                }
              />
            )}
            {booking.specialRequests && (
              <DetailRow label="Special requests" value={booking.specialRequests} />
            )}
          </dl>

          {folio && (
            <section className="mt-10" aria-labelledby="folio-heading">
              <h2
                id="folio-heading"
                className="text-brand flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em]"
              >
                <Receipt aria-hidden className="h-3.5 w-3.5" strokeWidth={1.5} />
                Folio {folio.folioNumber ?? ''}
              </h2>
              <dl className="border-line divide-line mt-3 divide-y border-y">
                {folioLines.map((item, index) => (
                  <div key={index} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-muted text-sm">{item.description}</dt>
                    <dd className="text-ink tabular text-sm">{formatCurrency(item.amount)}</dd>
                  </div>
                ))}
                {folio.balance != null && (
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-ink text-sm font-medium">Balance</dt>
                    <dd className="tabular font-serif text-lg leading-none">
                      {formatCurrency(folio.balance)}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {canReview && (
            <Button className="mt-8" href={`/review/${bookingId}`}>
              Write a review
            </Button>
          )}
        </div>

        <aside className="md:col-span-5">
          {canCancel ? (
            <div className="space-y-4">
              <section className="border-line rounded-[4px] border p-5">
                <h2 className="font-serif text-xl leading-snug">Change dates</h2>
                <p className="text-muted mt-1.5 text-sm leading-relaxed">
                  Subject to availability. Leave a field blank to keep it as is.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <Label htmlFor="newCheckIn">New check-in</Label>
                    <Input
                      id="newCheckIn"
                      type="date"
                      value={newCheckIn}
                      onChange={(e) => setNewCheckIn(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newCheckOut">New check-out</Label>
                    <Input
                      id="newCheckOut"
                      type="date"
                      value={newCheckOut}
                      onChange={(e) => setNewCheckOut(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={modifyMutation.isPending || (!newCheckIn && !newCheckOut)}
                    onClick={() =>
                      modifyMutation.mutate({
                        id: bookingId,
                        checkIn: newCheckIn || undefined,
                        checkOut: newCheckOut || undefined,
                      })
                    }
                  >
                    {modifyMutation.isPending ? 'Updating…' : 'Update dates'}
                  </Button>
                </div>
              </section>

              <section className="border-danger/20 bg-danger-tint/40 rounded-[4px] border p-5">
                <h2 className="text-danger font-serif text-lg leading-snug">Cancel this stay</h2>
                <p className="text-danger/80 mt-1.5 text-sm leading-relaxed">
                  Free cancellation applies up to 48 hours before arrival. After that, the policy on
                  your rate applies.
                </p>
                <Button
                  variant="destructive"
                  className="mt-4 w-full"
                  disabled={cancelMutation.isPending}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to cancel this booking?')) {
                      cancelMutation.mutate({ id: bookingId });
                    }
                  }}
                >
                  {cancelMutation.isPending ? 'Cancelling…' : 'Cancel booking'}
                </Button>
              </section>
            </div>
          ) : (
            <Alert variant="info" title="Need to change something?">
              This booking can no longer be modified online. Contact the concierge and we will look
              after it.
            </Alert>
          )}

          <Spinner className="hidden" />
        </aside>
      </div>
    </Container>
  );
}
