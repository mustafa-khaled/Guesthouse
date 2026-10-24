'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { bookingQueries } from '@/queries/bookings.queries';
import { AccountNav } from '@/components/shared/account-nav';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getId } from '@/lib/utils';
import type { Property } from '@/types';

function getPropertyName(propertyId: unknown): string {
  if (typeof propertyId === 'string') return 'Property';
  if (propertyId && typeof propertyId === 'object' && 'name' in propertyId) {
    return String((propertyId as Property).name);
  }
  return 'Property';
}

function BookingRowSkeleton() {
  return (
    <div className="border-line border-b py-6">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-3 h-3 w-56" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}

export default function MyBookingsPage() {
  const { data: bookings, isLoading, isError } = useQuery(bookingQueries.mine());

  return (
    <Container className="py-12 md:py-16">
      <PageHeader
        folio="—"
        title="My bookings"
        description="Every stay you have planned or lived with us, in one quiet place."
        backHref="/account"
        backLabel="Account"
        actions={
          <Button href="/search" variant="secondary">
            Book another stay
          </Button>
        }
      />

      <div className="mt-6">
        <AccountNav />
      </div>

      <div className="mt-10">
        {isLoading && (
          <div>
            {Array.from({ length: 3 }).map((_, index) => (
              <BookingRowSkeleton key={index} />
            ))}
          </div>
        )}

        {isError && (
          <Alert variant="error" title="We could not load your bookings">
            Please refresh the page. If it keeps happening, contact the concierge and we will look
            it up for you.
          </Alert>
        )}

        {bookings && bookings.length === 0 && (
          <EmptyState
            icon={<CalendarDays />}
            title="No stays yet"
            description="When you book a room, it will appear here with everything you need for arrival."
            action={<Button href="/search">Find a stay</Button>}
          />
        )}

        {bookings && bookings.length > 0 && (
          <ul className="border-line border-t">
            {bookings.map((booking) => {
              const id = getId(booking);

              return (
                <li key={id} className="border-line border-b">
                  <Link
                    href={`/account/bookings/${id}`}
                    className="focus-ring group flex flex-col gap-3 py-6 transition-colors duration-200 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-muted tabular text-xs">
                          {booking.confirmationNumber || id}
                        </span>
                        <BookingStatusBadge status={booking.status} />
                      </div>

                      <p className="mt-2 font-serif text-xl leading-snug">
                        {getPropertyName(booking.propertyId)}
                      </p>

                      <p className="text-muted mt-1 text-sm">
                        {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)} ·{' '}
                        {booking.adults} guest{booking.adults !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {booking.pricing?.total != null && (
                        <span className="tabular font-serif text-xl leading-none">
                          {booking.pricing.total.toLocaleString(undefined, {
                            style: 'currency',
                            currency: booking.pricing.currency ?? 'USD',
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      )}
                      <ArrowUpRight
                        aria-hidden
                        className="text-brand/50 group-hover:text-brand h-4 w-4 shrink-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        strokeWidth={1.5}
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Container>
  );
}
