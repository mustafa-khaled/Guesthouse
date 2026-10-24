'use client';

import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard } from 'lucide-react';
import { adminQueries } from '@/queries/admin.queries';
import { Alert } from '@/components/ui/alert';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatGrid } from '@/components/ui/stat-grid';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Spinner from '@/components/Spinner';
import { formatCurrency } from '@/lib/utils';

interface ManagerDashboard {
  period?: { start?: string; end?: string };
  bookings?: { total?: number; confirmed?: number; cancelled?: number; conversionRate?: number };
  revenue?: number;
  occupancy?: number;
  topRoomTypes?: { name?: string; bookings?: number; revenue?: number }[];
  bookingsBySource?: { source?: string; count?: number; revenue?: number }[];
}

function formatPeriod(start?: string) {
  if (!start) return null;
  const date = new Date(start);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error } = useQuery(adminQueries.managerDashboard());

  if (isLoading) return <Spinner />;

  const dashboard = (data ?? {}) as ManagerDashboard;
  const bookings = dashboard.bookings ?? {};
  const period = formatPeriod(dashboard.period?.start);
  const roomTypes = dashboard.topRoomTypes ?? [];
  const sources = dashboard.bookingsBySource ?? [];

  const statItems = [
    { label: 'Bookings', value: bookings.total ?? 0 },
    { label: 'Confirmed', value: bookings.confirmed ?? 0 },
    { label: 'Cancelled', value: bookings.cancelled ?? 0 },
    { label: 'Conversion', value: `${bookings.conversionRate ?? 0}%` },
    { label: 'Revenue', value: formatCurrency(dashboard.revenue ?? 0) },
    { label: 'Occupancy', value: `${dashboard.occupancy ?? 0}%` },
  ];

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title="Manager dashboard"
        description="A quiet read on how the house is performing — occupancy, revenue, and the shape of the month."
      />

      {isError && (
        <Alert variant="error" className="mt-8" title="We could not load the dashboard">
          {error instanceof Error ? error.message : 'Please refresh the page and try again.'}
        </Alert>
      )}

      {!isError && !data && (
        <EmptyState
          className="mt-10"
          icon={<LayoutDashboard />}
          title="No metrics yet"
          description="Once bookings start arriving, the key numbers will appear here."
        />
      )}

      {!isError && data && (
        <>
          {period && <p className="text-muted tabular mt-8 text-xs">{period}</p>}

          <StatGrid items={statItems} columns={3} className="mt-3" />

          <section className="mt-12" aria-labelledby="top-room-types">
            <h2 id="top-room-types" className="font-serif text-xl leading-snug">
              Top room types
            </h2>
            <p className="text-muted mt-1.5 text-sm leading-relaxed">
              Where this month&apos;s revenue is coming from.
            </p>

            {roomTypes.length === 0 ? (
              <p className="text-muted border-line mt-5 border-t pt-5 text-sm">
                No room revenue booked yet this month.
              </p>
            ) : (
              <Table className="mt-5">
                <TableHeader>
                  <TableRow>
                    <TableHead>Room type</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomTypes.map((roomType) => (
                    <TableRow key={roomType.name}>
                      <TableCell>{roomType.name ?? 'Unnamed room type'}</TableCell>
                      <TableCell className="text-right">{roomType.bookings ?? 0}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(roomType.revenue ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>

          <section className="mt-12" aria-labelledby="bookings-by-source">
            <h2 id="bookings-by-source" className="font-serif text-xl leading-snug">
              Bookings by source
            </h2>
            <p className="text-muted mt-1.5 text-sm leading-relaxed">
              Which channels guests are arriving through.
            </p>

            {sources.length === 0 ? (
              <p className="text-muted border-line mt-5 border-t pt-5 text-sm">
                No bookings recorded yet this month.
              </p>
            ) : (
              <Table className="mt-5">
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.map((source) => (
                    <TableRow key={source.source ?? 'unknown'}>
                      <TableCell className="capitalize">{source.source ?? 'Unknown'}</TableCell>
                      <TableCell className="text-right">{source.count ?? 0}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(source.revenue ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </>
      )}
    </Container>
  );
}
