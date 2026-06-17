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
import { RoomStatusBadge } from '@/components/shared/StatusBadge'
import Spinner from '@/components/Spinner'
import { getId, getRefLabel } from '@/lib/utils'

type RoomRackRow = Record<string, unknown>

export default function RoomRackPage() {
  const { data, isLoading, isError, error } = useQuery(frontDeskQueries.roomRack())

  if (isLoading) return <Spinner />

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Failed to load room rack'}
      </div>
    )
  }

  const rows = (data ?? []) as RoomRackRow[]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Room Rack</h1>
          <p className="text-sm text-gray-500">Current room status and assignments</p>
        </div>
        <Link href="/staff/front-desk">
          <Button variant="outline">Back to Front Desk</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rooms ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-gray-500">No room data available.</p>
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
                    <TableCell className="font-medium">
                      {getRefLabel(row.room as never) ||
                        String(row.number ?? row.roomNumber ?? '—')}
                    </TableCell>
                    <TableCell>
                      {getRefLabel(row.roomType as never) ||
                        String(row.roomTypeName ?? '—')}
                    </TableCell>
                    <TableCell>
                      {row.status ? (
                        <RoomStatusBadge status={String(row.status) as 'dirty'} />
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {getRefLabel(row.guest as never) ||
                        getRefLabel(row.guestId as never)}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {String(row.notes ?? row.housekeepingNotes ?? '—')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
