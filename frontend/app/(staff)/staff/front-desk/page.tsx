'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { frontDeskQueries } from '@/queries/staff.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BookingStatusBadge } from '@/components/shared/StatusBadge'
import Spinner from '@/components/Spinner'
import { formatDate, getId, getRefLabel } from '@/lib/utils'
import type { Booking, BookingStatus } from '@/types'

type BookingRow = Booking & Record<string, unknown>

function BookingTable({
  title,
  rows,
  emptyMessage,
}: {
  title: string
  rows: BookingRow[]
  emptyMessage: string
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
  )
}

export default function FrontDeskPage() {
  const dashboard = useQuery(frontDeskQueries.dashboard())
  const arrivals = useQuery(frontDeskQueries.arrivals())
  const departures = useQuery(frontDeskQueries.departures())
  const inHouse = useQuery(frontDeskQueries.inHouse())

  const isLoading =
    dashboard.isLoading ||
    arrivals.isLoading ||
    departures.isLoading ||
    inHouse.isLoading

  const error =
    dashboard.error || arrivals.error || departures.error || inHouse.error

  if (isLoading) return <Spinner />

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Failed to load front desk data'}
      </div>
    )
  }

  const stats = dashboard.data ?? {}
  const statEntries = Object.entries(stats).filter(
    ([, value]) => typeof value === 'number' || typeof value === 'string',
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Front Desk</h1>
          <p className="text-sm text-gray-500">Today&apos;s operations overview</p>
        </div>
        <Link href="/staff/front-desk/room-rack">
          <Button variant="outline">Room Rack</Button>
        </Link>
      </div>

      {statEntries.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statEntries.slice(0, 8).map(([key, value]) => (
            <Card key={key}>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 capitalize">
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
    </div>
  )
}
