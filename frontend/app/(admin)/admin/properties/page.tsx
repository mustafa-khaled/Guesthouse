'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { adminQueries } from '@/queries/admin.queries'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import type { Property } from '@/types'

export default function AdminPropertiesPage() {
  const { data, isLoading, isError, error } = useQuery(adminQueries.properties())

  if (isLoading) return <Spinner />

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Failed to load properties'}
      </div>
    )
  }

  const properties = data?.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <p className="text-sm text-gray-500">Manage guesthouse listings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Properties ({properties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <p className="text-sm text-gray-500">No properties found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property: Property) => (
                  <TableRow key={getId(property)}>
                    <TableCell className="font-medium">{property.name}</TableCell>
                    <TableCell>
                      {[property.address?.city, property.address?.country]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </TableCell>
                    <TableCell>
                      {property.starRating ? `${property.starRating} ★` : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={property.isActive !== false ? 'success' : 'danger'}>
                        {property.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/properties/${getId(property)}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
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
