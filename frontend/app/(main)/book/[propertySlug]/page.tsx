'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { propertyQueries } from '@/queries/properties.queries'
import { bookingQueries } from '@/queries/bookings.queries'
import {
  bookingMutations,
  inventoryMutations,
  paymentMutations,
} from '@/mutations/bookings.mutations'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Spinner from '@/components/Spinner'
import type { AvailabilityResult, Booking } from '@/types'
import { formatCurrency, formatDate, getId } from '@/lib/utils'

type Step =
  | 'dates'
  | 'availability'
  | 'guest'
  | 'hold'
  | 'booking'
  | 'payment'
  | 'confirmation'

const STEPS: Step[] = [
  'dates',
  'availability',
  'guest',
  'hold',
  'booking',
  'payment',
  'confirmation',
]

export default function BookPage() {
  const params = useParams()
  const router = useRouter()
  const propertySlug = String(params.propertySlug)

  const [step, setStep] = useState<Step>('dates')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState<AvailabilityResult | null>(
    null,
  )
  const [guestInfo, setGuestInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  })
  const [holdId, setHoldId] = useState<string | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const sessionId = useMemo(
    () =>
      typeof crypto !== 'undefined'
        ? crypto.randomUUID()
        : `session-${Date.now()}`,
    [],
  )

  const propertyQuery = useQuery(propertyQueries.bySlug(propertySlug))

  const propertyId = propertyQuery.data ? getId(propertyQuery.data) : ''

  const availabilityQuery = useQuery({
    ...bookingQueries.availability({
      propertyId,
      checkIn,
      checkOut,
      adults: String(adults),
      children: String(children),
    }),
    enabled: step === 'availability' && !!propertyId,
  })

  const holdMutation = useMutation(inventoryMutations.hold())
  const createBookingMutation = useMutation(bookingMutations.create())
  const paymentIntentMutation = useMutation(paymentMutations.createIntent())

  const stepIndex = STEPS.indexOf(step)

  function goToAvailability() {
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }
    setStep('availability')
  }

  async function handleCreateHold() {
    if (!selectedRoom || !propertyId) return

    try {
      const result = await holdMutation.mutateAsync({
        propertyId,
        roomTypeId: selectedRoom.roomTypeId,
        checkIn,
        checkOut,
        rooms: 1,
        sessionId,
      })
      setHoldId(result.data.holdId)
      setStep('booking')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to hold room')
    }
  }

  async function handleCreateBooking() {
    if (!selectedRoom || !propertyId || !holdId) return
    if (!selectedRoom.ratePlanId) {
      toast.error('No rate plan available for this room')
      return
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
      })
      setBooking(result.data)
      setStep('payment')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Booking failed')
    }
  }

  async function handlePaymentIntent() {
    if (!booking) return
    const bookingId = getId(booking)

    try {
      const result = await paymentIntentMutation.mutateAsync(bookingId)
      setClientSecret(result.data.clientSecret)
      setStep('confirmation')
      toast.success('Booking confirmed — payment setup ready')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Payment setup failed',
      )
    }
  }

  if (propertyQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (propertyQuery.isError || !propertyQuery.data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-600">Property not found.</p>
        <Button className="mt-4" onClick={() => router.push('/')}>
          Back to home
        </Button>
      </div>
    )
  }

  const property = propertyQuery.data

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Book {property.name}</h1>
      <p className="mb-8 text-gray-600">
        Step {stepIndex + 1} of {STEPS.length}
      </p>

      <div className="mb-8 flex gap-1">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded ${
              i <= stepIndex ? 'bg-green-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {step === 'dates' && (
        <Card>
          <CardHeader>
            <CardTitle>Select dates & guests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
            <Button onClick={goToAvailability}>Check availability</Button>
          </CardContent>
        </Card>
      )}

      {step === 'availability' && (
        <Card>
          <CardHeader>
            <CardTitle>Available rooms</CardTitle>
          </CardHeader>
          <CardContent>
            {availabilityQuery.isLoading && (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            )}
            {availabilityQuery.data?.length === 0 && (
              <p className="text-gray-500">
                No rooms available. Try different dates.
              </p>
            )}
            <div className="space-y-3">
              {availabilityQuery.data?.map((room) => (
                <button
                  key={room.roomTypeId}
                  type="button"
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    selectedRoom?.roomTypeId === room.roomTypeId
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {room.roomTypeName || 'Room'}
                    </span>
                    {room.totalPrice != null && (
                      <span className="font-semibold text-green-700">
                        {formatCurrency(room.totalPrice, room.currency ?? 'USD')}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {room.availableRooms} available
                  </p>
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setStep('dates')}>
                Back
              </Button>
              <Button
                disabled={!selectedRoom}
                onClick={() => setStep('guest')}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'guest' && (
        <Card>
          <CardHeader>
            <CardTitle>Guest information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={guestInfo.firstName}
                  onChange={(e) =>
                    setGuestInfo({ ...guestInfo, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={guestInfo.lastName}
                  onChange={(e) =>
                    setGuestInfo({ ...guestInfo, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={guestInfo.email}
                onChange={(e) =>
                  setGuestInfo({ ...guestInfo, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={guestInfo.phone}
                onChange={(e) =>
                  setGuestInfo({ ...guestInfo, phone: e.target.value })
                }
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('availability')}>
                Back
              </Button>
              <Button
                onClick={() => {
                  if (
                    !guestInfo.email ||
                    !guestInfo.firstName ||
                    !guestInfo.lastName
                  ) {
                    toast.error('Please fill in all required fields')
                    return
                  }
                  setStep('hold')
                  handleCreateHold()
                }}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'hold' && (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Spinner />
            <p className="mt-4 text-gray-600">Reserving your room...</p>
          </CardContent>
        </Card>
      )}

      {step === 'booking' && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 text-sm">
              <p>
                <strong>Property:</strong> {property.name}
              </p>
              <p>
                <strong>Room:</strong>{' '}
                {selectedRoom?.roomTypeName || 'Selected room'}
              </p>
              <p>
                <strong>Dates:</strong> {formatDate(checkIn)} –{' '}
                {formatDate(checkOut)}
              </p>
              <p>
                <strong>Guests:</strong> {adults} adult
                {adults !== 1 ? 's' : ''}
                {children > 0 && `, ${children} child${children !== 1 ? 'ren' : ''}`}
              </p>
              {selectedRoom?.totalPrice != null && (
                <p className="mt-2 text-lg font-semibold text-green-700">
                  Total:{' '}
                  {formatCurrency(
                    selectedRoom.totalPrice,
                    selectedRoom.currency ?? 'USD',
                  )}
                </p>
              )}
            </div>
            <Button
              onClick={handleCreateBooking}
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending
                ? 'Creating booking...'
                : 'Confirm booking'}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'payment' && booking && (
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Booking{' '}
              <strong>{booking.confirmationNumber || getId(booking)}</strong>{' '}
              created. Set up payment to complete your reservation.
            </p>
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-500">
                Stripe payment form placeholder
              </p>
            </div>
            <Button
              onClick={handlePaymentIntent}
              disabled={paymentIntentMutation.isPending}
            >
              {paymentIntentMutation.isPending
                ? 'Setting up payment...'
                : 'Initialize payment'}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'confirmation' && booking && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">
              Booking confirmed!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Confirmation number:{' '}
              <strong>{booking.confirmationNumber || getId(booking)}</strong>
            </p>
            <p className="text-gray-600">
              {formatDate(checkIn)} – {formatDate(checkOut)} at {property.name}
            </p>
            {clientSecret && (
              <p className="text-xs text-gray-400">
                Payment intent ready (client secret received)
              </p>
            )}
            <div className="flex gap-3">
              <Button onClick={() => router.push('/account/bookings')}>
                View my bookings
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                Back to home
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
