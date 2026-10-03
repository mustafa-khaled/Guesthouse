'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminQueries } from '@/queries/admin.queries';
import { promotionMutations } from '@/features/admin/mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Spinner from '@/components/Spinner';
import { formatDate, getId } from '@/lib/utils';
import type { Promotion } from '@/types';

export default function AdminPromotionsPage() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [discountValue, setDiscountValue] = useState('10');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');

  const { data, isLoading, isError, error } = useQuery(adminQueries.promotions());

  const createMutation = useMutation({
    ...promotionMutations.create(),
    onSuccess: () => {
      toast.success('Promotion created');
      setCode('');
      setName('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Create failed'),
  });

  const updateMutation = useMutation({
    ...promotionMutations.update(),
    onSuccess: () => {
      toast.success('Promotion updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'promotions'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Update failed'),
  });

  if (isLoading) return <Spinner />;

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Failed to load promotions'}
      </div>
    );
  }

  const promotions = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
        <p className="text-sm text-gray-500">Discount codes and special offers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create promotion</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="promoCode">Code</Label>
            <Input id="promoCode" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="promoName">Name</Label>
            <Input id="promoName" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="discountValue">Percent off</Label>
            <Input
              id="discountValue"
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="validFrom">Valid from</Label>
            <Input
              id="validFrom"
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="validTo">Valid to</Label>
            <Input
              id="validTo"
              type="date"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              disabled={!code || !name || !validFrom || !validTo || createMutation.isPending}
              onClick={() =>
                createMutation.mutate({
                  code,
                  name,
                  discountType: 'percentage',
                  discountValue: Number(discountValue),
                  conditions: { validFrom, validTo },
                })
              }
            >
              Create promotion
            </Button>
          </div>
        </CardContent>
      </Card>

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
                  <TableHead></TableHead>
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
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateMutation.mutate({
                            id: getId(promo),
                            body: { isActive: promo.isActive === false },
                          })
                        }
                      >
                        {promo.isActive === false ? 'Activate' : 'Deactivate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
