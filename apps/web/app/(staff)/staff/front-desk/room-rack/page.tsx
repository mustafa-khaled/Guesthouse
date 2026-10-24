'use client';

import { useQuery } from '@tanstack/react-query';
import { DoorOpen } from 'lucide-react';
import { frontDeskQueries } from '@/queries/staff.queries';
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
import { RoomStatusBadge } from '@/components/shared/StatusBadge';
import Spinner from '@/components/Spinner';
import { getId, getRefLabel } from '@/lib/utils';

type RoomRackRow = Record<string, unknown>;

export default function RoomRackPage() {
  const { propertyId, setPropertyId, properties } = useSelectedProperty();
  const { data, isLoading, isError, error } = useQuery(frontDeskQueries.roomRack(propertyId));

  if (isLoading) return <Spinner />;

  const rows = (data ?? []) as RoomRackRow[];

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title="Room rack"
        description="Where every room stands right now — clean, occupied, out of order, or waiting for the floor team."
        backHref="/staff/front-desk"
        backLabel="Front desk"
        actions={
          properties.length > 1 ? (
            <div className="w-56">
              <Select
                aria-label="Selected property"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
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
        <Alert variant="error" className="mt-8" title="We could not load the room rack">
          {error instanceof Error ? error.message : 'Please refresh the page and try again.'}
        </Alert>
      )}

      <div className="mt-8">
        <div className="border-line flex flex-wrap items-baseline justify-between gap-3 border-b pb-3">
          <h2 className="font-serif text-xl leading-snug">All rooms</h2>
          <span className="text-muted tabular text-xs">{rows.length} rooms</span>
        </div>

        <div className="mt-6">
          {rows.length === 0 ? (
            <EmptyState
              icon={<DoorOpen />}
              title="No rooms to show"
              description="Add rooms to this property from the inventory screen and they will appear here."
              action={
                <Button href="/admin/properties" variant="secondary">
                  Manage properties
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={getId(row as { id?: string; _id?: string }) || String(row.number)}>
                    <TableCell className="text-ink font-medium">
                      {getRefLabel(row.room as never) ||
                        String(row.number ?? row.roomNumber ?? '—')}
                    </TableCell>
                    <TableCell className="text-muted">
                      {getRefLabel(row.roomType as never) || String(row.roomTypeName ?? '—')}
                    </TableCell>
                    <TableCell>
                      {row.status ? (
                        <RoomStatusBadge status={String(row.status) as 'dirty'} />
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-muted">
                      {getRefLabel(row.guest as never) || getRefLabel(row.guestId as never)}
                    </TableCell>
                    <TableCell className="text-muted">
                      {String(row.notes ?? row.housekeepingNotes ?? '—')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Container>
  );
}
