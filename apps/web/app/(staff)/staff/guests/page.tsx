'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { guestQueries } from '@/queries/bookings.queries';
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
import Spinner from '@/components/Spinner';
import { getId } from '@/lib/utils';
import type { Guest } from '@/types';

export default function StaffGuestsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const {
    propertyId,
    setPropertyId,
    properties,
    isLoading: propertiesLoading,
  } = useSelectedProperty();

  const { data, isLoading, isError, error, isFetching } = useQuery({
    ...guestQueries.list({ propertyId, page: String(page), limit: String(limit) }),
    enabled: !!propertyId,
  });

  if (propertiesLoading || isLoading) return <Spinner />;

  const guests = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title="Guests"
        description="The directory of everyone who has stayed with us — contact details and history."
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
        <Alert variant="error" className="mt-8" title="We could not load guests">
          {error instanceof Error ? error.message : 'Please refresh the page and try again.'}
        </Alert>
      )}

      <div className="mt-8">
        <div className="border-line flex flex-wrap items-baseline justify-between gap-3 border-b pb-3">
          <h2 className="font-serif text-xl leading-snug">All guests</h2>
          <span className="text-muted tabular text-xs">
            {pagination ? `${pagination.total} total` : `${guests.length} shown`}
          </span>
        </div>

        <div className="mt-6">
          {guests.length === 0 ? (
            <EmptyState
              icon={<Users />}
              title="No guests yet"
              description="Guest profiles appear here once a reservation is made."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Stays</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest: Guest) => (
                    <TableRow key={getId(guest)}>
                      <TableCell>
                        <Link
                          href={`/staff/guests/${getId(guest)}`}
                          className="focus-ring text-brand text-sm underline-offset-4 hover:underline"
                        >
                          {guest.firstName} {guest.lastName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted">{guest.email}</TableCell>
                      <TableCell className="text-muted tabular">{guest.phone || '—'}</TableCell>
                      <TableCell className="tabular text-right">
                        {guest.stats?.totalStays ?? '—'}
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
