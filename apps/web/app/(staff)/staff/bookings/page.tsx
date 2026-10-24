'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import { bookingQueries } from '@/queries/bookings.queries';
import { useSelectedProperty } from '@/features/properties/use-selected-property';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BookingStatusBadge } from '@/components/shared/StatusBadge';
import Spinner from '@/components/Spinner';
import { formatCurrency, formatDate, getId, getRefLabel } from '@/lib/utils';
import type { Booking } from '@/types';

export default function StaffBookingsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const {
    propertyId,
    setPropertyId,
    properties,
    isLoading: propertiesLoading,
  } = useSelectedProperty();

  const { data, isLoading, isError, error, isFetching } = useQuery({
    ...bookingQueries.list({ propertyId, page: String(page), limit: String(limit) }),
    enabled: !!propertyId,
  });

  if (propertiesLoading || isLoading) return <Spinner />;

  const bookings = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title="Bookings"
        description="Every reservation on the books — arrivals, stays in progress, and the ones already closed out."
        actions={
          properties.length > 1 ? (
            <div className="w-56">
              <Select
                aria-label="Selected property"
                value={propertyId}
                onChange={(e) => {
                  setPropertyId(e.target.value);
                  setPage(1);
                }}
              >
                {properties.map((property) => (
                  <option key={getId(property)} value={getId(property)}>
                    {property.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : undefined
        }
      />

      {isError && (
        <Alert variant="error" className="mt-8" title="We could not load bookings">
          {error instanceof Error ? error.message : 'Please refresh the page and try again.'}
        </Alert>
      )}

      <div className="mt-8">
        <div className="border-line flex flex-wrap items-baseline justify-between gap-3 border-b pb-3">
          <h2 className="font-serif text-xl leading-snug">All bookings</h2>
          <span className="text-muted tabular text-xs">
            {pagination ? `${pagination.total} total` : `${bookings.length} shown`}
          </span>
        </div>

        <div className="mt-6">
          {bookings.length === 0 ? (
            <EmptyState
              icon={<CalendarDays />}
              title="No bookings yet"
              description="New reservations will appear here the moment they are created."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Confirmation</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking: Booking) => (
                    <TableRow key={getId(booking)}>
                      <TableCell>
                        <Link
                          href={`/staff/bookings/${getId(booking)}`}
                          className="focus-ring text-brand tabular text-sm underline-offset-4 hover:underline"
                        >
                          {booking.confirmationNumber || getId(booking).slice(-8)}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted">
                        {getRefLabel(booking.guestId as never)}
                      </TableCell>
                      <TableCell className="tabular">{formatDate(booking.checkIn)}</TableCell>
                      <TableCell className="tabular">{formatDate(booking.checkOut)}</TableCell>
                      <TableCell>
                        <BookingStatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell className="tabular text-right">
                        {booking.pricing?.total != null
                          ? formatCurrency(booking.pricing.total, booking.pricing.currency ?? 'USD')
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-muted tabular text-xs">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={!pagination.hasPrevPage || isFetching}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={!pagination.hasNextPage || isFetching}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
