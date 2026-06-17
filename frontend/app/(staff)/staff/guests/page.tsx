'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { guestQueries } from '@/queries/bookings.queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Spinner from '@/components/Spinner'
import { getId } from '@/lib/utils'
import type { Guest } from '@/types'

export default function StaffGuestsPage() {
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, isError, error, isFetching } = useQuery(
    guestQueries.list({ page: String(page), limit: String(limit) }),
  )

  if (isLoading) return <Spinner />

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Failed to load guests'}
      </div>
    )
  }

  const guests = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
        <p className="text-sm text-gray-500">Guest directory and profiles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            All Guests
            {pagination ? ` (${pagination.total})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {guests.length === 0 ? (
            <p className="text-sm text-gray-500">No guests found.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Stays</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest: Guest) => (
                    <TableRow key={getId(guest)}>
                      <TableCell>
                        <Link
                          href={`/staff/guests/${getId(guest)}`}
                          className="font-medium text-green-700 hover:underline"
                        >
                          {guest.firstName} {guest.lastName}
                        </Link>
                      </TableCell>
                      <TableCell>{guest.email}</TableCell>
                      <TableCell>{guest.phone || '—'}</TableCell>
                      <TableCell>{guest.stats?.totalStays ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrevPage || isFetching}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
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
        </CardContent>
      </Card>
    </div>
  )
}
