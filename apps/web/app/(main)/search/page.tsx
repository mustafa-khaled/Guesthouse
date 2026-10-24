'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, BedDouble } from 'lucide-react';
import { SearchBar } from '@/features/properties/components/SearchBar';
import { PropertyCardGrid } from '@/features/properties/components/PropertyCard';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { Photo } from '@/components/ui/photo';
import { Skeleton } from '@/components/ui/skeleton';
import Spinner from '@/components/Spinner';
import { bookingQueries } from '@/queries/bookings.queries';
import { propertyQueries } from '@/queries/properties.queries';
import { formatCurrency } from '@/lib/utils';
import { photography } from '@/lib/content';

function ResultSkeleton() {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index}>
          <Skeleton className="aspect-[4/3] w-full" />
          <Skeleton className="mt-4 h-4 w-3/5" />
          <Skeleton className="mt-2 h-3 w-2/5" />
        </div>
      ))}
    </div>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();

  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const adults = searchParams.get('adults') ?? '2';
  const children = searchParams.get('children') ?? '0';
  const propertyId = searchParams.get('propertyId') ?? '';
  const q = searchParams.get('q') ?? '';

  const availabilityQuery = useQuery(
    bookingQueries.availability({ propertyId, checkIn, checkOut, adults, children }),
  );

  const textSearchQuery = useQuery(propertyQueries.search(q));

  const isAvailabilitySearch = !!propertyId && !!checkIn && !!checkOut;
  const isTextSearch = q.length >= 2 && !isAvailabilitySearch;

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Number.isFinite(diff) ? Math.max(0, Math.round(diff / 86_400_000)) : 0;
  }, [checkIn, checkOut]);

  return (
    <>
      <PageHeader
        folio="01"
        title={isTextSearch ? `Stays matching “${q}”` : 'Find your stay'}
        description="Choose your dates, and we will show you the rooms that hold the light — from garden sanctuaries to horizon suites."
      />

      <div className="mt-10">
        <SearchBar
          defaultCheckIn={checkIn}
          defaultCheckOut={checkOut}
          defaultAdults={Number(adults)}
          defaultChildren={Number(children)}
        />
      </div>

      {isAvailabilitySearch && (
        <section className="mt-16" aria-labelledby="availability-heading">
          <div className="border-line flex flex-wrap items-baseline justify-between gap-3 border-b pb-4">
            <h2 id="availability-heading" className="font-serif text-2xl">
              Available rooms
            </h2>
            <p className="text-muted text-sm">
              {checkIn} → {checkOut}
              {nights > 0 && ` · ${nights} ${nights === 1 ? 'night' : 'nights'}`}
            </p>
          </div>

          {availabilityQuery.isLoading && <Spinner />}

          {availabilityQuery.isError && (
            <Alert variant="error" className="mt-6" title="We could not load availability">
              {availabilityQuery.error instanceof Error
                ? availabilityQuery.error.message
                : 'Please adjust your dates and try again.'}
            </Alert>
          )}

          {availabilityQuery.data && availabilityQuery.data.length === 0 && (
            <EmptyState
              className="mt-6"
              icon={<BedDouble />}
              title="No rooms for these dates"
              description="Every room is taken for this window. Try shifting your arrival by a day or two — or let our concierge know and we will watch for a cancellation."
              action={
                <Button variant="secondary" href="/#suites">
                  Browse the suites
                </Button>
              }
            />
          )}

          {availabilityQuery.data && availabilityQuery.data.length > 0 && (
            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {availabilityQuery.data.map((result, index) => (
                <article key={result.roomTypeId} className="group">
                  <div className="bg-brand-soft relative aspect-[4/3] overflow-hidden rounded-[4px]">
                    <Photo
                      src={photography.suites[index % photography.suites.length]}
                      alt={result.roomTypeName || 'Suite'}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="border-line mt-4 border-t pt-4">
                    <h3 className="font-serif text-xl leading-tight">
                      {result.roomTypeName || 'Room type'}
                    </h3>
                    <p className="text-muted mt-1 text-sm">
                      {result.availableRooms} room
                      {result.availableRooms !== 1 ? 's' : ''} available
                    </p>
                    {result.pricePerNight != null && (
                      <p className="text-muted tabular mt-3 text-xs">
                        {formatCurrency(result.pricePerNight, result.currency ?? 'USD')} / night
                      </p>
                    )}
                    {result.totalPrice != null && (
                      <p className="tabular mt-1 font-serif text-2xl leading-none">
                        {formatCurrency(result.totalPrice, result.currency ?? 'USD')}
                        <span className="text-muted font-sans text-xs"> total</span>
                      </p>
                    )}
                    <Button
                      href={`/book/${searchParams.get('slug') ?? ''}?roomTypeId=${result.roomTypeId}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`}
                      className="mt-5 w-full"
                      variant="secondary"
                    >
                      Reserve this room
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {isTextSearch && (
        <section className="mt-16" aria-labelledby="text-results-heading">
          <div className="border-line border-b pb-4">
            <h2 id="text-results-heading" className="font-serif text-2xl">
              Search results
            </h2>
          </div>

          {textSearchQuery.isLoading && (
            <div className="mt-8">
              <ResultSkeleton />
            </div>
          )}

          {textSearchQuery.isError && (
            <Alert variant="error" className="mt-6" title="Search failed">
              {textSearchQuery.error instanceof Error
                ? textSearchQuery.error.message
                : 'Please try a different word.'}
            </Alert>
          )}

          {textSearchQuery.data?.items && (
            <div className="mt-8">
              {textSearchQuery.data.items.length === 0 ? (
                <EmptyState
                  icon={<SearchIcon />}
                  title={`Nothing matched “${q}”`}
                  description="Try a city, a property name, or a style of stay. Or browse everything we have available."
                  action={
                    <Button variant="secondary" href="/search">
                      Clear search
                    </Button>
                  }
                />
              ) : (
                <PropertyCardGrid properties={textSearchQuery.data.items} />
              )}
            </div>
          )}
        </section>
      )}

      {!isAvailabilitySearch && !isTextSearch && (
        <div className="mt-16">
          <EmptyState
            icon={<SearchIcon />}
            title="Where would you like to rest?"
            description="Enter your dates above to see live availability. Or search by name, city, or the kind of stay you have in mind."
          />

          <form
            className="border-line bg-raised mx-auto mt-8 flex max-w-xl flex-col gap-3 rounded-[4px] border p-5 sm:flex-row sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              const fd = new FormData(event.currentTarget);
              const query = String(fd.get('q') ?? '').trim();
              if (query) {
                window.location.href = `/search?q=${encodeURIComponent(query)}`;
              }
            }}
          >
            <div className="flex-1">
              <label htmlFor="search-q" className="text-ink mb-2 block text-sm font-medium">
                Search by name or location
              </label>
              <Input
                id="search-q"
                name="q"
                type="search"
                placeholder="Search by name or location…"
                autoComplete="off"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <Container className="py-12 md:py-16">
      <Suspense
        fallback={
          <div className="flex justify-center py-24">
            <Spinner />
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </Container>
  );
}
