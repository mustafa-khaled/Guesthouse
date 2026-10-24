'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Ticket } from 'lucide-react';
import { adminQueries } from '@/queries/admin.queries';
import { promotionMutations } from '@/features/admin/mutations';
import { useSelectedProperty } from '@/features/properties/use-selected-property';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
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
import Spinner from '@/components/Spinner';
import { formatDate, getId } from '@/lib/utils';
import type { Promotion } from '@/types';

export default function AdminPromotionsPage() {
  const queryClient = useQueryClient();
  const {
    propertyId,
    setPropertyId,
    properties,
    isLoading: propertiesLoading,
  } = useSelectedProperty();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [discountValue, setDiscountValue] = useState('10');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');

  const { data, isLoading, isError, error } = useQuery(adminQueries.promotions(propertyId));

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

  if (propertiesLoading || isLoading) return <Spinner />;

  const promotions = data ?? [];

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title="Promotions"
        description="Discount codes and seasonal offers. Create one here, then share the code with guests."
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
        <Alert variant="error" className="mt-8" title="We could not load promotions">
          {error instanceof Error ? error.message : 'Please refresh the page and try again.'}
        </Alert>
      )}

      <section className="border-line mt-10 border-t pt-6" aria-labelledby="create-promo">
        <h2 id="create-promo" className="font-serif text-xl leading-snug">
          Create a promotion
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label htmlFor="promoCode">Code</Label>
            <Input
              id="promoCode"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SPRING"
            />
          </div>
          <div>
            <Label htmlFor="promoName">Name</Label>
            <Input
              id="promoName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Spring escape"
            />
          </div>
          <div>
            <Label htmlFor="discountValue">Percent off</Label>
            <Input
              id="discountValue"
              type="number"
              min={1}
              max={100}
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
        </div>

        <Button
          className="mt-5"
          disabled={!code || !name || !validFrom || !validTo || createMutation.isPending}
          onClick={() =>
            createMutation.mutate({
              propertyId,
              code,
              name,
              discountType: 'percentage',
              discountValue: Number(discountValue),
              conditions: { validFrom, validTo },
            })
          }
        >
          {createMutation.isPending ? 'Creating…' : 'Create promotion'}
        </Button>
      </section>

      <section className="mt-10" aria-labelledby="promo-list">
        <div className="border-line flex items-baseline justify-between gap-3 border-b pb-3">
          <h2 id="promo-list" className="font-serif text-xl leading-snug">
            All promotions
          </h2>
          <span className="text-muted tabular text-xs">{promotions.length} total</span>
        </div>

        <div className="mt-6">
          {promotions.length === 0 ? (
            <EmptyState
              icon={<Ticket />}
              title="No promotions yet"
              description="Create a code above and it will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Valid period</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo: Promotion) => (
                  <TableRow key={getId(promo)}>
                    <TableCell className="text-ink font-mono text-xs font-medium">
                      {promo.code}
                    </TableCell>
                    <TableCell>{promo.name}</TableCell>
                    <TableCell className="tabular">
                      {promo.discountType === 'percentage'
                        ? `${promo.discountValue}%`
                        : `$${promo.discountValue}`}
                    </TableCell>
                    <TableCell className="text-muted tabular text-xs">
                      {promo.validFrom && promo.validTo
                        ? `${formatDate(promo.validFrom)} – ${formatDate(promo.validTo)}`
                        : '—'}
                    </TableCell>
                    <TableCell className="tabular">
                      {promo.usedCount ?? 0}
                      {promo.maxUses ? ` / ${promo.maxUses}` : ''}
                    </TableCell>
                    <TableCell>
                      <Badge variant={promo.isActive !== false ? 'success' : 'default'} dot>
                        {promo.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updateMutation.isPending}
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
        </div>
      </section>
    </Container>
  );
}
