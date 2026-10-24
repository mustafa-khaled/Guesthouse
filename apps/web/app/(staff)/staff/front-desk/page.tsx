'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CalendarCheck, CalendarX, Users } from 'lucide-react';
import { frontDeskQueries, roomQueries } from '@/queries/staff.queries';
import { roomTypeQueries, ratePlanQueries } from '@/features/booking/queries';
import { useSelectedProperty } from '@/features/properties/use-selected-property';
import { clientFetch } from '@/lib/api/client';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { StatGrid } from '@/components/ui/stat-grid';
import { formatDate, getId, getRefLabel } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';

type BookingRow = Booking & Record<string, unknown>;

function BookingTable({
  title,
  icon,
  rows,
  emptyMessage,
}: {
  title: string;
  icon: React.ReactNode;
  rows: BookingRow[];
  emptyMessage: string;
}) {
  return (
    <section className="border-line border-t pt-6" aria-labelledby={`panel-${title}`}>
      <div className="flex items-center justify-between gap-3">
        <h2
          id={`panel-${title}`}
          className="flex items-center gap-2 font-serif text-xl leading-snug"
        >
          <span className="text-brand/60" aria-hidden>
            {icon}
          </span>
          {title}
        </h2>
        <span className="text-muted tabular text-xs">{rows.length}</span>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted mt-3 text-sm">{emptyMessage}</p>
      ) : (
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Confirmation</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={getId(row)}>
                  <TableCell>
                    <Link
                      href={`/staff/bookings/${getId(row)}`}
                      className="focus-ring text-brand text-sm underline-offset-4 hover:underline"
                    >
                      {row.confirmationNumber || getId(row).slice(-8)}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted">{getRefLabel(row.guestId as never)}</TableCell>
                  <TableCell className="tabular">{formatDate(row.checkIn)}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={row.status as BookingStatus} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

export default function FrontDeskPage() {
  const queryClient = useQueryClient();
  const { propertyId, setPropertyId, properties } = useSelectedProperty();
  const [walkIn, setWalkIn] = useState({
    roomTypeId: '',
    ratePlanId: '',
    roomId: '',
    nights: '1',
    firstName: '',
    lastName: '',
    email: '',
  });

  const dashboard = useQuery(frontDeskQueries.dashboard(propertyId));
  const arrivals = useQuery(frontDeskQueries.arrivals(propertyId));
  const departures = useQuery(frontDeskQueries.departures(propertyId));
  const inHouse = useQuery(frontDeskQueries.inHouse(propertyId));
  const roomTypes = useQuery(roomTypeQueries.byProperty(propertyId));
  const ratePlans = useQuery(ratePlanQueries.byRoomType(walkIn.roomTypeId));
  const rooms = useQuery(roomQueries.byProperty(propertyId));

  const walkInMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      clientFetch('/v1/front-desk/walk-in', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success('Walk-in created');
      queryClient.invalidateQueries({ queryKey: ['front-desk'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Walk-in failed'),
  });

  const isLoading =
    dashboard.isLoading || arrivals.isLoading || departures.isLoading || inHouse.isLoading;

  const error = dashboard.error || arrivals.error || departures.error || inHouse.error;

  if (isLoading) return <Spinner />;

  const stats = dashboard.data ?? {};
  const today = typeof stats.date === 'string' ? stats.date : null;

  const todayCounts = (stats.today ?? {}) as Record<string, unknown>;
  const housekeeping = (stats.housekeeping ?? {}) as Record<string, unknown>;
  const count = (value: unknown) => (typeof value === 'number' ? value : 0);

  const statItems = [
    { label: 'Arrivals today', value: count(todayCounts.arrivals) },
    { label: 'Departures today', value: count(todayCounts.departures) },
    { label: 'In house', value: count(todayCounts.inHouse) },
    {
      label: 'Rooms to clean',
      value: count(housekeeping.pending) + count(housekeeping.inProgress),
    },
  ];

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title="Front desk"
        description="Today at the house — who arrives, who leaves, and who is already settled in."
        actions={
          <>
            {properties.length > 1 && (
              <Select
                aria-label="Selected property"
                className="min-h-12 max-w-56"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
              >
                {properties.map((property) => (
                  <option key={getId(property)} value={getId(property)}>
                    {property.name}
                  </option>
                ))}
              </Select>
            )}
            <Button href="/staff/front-desk/room-rack" variant="secondary">
              Room rack
            </Button>
          </>
        }
      />

      {error && (
        <Alert variant="error" className="mt-8" title="We could not load the front desk">
          {error instanceof Error ? error.message : 'Please refresh the page and try again.'}
        </Alert>
      )}

      {today && <p className="text-muted tabular mt-8 text-xs">Today · {formatDate(today)}</p>}

      <StatGrid items={statItems} className="mt-3" />

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <BookingTable
          title="Arrivals"
          icon={<CalendarCheck className="h-4 w-4" strokeWidth={1.5} />}
          rows={(arrivals.data ?? []) as BookingRow[]}
          emptyMessage="No arrivals scheduled for today."
        />
        <BookingTable
          title="Departures"
          icon={<CalendarX className="h-4 w-4" strokeWidth={1.5} />}
          rows={(departures.data ?? []) as BookingRow[]}
          emptyMessage="No departures scheduled for today."
        />
      </div>

      <div className="mt-10">
        <BookingTable
          title="In-house guests"
          icon={<Users className="h-4 w-4" strokeWidth={1.5} />}
          rows={(inHouse.data ?? []) as BookingRow[]}
          emptyMessage="No guests currently in-house."
        />
      </div>

      <section className="border-line mt-12 border-t pt-6" aria-labelledby="walk-in-heading">
        <h2 id="walk-in-heading" className="font-serif text-xl leading-snug">
          Walk-in
        </h2>
        <p className="text-muted mt-1.5 text-sm leading-relaxed">
          Create a booking for a guest standing at the desk.
        </p>

        <div className="mt-6 grid max-w-2xl gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="walkInRoomType">Room type</Label>
            <Select
              id="walkInRoomType"
              value={walkIn.roomTypeId}
              onChange={(e) => setWalkIn((w) => ({ ...w, roomTypeId: e.target.value }))}
            >
              <option value="">Select</option>
              {(roomTypes.data ?? []).map((rt) => (
                <option key={getId(rt)} value={getId(rt)}>
                  {rt.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="walkInRatePlan">Rate plan</Label>
            <Select
              id="walkInRatePlan"
              value={walkIn.ratePlanId}
              onChange={(e) => setWalkIn((w) => ({ ...w, ratePlanId: e.target.value }))}
            >
              <option value="">Select</option>
              {(ratePlans.data ?? []).map((rp) => (
                <option key={getId(rp)} value={getId(rp)}>
                  {rp.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="walkInRoom">Room</Label>
            <Select
              id="walkInRoom"
              value={walkIn.roomId}
              onChange={(e) => setWalkIn((w) => ({ ...w, roomId: e.target.value }))}
            >
              <option value="">Select</option>
              {(rooms.data ?? []).map((room) => {
                const record = room as Record<string, unknown>;
                return (
                  <option
                    key={getId(room as { id?: string; _id?: string })}
                    value={getId(room as { id?: string; _id?: string })}
                  >
                    {String(record.roomNumber ?? record.number ?? '')}
                  </option>
                );
              })}
            </Select>
          </div>
          <div>
            <Label htmlFor="nights">Nights</Label>
            <Input
              id="nights"
              type="number"
              min={1}
              value={walkIn.nights}
              onChange={(e) => setWalkIn((w) => ({ ...w, nights: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="walkInFirst">First name</Label>
            <Input
              id="walkInFirst"
              autoComplete="given-name"
              value={walkIn.firstName}
              onChange={(e) => setWalkIn((w) => ({ ...w, firstName: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="walkInLast">Last name</Label>
            <Input
              id="walkInLast"
              autoComplete="family-name"
              value={walkIn.lastName}
              onChange={(e) => setWalkIn((w) => ({ ...w, lastName: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="walkInEmail">Email</Label>
            <Input
              id="walkInEmail"
              type="email"
              autoComplete="email"
              value={walkIn.email}
              onChange={(e) => setWalkIn((w) => ({ ...w, email: e.target.value }))}
            />
          </div>
        </div>

        {walkInMutation.isError && (
          <Alert variant="error" className="mt-5 max-w-2xl">
            {walkInMutation.error instanceof Error
              ? walkInMutation.error.message
              : 'Could not create the walk-in.'}
          </Alert>
        )}

        <Button
          className="mt-6"
          disabled={walkInMutation.isPending || !propertyId}
          onClick={() =>
            walkInMutation.mutate({
              propertyId,
              roomTypeId: walkIn.roomTypeId,
              ratePlanId: walkIn.ratePlanId,
              roomId: walkIn.roomId,
              nights: Number(walkIn.nights),
              adults: 1,
              guest: {
                firstName: walkIn.firstName,
                lastName: walkIn.lastName,
                email: walkIn.email,
              },
            })
          }
        >
          {walkInMutation.isPending ? 'Creating…' : 'Create walk-in'}
        </Button>
      </section>
    </Container>
  );
}
