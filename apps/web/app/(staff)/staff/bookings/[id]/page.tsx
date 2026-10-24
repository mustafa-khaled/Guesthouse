'use client';

import { use, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CalendarDays } from 'lucide-react';
import { bookingQueries } from '@/queries/bookings.queries';
import { folioQueries, paymentQueries } from '@/features/booking/queries';
import { roomQueries } from '@/queries/staff.queries';
import { bookingMutations, bookingDateMutations } from '@/mutations/bookings.mutations';
import { useAuth } from '@/hooks/useAuth';
import { staffPaymentMutations } from '@/features/staff/payment-mutations';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Select } from '@/components/ui/select';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import Spinner from '@/components/Spinner';
import { formatCurrency, formatDate, getId, getRefLabel } from '@/lib/utils';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-muted text-sm">{label}</dt>
      <dd className="text-ink text-right text-sm">{value}</dd>
    </div>
  );
}

function Section({
  title,
  description,
  children,
  id,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section className="border-line border-t pt-6" aria-labelledby={id}>
      <h2 id={id} className="font-serif text-xl leading-snug">
        {title}
      </h2>
      {description && <p className="text-muted mt-1.5 text-sm leading-relaxed">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function StaffBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [roomId, setRoomId] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [chargeDescription, setChargeDescription] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const { hasRole } = useAuth();
  const canRefund = hasRole('moderator');

  const { data: booking, isLoading, isError, error } = useQuery(bookingQueries.detail(id));
  const { data: folio } = useQuery(folioQueries.byBooking(id));
  const { data: payments } = useQuery(paymentQueries.byBooking(id));

  const propertyId =
    typeof booking?.propertyId === 'string'
      ? booking.propertyId
      : getId(booking?.propertyId as { id?: string; _id?: string });

  const { data: rooms } = useQuery(roomQueries.byProperty(propertyId));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['front-desk'] });
  };

  const confirmMutation = useMutation({
    ...bookingMutations.confirm(),
    onSuccess: () => {
      toast.success('Booking confirmed');
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to confirm'),
  });

  const checkInMutation = useMutation({
    ...bookingMutations.checkIn(),
    onSuccess: () => {
      toast.success('Guest checked in');
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to check in'),
  });

  const cancelMutation = useMutation({
    ...bookingMutations.cancel(),
    onSuccess: () => {
      toast.success('Booking cancelled');
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Cancel failed'),
  });

  const modifyMutation = useMutation({
    ...bookingDateMutations.modify(),
    onSuccess: () => {
      toast.success('Dates updated');
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not change dates'),
  });

  const chargeMutation = useMutation({
    ...staffPaymentMutations.addFolioCharge(),
    onSuccess: () => {
      toast.success('Charge added');
      setChargeDescription('');
      setChargeAmount('');
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['folio', id] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Charge failed'),
  });

  const checkOutMutation = useMutation({
    ...bookingMutations.checkOut(),
    onSuccess: () => {
      toast.success('Guest checked out');
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to check out'),
  });

  const assignRoomMutation = useMutation({
    ...bookingMutations.assignRoom(),
    onSuccess: () => {
      toast.success('Room assigned');
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to assign room'),
  });

  const cashPaymentMutation = useMutation({
    ...staffPaymentMutations.recordCash(),
    onSuccess: () => {
      toast.success('Cash payment recorded');
      setCashAmount('');
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['folio', id] });
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Payment failed'),
  });

  const refundMutation = useMutation({
    ...staffPaymentMutations.refund(),
    onSuccess: () => {
      toast.success('Refund processed');
      setRefundAmount('');
      setRefundReason('');
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['folio', id] });
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Refund failed'),
  });

  const isPending =
    confirmMutation.isPending ||
    checkInMutation.isPending ||
    checkOutMutation.isPending ||
    assignRoomMutation.isPending ||
    cashPaymentMutation.isPending ||
    refundMutation.isPending ||
    cancelMutation.isPending ||
    modifyMutation.isPending ||
    chargeMutation.isPending;

  if (isLoading) return <Spinner />;

  if (isError || !booking) {
    return (
      <Container className="max-w-none px-0 sm:px-0 lg:px-0">
        <EmptyState
          icon={<CalendarDays />}
          title="Booking not found"
          description={
            error instanceof Error ? error.message : 'This reservation may have been removed.'
          }
          action={<Button href="/staff/bookings">Back to bookings</Button>}
        />
      </Container>
    );
  }

  const assignedRoomId =
    typeof booking.assignedRoomId === 'string'
      ? booking.assignedRoomId
      : getId(booking.assignedRoomId as { id?: string; _id?: string });

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title={booking.confirmationNumber || `Booking ${getId(booking).slice(-8)}`}
        description={`${getRefLabel(booking.guestId as never)} · ${formatDate(booking.checkIn)} – ${formatDate(booking.checkOut)}`}
        backHref="/staff/bookings"
        backLabel="Bookings"
        actions={
          <>
            {booking.status === 'pending' && (
              <Button disabled={isPending} onClick={() => confirmMutation.mutate(id)}>
                Confirm
              </Button>
            )}
            {booking.status === 'confirmed' && (
              <Button
                disabled={isPending || !roomId}
                onClick={() => checkInMutation.mutate({ id, roomId })}
              >
                Check in
              </Button>
            )}
            {(booking.status === 'pending' || booking.status === 'confirmed') && (
              <Button
                variant="secondary"
                disabled={isPending}
                onClick={() => {
                  if (window.confirm('Cancel this booking?')) {
                    cancelMutation.mutate({ id });
                  }
                }}
              >
                Cancel
              </Button>
            )}
            {booking.status === 'checked-in' && (
              <Button disabled={isPending} onClick={() => checkOutMutation.mutate(id)}>
                Check out
              </Button>
            )}
          </>
        }
      />

      <div className="mt-4">
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-12">
        <Section title="Stay details" id="stay-details">
          <dl className="border-line divide-line divide-y border-y">
            <DetailRow label="Guest" value={getRefLabel(booking.guestId as never)} />
            <DetailRow label="Property" value={getRefLabel(booking.propertyId as never)} />
            <DetailRow label="Room type" value={getRefLabel(booking.roomTypeId as never)} />
            <DetailRow label="Check-in" value={formatDate(booking.checkIn)} />
            <DetailRow label="Check-out" value={formatDate(booking.checkOut)} />
            <DetailRow
              label="Guests"
              value={`${booking.adults} adult${booking.adults !== 1 ? 's' : ''}${
                booking.children ? `, ${booking.children} child` : ''
              }`}
            />
            {assignedRoomId && (
              <DetailRow
                label="Assigned room"
                value={getRefLabel(booking.assignedRoomId as never) || assignedRoomId}
              />
            )}
          </dl>
        </Section>

        <Section title="Pricing" id="pricing">
          {booking.pricing ? (
            <dl className="border-line divide-line divide-y border-y">
              {booking.pricing.subtotal != null && (
                <DetailRow
                  label="Subtotal"
                  value={formatCurrency(booking.pricing.subtotal, booking.pricing.currency)}
                />
              )}
              {booking.pricing.tax != null && (
                <DetailRow
                  label="Tax"
                  value={formatCurrency(booking.pricing.tax, booking.pricing.currency)}
                />
              )}
              {booking.pricing.total != null && (
                <DetailRow
                  label="Total"
                  value={
                    <span className="tabular font-serif text-lg leading-none">
                      {formatCurrency(booking.pricing.total, booking.pricing.currency)}
                    </span>
                  }
                />
              )}
            </dl>
          ) : (
            <p className="text-muted text-sm">No pricing information on this booking.</p>
          )}
        </Section>
      </div>

      {(booking.status === 'confirmed' || booking.status === 'checked-in') && (
        <div className="mt-10">
          <Section
            title="Assign room"
            description="Choose the physical room this guest will use."
            id="assign-room"
          >
            <div className="flex max-w-xl flex-wrap items-end gap-3">
              <div className="min-w-[200px] flex-1">
                <Label htmlFor="roomId">Room</Label>
                <Select id="roomId" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                  <option value="">Select a room</option>
                  {(rooms ?? []).map((room) => {
                    const rid = getId(room as { id?: string; _id?: string });
                    const label =
                      getRefLabel(room as Record<string, unknown>) ||
                      String((room as Record<string, unknown>).number ?? rid);
                    return (
                      <option key={rid} value={rid}>
                        {label}
                      </option>
                    );
                  })}
                </Select>
              </div>
              <Button
                disabled={!roomId || isPending}
                onClick={() => assignRoomMutation.mutate({ id, roomId })}
              >
                Assign room
              </Button>
            </div>
          </Section>
        </div>
      )}

      {(booking.specialRequests || booking.internalNotes) && (
        <div className="mt-10">
          <Section title="Notes" id="booking-notes">
            <div className="space-y-5 text-sm">
              {booking.specialRequests && (
                <div>
                  <p className="text-ink font-medium">Special requests</p>
                  <p className="text-muted mt-1 leading-relaxed">{booking.specialRequests}</p>
                </div>
              )}
              {booking.internalNotes && (
                <div>
                  <p className="text-ink font-medium">Internal notes</p>
                  <p className="text-muted mt-1 leading-relaxed">{booking.internalNotes}</p>
                </div>
              )}
            </div>
          </Section>
        </div>
      )}

      <div className="mt-10">
        <Section title="Folio & payments" id="folio">
          {folio ? (
            <dl className="border-line divide-line divide-y border-y text-sm">
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-ink font-medium">Folio balance</dt>
                <dd className="tabular font-serif text-lg leading-none">
                  {formatCurrency(folio.balance ?? 0)}
                </dd>
              </div>
              {(folio.lineItems ?? folio.entries ?? []).map((item, idx) => (
                <div key={idx} className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-muted">{item.description}</dt>
                  <dd className="text-ink tabular">{formatCurrency(item.amount)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-muted text-sm">No folio has been opened for this booking yet.</p>
          )}

          {payments && payments.length > 0 && (
            <div className="mt-8">
              <h3 className="text-brand text-xs font-medium uppercase tracking-[0.16em]">
                Payment history
              </h3>
              <ul className="border-line divide-line mt-3 divide-y border-y text-sm">
                {payments.map((p) => (
                  <li
                    key={p.id ?? p._id}
                    className="flex items-baseline justify-between gap-4 py-3"
                  >
                    <span className="text-muted capitalize">
                      {p.method} — {p.status}
                    </span>
                    <span className="text-ink tabular">{formatCurrency(p.amount, p.currency)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-line mt-8 grid gap-8 border-t pt-6 sm:grid-cols-2">
            <div>
              <h3 className="text-ink text-sm font-medium">Change dates</h3>
              <p className="text-muted mt-1 text-xs">Leave a field blank to keep it as is.</p>
              <div className="mt-3 space-y-3">
                <div>
                  <Label htmlFor="staffCheckIn">New check-in</Label>
                  <Input
                    id="staffCheckIn"
                    type="date"
                    value={newCheckIn}
                    onChange={(e) => setNewCheckIn(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="staffCheckOut">New check-out</Label>
                  <Input
                    id="staffCheckOut"
                    type="date"
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isPending || (!newCheckIn && !newCheckOut)}
                  onClick={() =>
                    modifyMutation.mutate({
                      id,
                      checkIn: newCheckIn || undefined,
                      checkOut: newCheckOut || undefined,
                    })
                  }
                >
                  Update dates
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-ink text-sm font-medium">Add folio charge</h3>
              <p className="text-muted mt-1 text-xs">Minibar, spa, or any incidental.</p>
              <div className="mt-3 space-y-3">
                <div>
                  <Label htmlFor="folioCharge">Description</Label>
                  <Input
                    id="folioCharge"
                    value={chargeDescription}
                    onChange={(e) => setChargeDescription(e.target.value)}
                    placeholder="Minibar"
                  />
                </div>
                <div>
                  <Label htmlFor="folioChargeAmount">Amount</Label>
                  <Input
                    id="folioChargeAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <Button
                  size="sm"
                  disabled={!chargeDescription || !chargeAmount || isPending}
                  onClick={() =>
                    chargeMutation.mutate({
                      bookingId: id,
                      description: chargeDescription,
                      amount: parseFloat(chargeAmount),
                      category: 'fee',
                    })
                  }
                >
                  Add charge
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-ink text-sm font-medium">Record cash payment</h3>
              <p className="text-muted mt-1 text-xs">For payments taken at the desk.</p>
              <div className="mt-3 space-y-3">
                <div>
                  <Label htmlFor="cashAmount">Amount</Label>
                  <Input
                    id="cashAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <Button
                  size="sm"
                  disabled={!cashAmount || isPending}
                  onClick={() =>
                    cashPaymentMutation.mutate({
                      bookingId: id,
                      amount: parseFloat(cashAmount),
                    })
                  }
                >
                  Record cash
                </Button>
              </div>
            </div>

            {canRefund && (
              <div>
                <h3 className="text-danger text-sm font-medium">Process refund</h3>
                <p className="text-muted mt-1 text-xs">Refunds are recorded against this folio.</p>
                <div className="mt-3 space-y-3">
                  <div>
                    <Label htmlFor="refundAmount">Amount</Label>
                    <Input
                      id="refundAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="refundReason">Reason (optional)</Label>
                    <Input
                      id="refundReason"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Late cancellation"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={!refundAmount || isPending}
                    onClick={() =>
                      refundMutation.mutate({
                        bookingId: id,
                        amount: parseFloat(refundAmount),
                        reason: refundReason || undefined,
                      })
                    }
                  >
                    Process refund
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>
    </Container>
  );
}
