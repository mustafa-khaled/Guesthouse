'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { frontDeskQueries, roomQueries } from '@/queries/staff.queries';
import { roomTypeQueries, ratePlanQueries } from '@/features/booking/queries';
import { useSelectedProperty } from '@/features/staff/use-selected-property';
import { clientFetch } from '@/lib/api/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { formatDate, getId, getRefLabel } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';

type BookingRow = Booking & Record<string, unknown>;

function BookingTable({
  title,
  rows,
  emptyMessage,
}: {
  title: string;
  rows: BookingRow[];
  emptyMessage: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        ) : (
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
                      className="font-medium text-green-700 hover:underline"
                    >
                      {row.confirmationNumber || getId(row).slice(-8)}
                    </Link>
                  </TableCell>
                  <TableCell>{getRefLabel(row.guestId as never)}</TableCell>
                  <TableCell>{formatDate(row.checkIn)}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={row.status as BookingStatus} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
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

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Failed to load front desk data'}
      </div>
    );
  }

  const stats = dashboard.data ?? {};
  const statEntries = Object.entries(stats).filter(
    ([, value]) => typeof value === 'number' || typeof value === 'string',
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Front Desk</h1>
          <p className="text-sm text-gray-500">Today&apos;s operations overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="h-10 rounded-md border border-gray-300 px-3 text-sm"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
          >
            {properties.map((property) => (
              <option key={getId(property)} value={getId(property)}>
                {property.name}
              </option>
            ))}
          </select>
          <Link href="/staff/front-desk/room-rack">
            <Button variant="outline">Room Rack</Button>
          </Link>
        </div>
      </div>

      {statEntries.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statEntries.slice(0, 8).map(([key, value]) => (
            <Card key={key}>
              <CardContent className="pt-6">
                <p className="text-sm capitalize text-gray-500">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{String(value)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <BookingTable
          title="Arrivals"
          rows={(arrivals.data ?? []) as BookingRow[]}
          emptyMessage="No arrivals scheduled for today."
        />
        <BookingTable
          title="Departures"
          rows={(departures.data ?? []) as BookingRow[]}
          emptyMessage="No departures scheduled for today."
        />
      </div>

      <BookingTable
        title="In-House Guests"
        rows={(inHouse.data ?? []) as BookingRow[]}
        emptyMessage="No guests currently in-house."
      />

      <Card>
        <CardHeader>
          <CardTitle>Walk-in</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Room type</Label>
            <select
              className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
              value={walkIn.roomTypeId}
              onChange={(e) => setWalkIn((w) => ({ ...w, roomTypeId: e.target.value }))}
            >
              <option value="">Select</option>
              {(roomTypes.data ?? []).map((rt) => (
                <option key={getId(rt)} value={getId(rt)}>
                  {rt.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Rate plan</Label>
            <select
              className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
              value={walkIn.ratePlanId}
              onChange={(e) => setWalkIn((w) => ({ ...w, ratePlanId: e.target.value }))}
            >
              <option value="">Select</option>
              {(ratePlans.data ?? []).map((rp) => (
                <option key={getId(rp)} value={getId(rp)}>
                  {rp.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Room</Label>
            <select
              className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
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
            </select>
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
          <Input
            placeholder="First name"
            value={walkIn.firstName}
            onChange={(e) => setWalkIn((w) => ({ ...w, firstName: e.target.value }))}
          />
          <Input
            placeholder="Last name"
            value={walkIn.lastName}
            onChange={(e) => setWalkIn((w) => ({ ...w, lastName: e.target.value }))}
          />
          <Input
            placeholder="Email"
            type="email"
            value={walkIn.email}
            onChange={(e) => setWalkIn((w) => ({ ...w, email: e.target.value }))}
          />
          <Button
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
            Create walk-in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
