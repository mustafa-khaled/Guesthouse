'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { SearchBar } from '@/components/guest/SearchBar'
import { PropertyCardGrid } from '@/components/guest/PropertyCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Spinner from '@/components/Spinner'
import { bookingQueries } from '@/queries/bookings.queries'
import { propertyQueries } from '@/queries/properties.queries'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'

function SearchResults() {
  const searchParams = useSearchParams()

  const checkIn = searchParams.get('checkIn') ?? ''
  const checkOut = searchParams.get('checkOut') ?? ''
  const adults = searchParams.get('adults') ?? '2'
  const children = searchParams.get('children') ?? '0'
  const propertyId = searchParams.get('propertyId') ?? ''
  const q = searchParams.get('q') ?? ''

  const availabilityQuery = useQuery(
    bookingQueries.availability({
      propertyId,
      checkIn,
      checkOut,
      adults,
      children,
    }),
  )

  const textSearchQuery = useQuery(propertyQueries.search(q))

  const isAvailabilitySearch = !!propertyId && !!checkIn && !!checkOut
  const isTextSearch = q.length >= 2 && !isAvailabilitySearch

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Search stays</h1>

      <div className="mb-8">
        <SearchBar
          defaultCheckIn={checkIn}
          defaultCheckOut={checkOut}
          defaultAdults={Number(adults)}
          defaultChildren={Number(children)}
        />
      </div>

      {isAvailabilitySearch && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Availability results</h2>
          {availabilityQuery.isLoading && (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          )}
          {availabilityQuery.isError && (
            <p className="text-red-600">
              {availabilityQuery.error instanceof Error
                ? availabilityQuery.error.message
                : 'Failed to load availability'}
            </p>
          )}
          {availabilityQuery.data && availabilityQuery.data.length === 0 && (
            <p className="text-gray-500">
              No rooms available for the selected dates.
            </p>
          )}
          {availabilityQuery.data && availabilityQuery.data.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availabilityQuery.data.map((result) => (
                <Card key={result.roomTypeId}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {result.roomTypeName || 'Room type'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {result.availableRooms} room
                      {result.availableRooms !== 1 ? 's' : ''} available
                    </p>
                    {result.totalPrice != null && (
                      <p className="text-lg font-semibold text-green-700">
                        {formatCurrency(
                          result.totalPrice,
                          result.currency ?? 'USD',
                        )}
                        <span className="text-sm font-normal text-gray-500">
                          {' '}
                          total
                        </span>
                      </p>
                    )}
                    {result.pricePerNight != null && (
                      <p className="text-sm text-gray-500">
                        {formatCurrency(
                          result.pricePerNight,
                          result.currency ?? 'USD',
                        )}{' '}
                        / night
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {isTextSearch && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Results for &ldquo;{q}&rdquo;
          </h2>
          {textSearchQuery.isLoading && (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          )}
          {textSearchQuery.isError && (
            <p className="text-red-600">
              {textSearchQuery.error instanceof Error
                ? textSearchQuery.error.message
                : 'Search failed'}
            </p>
          )}
          {textSearchQuery.data?.items && (
            <>
              {textSearchQuery.data.items.length === 0 ? (
                <p className="text-gray-500">No properties found.</p>
              ) : (
                <PropertyCardGrid properties={textSearchQuery.data.items} />
              )}
            </>
          )}
        </section>
      )}

      {!isAvailabilitySearch && !isTextSearch && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-600">
            Enter dates above to search availability, or add{' '}
            <code className="rounded bg-gray-100 px-1">?q=</code> to the URL for
            property search.
          </p>
          <form
            className="mx-auto mt-6 flex max-w-md gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const query = String(fd.get('q') ?? '')
              if (query) {
                window.location.href = `/search?q=${encodeURIComponent(query)}`
              }
            }}
          >
            <input
              name="q"
              type="search"
              placeholder="Search by name or location..."
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  )
}
