'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Check, ChevronLeft } from 'lucide-react';
import { propertyQueries } from '@/queries/properties.queries';
import { bookingQueries, addOnQueries, ratePlanQueries } from '@/queries/bookings.queries';
import { billingQueries } from '@/features/billing/queries';
import {
  bookingMutations,
  inventoryMutations,
  paymentMutations,
  promotionMutations,
} from '@/mutations/bookings.mutations';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import Spinner from '@/components/Spinner';
import StripePaymentForm from '@/components/StripePaymentForm';
import type { AvailabilityResult, Booking } from '@/types';
import { formatCurrency, formatDate, getId } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Step = 'dates' | 'availability' | 'guest' | 'hold' | 'booking' | 'payment' | 'confirmation';

const STEPS: Step[] = [
  'dates',
  'availability',
  'guest',
  'hold',
  'booking',
  'payment',
  'confirmation',
];

const STEP_LABELS: Record<Step, string> = {
  dates: 'Dates',
  availability: 'Room',
  guest: 'Guest',
  hold: 'Hold',
  booking: 'Review',
  payment: 'Payment',
  confirmation: 'Confirmed',
};

function StepRail({ stepIndex }: { stepIndex: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="Booking progress">
      {STEPS.filter((s) => s !== 'hold').map((step) => {
        const index = STEPS.indexOf(step);
        const done = index < stepIndex;
        const active = index === stepIndex;
        const visibleIndex = STEPS.filter((s) => s !== 'hold').indexOf(step);

        return (
          <li key={step} className="flex items-center gap-3">
            {visibleIndex > 0 && (
              <span
                aria-hidden
                className={cn('h-px w-5 sm:w-8', done || active ? 'bg-brand/40' : 'bg-line')}
              />
            )}
            <span
              className={cn(
                'flex items-center gap-2 text-xs',
                active ? 'text-ink' : done ? 'text-brand' : 'text-muted/70',
              )}
              aria-current={active ? 'step' : undefined}
            >
              <span
                aria-hidden
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border text-[10px]',
                  done
                    ? 'border-brand bg-brand text-surface-raised'
                    : active
                      ? 'border-brand text-brand'
                      : 'border-line',
                )}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={2} /> : visibleIndex + 1}
              </span>
              <span className="hidden sm:inline">{STEP_LABELS[step]}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Panel({
  title,
  description,
  children,
  aside,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="border-line bg-raised rounded-[4px] border shadow-[var(--shadow-soft)]">
      <header className="border-line border-b px-5 py-5 md:px-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl leading-snug md:text-2xl">{title}</h2>
            {description && (
              <p className="text-muted mt-1.5 text-sm leading-relaxed">{description}</p>
            )}
          </div>
          {aside}
        </div>
      </header>
      <div className="px-5 py-6 md:px-7 md:py-7">{children}</div>
    </section>
  );
}

function BookPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertySlug = String(params.propertySlug);

  const [step, setStep] = useState<Step>('dates');
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') ?? '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') ?? '');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<AvailabilityResult | null>(null);
  const [guestInfo, setGuestInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [holdId, setHoldId] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<number | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const sessionId = useMemo(
    () => (typeof crypto !== 'undefined' ? crypto.randomUUID() : `session-${Date.now()}`),
    [],
  );

  const propertyQuery = useQuery(propertyQueries.bySlug(propertySlug));

  const propertyId = propertyQuery.data ? getId(propertyQuery.data) : '';

  const availabilityQuery = useQuery({
    ...bookingQueries.availability({
      propertyId,
      checkIn,
      checkOut,
      adults: String(adults),
      children: String(children),
    }),
    enabled: step === 'availability' && !!propertyId,
  });

  const addOnsQuery = useQuery(addOnQueries.byProperty(propertyId));
  const ratePlansQuery = useQuery(ratePlanQueries.byRoomType(selectedRoom?.roomTypeId ?? ''));
  const walletQuery = useQuery(billingQueries.paymentMethods());

  const holdMutation = useMutation(inventoryMutations.hold());
  const createBookingMutation = useMutation(bookingMutations.create());
  const paymentIntentMutation = useMutation(paymentMutations.createIntent());
  const chargeSavedMutation = useMutation(paymentMutations.chargeSaved());
  const confirmPaymentMutation = useMutation(paymentMutations.confirm());

  const selectedRatePlan = (ratePlansQuery.data ?? []).find(
    (plan) => getId(plan) === selectedRoom?.ratePlanId,
  );
  const paymentPolicy = selectedRatePlan?.paymentPolicy ?? 'prepaid';
  const isDeposit = paymentPolicy === 'deposit';
  const validatePromoMutation = useMutation(promotionMutations.validate());

  useEffect(() => {
    if (step !== 'payment' || !booking || clientSecret || selectedSavedCard) return;
    paymentIntentMutation.mutate(
      { bookingId: getId(booking), isDeposit, saveCard },
      {
        onSuccess: (result) => {
          setClientSecret(result.data.clientSecret);
          setPaymentAmount(result.data.amount);
          setPaymentIntentId(result.data.paymentIntentId);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to initialize payment');
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, booking, clientSecret, selectedSavedCard]);

  const stepIndex = STEPS.indexOf(step);

  function goToAvailability() {
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    setStep('availability');
  }

  async function handleCreateHold() {
    if (!selectedRoom || !propertyId) return;

    try {
      const result = await holdMutation.mutateAsync({
        propertyId,
        roomTypeId: selectedRoom.roomTypeId,
        checkIn,
        checkOut,
        rooms: 1,
        sessionId,
      });
      setHoldId(result.data.holdId);
      setStep('booking');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to hold room');
    }
  }

  async function handleCreateBooking() {
    if (!selectedRoom || !propertyId || !holdId) return;
    if (!selectedRoom.ratePlanId) {
      toast.error('No rate plan available for this room');
      return;
    }

    try {
      const result = await createBookingMutation.mutateAsync({
        propertyId,
        roomTypeId: selectedRoom.roomTypeId,
        ratePlanId: selectedRoom.ratePlanId,
        checkIn,
        checkOut,
        adults,
        children,
        rooms: 1,
        guest: guestInfo,
        holdId,
        promotionCode: promoCode || undefined,
        addOns: selectedAddOns.map((addOnId) => ({ addOnId, quantity: 1 })),
      });
      setBooking(result.data);
      if (paymentPolicy === 'pay-at-hotel') {
        setStep('confirmation');
        toast.success('Reservation received. Pay at the hotel on arrival.');
      } else {
        setStep('payment');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
    }
  }

  async function handlePaymentSuccess(intentId: string) {
    if (!booking) return;
    const bookingId = getId(booking);

    try {
      await confirmPaymentMutation.mutateAsync({
        bookingId,
        paymentIntentId: intentId,
      });
      setStep('confirmation');
      toast.success('Payment successful — booking confirmed!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment confirmation failed');
    }
  }

  if (propertyQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (propertyQuery.isError || !propertyQuery.data) {
    return (
      <Container className="py-16">
        <EmptyState
          title="We could not find this property"
          description="The link may be out of date. Browse our stays and choose another."
          action={<Button href="/search">Browse stays</Button>}
        />
      </Container>
    );
  }

  const property = propertyQuery.data;

  return (
    <Container className="max-w-[1000px] py-10 md:py-14">
      <button
        type="button"
        onClick={() => router.back()}
        className="focus-ring text-muted hover:text-brand mb-6 inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ChevronLeft aria-hidden className="h-4 w-4" strokeWidth={1.5} />
        Back
      </button>

      <div className="border-line flex flex-col gap-6 border-b pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-brand/40 tabular font-serif text-2xl leading-none">—</p>
          <h1 className="text-title mt-2 text-balance">Book {property.name}</h1>
          <p className="text-muted mt-2 text-sm">
            Step {stepIndex + 1} of {STEPS.length} · {STEP_LABELS[step]}
          </p>
        </div>
        <StepRail stepIndex={stepIndex} />
      </div>

      <div className="mt-8">
        {step === 'dates' && (
          <Panel
            title="Select dates & guests"
            description="We will show what is available for these nights."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="checkIn">Check-in</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="checkOut">Check-out</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="adults">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min={1}
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="children">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min={0}
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                />
              </div>
            </div>
            <Button onClick={goToAvailability} className="mt-6">
              Check availability
            </Button>
          </Panel>
        )}

        {step === 'availability' && (
          <Panel
            title="Available rooms"
            description={`For ${checkIn ? formatDate(checkIn) : 'your dates'} – ${checkOut ? formatDate(checkOut) : ''}`}
          >
            {availabilityQuery.isLoading && (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            )}

            {availabilityQuery.data?.length === 0 && (
              <EmptyState
                title="No rooms for these dates"
                description="Try different dates, or speak with the concierge about a cancellation."
              />
            )}

            <div className="space-y-3" role="radiogroup" aria-label="Available rooms">
              {availabilityQuery.data?.map((room) => {
                const isSelected = selectedRoom?.roomTypeId === room.roomTypeId;

                return (
                  <button
                    key={room.roomTypeId}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedRoom(room)}
                    className={cn(
                      'focus-ring flex w-full items-start justify-between gap-4 rounded-[4px] border p-4 text-left transition-colors duration-200',
                      isSelected
                        ? 'border-brand bg-brand-soft/50'
                        : 'border-line hover:border-line-strong',
                    )}
                  >
                    <span className="min-w-0">
                      <span className="text-ink block font-medium">
                        {room.roomTypeName || 'Room'}
                      </span>
                      <span className="text-muted mt-1 block text-sm">
                        {room.availableRooms} available
                      </span>
                    </span>
                    {room.totalPrice != null && (
                      <span className="tabular text-brand shrink-0 font-serif text-xl leading-none">
                        {formatCurrency(room.totalPrice, room.currency ?? 'USD')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="secondary" onClick={() => setStep('dates')}>
                Back
              </Button>
              <Button disabled={!selectedRoom} onClick={() => setStep('guest')}>
                Continue
              </Button>
            </div>
          </Panel>
        )}

        {step === 'guest' && (
          <Panel title="Guest information" description="The details we need to hold your room.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={guestInfo.firstName}
                  onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={guestInfo.lastName}
                  onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="mt-5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={guestInfo.email}
                onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                required
              />
            </div>
            <div className="mt-5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
              />
            </div>
            <div className="mt-5">
              <Label htmlFor="promoCode">Promo code (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="promoCode"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="SAVE10"
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!promoCode || validatePromoMutation.isPending}
                  onClick={() =>
                    validatePromoMutation.mutate(promoCode, {
                      onSuccess: (res) => {
                        const discount = (res as { data?: { discountAmount?: number } })?.data
                          ?.discountAmount;
                        setPromoDiscount(discount ?? 0);
                        toast.success('Promo code applied');
                      },
                      onError: (err) => {
                        setPromoDiscount(null);
                        toast.error(err instanceof Error ? err.message : 'Invalid promo code');
                      },
                    })
                  }
                >
                  Apply
                </Button>
              </div>
              {promoDiscount != null && promoDiscount > 0 && (
                <p className="text-success mt-2 text-sm">
                  Discount: {formatCurrency(promoDiscount, selectedRoom?.currency ?? 'USD')}
                </p>
              )}
            </div>

            {addOnsQuery.data && addOnsQuery.data.length > 0 && (
              <fieldset className="border-line mt-6 border-t pt-5">
                <legend className="text-ink mb-3 text-sm font-medium">Add-ons (optional)</legend>
                <div className="space-y-2.5">
                  {addOnsQuery.data.map((addOn) => {
                    const addOnId = getId(addOn);
                    const price =
                      addOn.price ?? (addOn as { pricing?: { amount?: number } }).pricing?.amount;
                    return (
                      <label
                        key={addOnId}
                        className="focus-ring flex min-h-10 cursor-pointer items-center gap-3 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="accent-brand h-4 w-4"
                          checked={selectedAddOns.includes(addOnId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAddOns([...selectedAddOns, addOnId]);
                            } else {
                              setSelectedAddOns(selectedAddOns.filter((id) => id !== addOnId));
                            }
                          }}
                        />
                        <span className="text-ink flex-1">{addOn.name}</span>
                        {price != null && (
                          <span className="text-muted tabular text-xs">
                            {formatCurrency(price, 'USD')}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <div className="mt-7 flex gap-3">
              <Button variant="secondary" onClick={() => setStep('availability')}>
                Back
              </Button>
              <Button
                onClick={() => {
                  if (!guestInfo.email || !guestInfo.firstName || !guestInfo.lastName) {
                    toast.error('Please fill in all required fields');
                    return;
                  }
                  setStep('hold');
                  handleCreateHold();
                }}
              >
                Continue
              </Button>
            </div>
          </Panel>
        )}

        {step === 'hold' && (
          <Panel title="Holding your room">
            <div className="flex flex-col items-center py-12">
              <Spinner />
              <p className="text-muted mt-4 text-sm">
                Reserving your room for the next few minutes…
              </p>
            </div>
          </Panel>
        )}

        {step === 'booking' && (
          <Panel title="Confirm your booking" description="One last look before we create it.">
            <dl className="border-line divide-line divide-y border-y text-sm">
              {[
                { label: 'Property', value: property.name },
                { label: 'Room', value: selectedRoom?.roomTypeName || 'Selected room' },
                {
                  label: 'Dates',
                  value: `${formatDate(checkIn)} – ${formatDate(checkOut)}`,
                },
                {
                  label: 'Guests',
                  value: `${adults} adult${adults !== 1 ? 's' : ''}${
                    children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''
                  }`,
                },
              ].map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-muted">{row.label}</dt>
                  <dd className="text-ink text-right">{row.value}</dd>
                </div>
              ))}
              {selectedRoom?.totalPrice != null && (
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className="text-ink font-medium">Total</dt>
                  <dd className="tabular font-serif text-2xl leading-none">
                    {formatCurrency(selectedRoom.totalPrice, selectedRoom.currency ?? 'USD')}
                  </dd>
                </div>
              )}
            </dl>

            <Button
              onClick={handleCreateBooking}
              disabled={createBookingMutation.isPending}
              className="mt-6"
            >
              {createBookingMutation.isPending ? 'Creating booking…' : 'Confirm booking'}
            </Button>
          </Panel>
        )}

        {step === 'payment' && booking && (
          <Panel
            title="Payment"
            description="Secure checkout. Your card details never touch our servers."
          >
            <Alert variant="info" className="mb-5">
              Booking{' '}
              <strong className="font-medium">
                {booking.confirmationNumber || getId(booking)}
              </strong>{' '}
              is created. Complete payment to confirm your reservation.
            </Alert>

            {paymentIntentMutation.isPending && !clientSecret && (
              <div className="flex flex-col items-center py-10">
                <Spinner />
                <p className="text-muted mt-4 text-sm">Preparing secure payment…</p>
              </div>
            )}

            {(walletQuery.data?.paymentMethods.length ?? 0) > 0 && (
              <div className="space-y-3">
                <Label htmlFor="savedCard">Pay with a saved card</Label>
                <Select
                  id="savedCard"
                  value={selectedSavedCard}
                  onChange={(e) => {
                    setSelectedSavedCard(e.target.value);
                    setClientSecret(null);
                  }}
                >
                  <option value="">Use a new card</option>
                  {walletQuery.data?.paymentMethods.map((card) => (
                    <option key={getId(card)} value={getId(card)}>
                      {card.brand} •••• {card.last4}
                    </option>
                  ))}
                </Select>
                {selectedSavedCard && (
                  <Button
                    disabled={chargeSavedMutation.isPending}
                    onClick={async () => {
                      try {
                        const result = await chargeSavedMutation.mutateAsync({
                          bookingId: getId(booking),
                          paymentMethodId: selectedSavedCard,
                          isDeposit,
                        });
                        if (result.data.requiresAction && result.data.clientSecret) {
                          setClientSecret(result.data.clientSecret);
                          return;
                        }
                        setStep('confirmation');
                        toast.success('Payment successful — booking confirmed!');
                      } catch (err) {
                        toast.error(
                          err instanceof Error ? err.message : 'Saved card charge failed',
                        );
                      }
                    }}
                  >
                    {chargeSavedMutation.isPending ? 'Charging…' : 'Pay with saved card'}
                  </Button>
                )}
              </div>
            )}

            {!selectedSavedCard && (
              <label className="focus-ring mt-5 flex min-h-10 cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="accent-brand h-4 w-4"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                />
                Save this card for later
              </label>
            )}

            {clientSecret && paymentAmount != null && (
              <div className="border-line mt-6 border-t pt-6">
                <StripePaymentForm
                  clientSecret={clientSecret}
                  amount={paymentAmount}
                  currency={selectedRoom?.currency ?? property.settings?.currency ?? 'USD'}
                  onSuccess={handlePaymentSuccess}
                  onError={(msg) => toast.error(msg)}
                />
              </div>
            )}

            {paymentIntentMutation.isError && !clientSecret && !selectedSavedCard && (
              <Button
                className="mt-4"
                onClick={() => {
                  paymentIntentMutation.mutate(
                    { bookingId: getId(booking), isDeposit, saveCard },
                    {
                      onSuccess: (result) => {
                        setClientSecret(result.data.clientSecret);
                        setPaymentAmount(result.data.amount);
                        setPaymentIntentId(result.data.paymentIntentId);
                      },
                    },
                  );
                }}
              >
                Retry payment setup
              </Button>
            )}
          </Panel>
        )}

        {step === 'confirmation' && booking && (
          <Panel title="You are booked." description="A confirmation is on its way to your inbox.">
            <div className="border-line bg-brand-soft/40 rounded-[4px] border p-5">
              <p className="text-muted text-xs uppercase tracking-[0.14em]">Confirmation number</p>
              <p className="tabular mt-1 font-serif text-2xl">
                {booking.confirmationNumber || getId(booking)}
              </p>
              <p className="text-muted mt-3 text-sm">
                {formatDate(checkIn)} – {formatDate(checkOut)} at {property.name}
              </p>
              {paymentIntentId && <p className="text-success mt-2 text-sm">Payment received.</p>}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => router.push('/account/bookings')}>View my bookings</Button>
              <Button variant="secondary" onClick={() => router.push('/')}>
                Back to home
              </Button>
            </div>
          </Panel>
        )}
      </div>
    </Container>
  );
}

export default function BookPageRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      }
    >
      <BookPage />
    </Suspense>
  );
}
