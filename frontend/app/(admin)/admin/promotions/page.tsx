'use client'

import { useQuery } from '@tanstack/react-query'
import { adminQueries } from '@/queries/admin.queries'
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
import { formatDate, getId } from '@/lib/utils'
import type { Promotion } from '@/types'

export default function AdminPromotionsPage() {
  const { data, isLoading, isError, error } = useQuery(adminQueries.promotions())

  if (isLoading) return <Spinner />

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Failed to load promotions'}
      </div>
    )
  }

  const promotions = data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
        <p className="text-sm text-gray-500">Discount codes and special offers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promotions ({promotions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <p className="text-sm text-gray-500">No promotions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo: Promotion) => (
                  <TableRow key={getId(promo)}>
                    <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                    <TableCell>{promo.name}</TableCell>
                    <TableCell>
                      {promo.discountType === 'percentage'
                        ? `${promo.discountValue}%`
                        : `$${promo.discountValue}`}
                    </TableCell>
                    <TableCell>
                      {promo.validFrom && promo.validTo
                        ? `${formatDate(promo.validFrom)} – ${formatDate(promo.validTo)}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {promo.usedCount ?? 0}
                      {promo.maxUses ? ` / ${promo.maxUses}` : ''}
                    </TableCell>
                    <TableCell>
                      <Badge variant={promo.isActive !== false ? 'success' : 'default'}>
                        {promo.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
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
