'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminPropertyMutations } from '@/features/admin/mutations';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';
import { getId } from '@/lib/utils';
import type { Property } from '@/types';

export default function NewPropertyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState('0');
  const [checkInTime, setCheckInTime] = useState('15:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');

  const createMutation = useMutation({
    ...adminPropertyMutations.create(),
    onSuccess: (result) => {
      toast.success('Property created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      router.push(`/admin/properties/${getId(result.data as Property)}`);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Create failed'),
  });

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title="Create a property"
        description="Start with the essentials. Rooms, images, and rates come next."
        backHref="/admin/properties"
        backLabel="Properties"
      />

      {createMutation.isError && (
        <Alert variant="error" className="mt-6">
          {createMutation.error instanceof Error
            ? createMutation.error.message
            : 'We could not create this property.'}
        </Alert>
      )}

      <form
        className="mt-10 max-w-2xl space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate({
            name,
            slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description,
            address: { city, country },
            settings: {
              timezone: 'UTC',
              currency,
              checkInTime,
              checkOutTime,
              taxRate: Number(taxRate),
            },
          });
        }}
      >
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated-from-name"
          />
          <p className="text-muted mt-1.5 text-xs">Used in the public URL.</p>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <fieldset className="border-line border-t pt-6">
          <legend className="text-brand mb-4 text-xs font-medium uppercase tracking-[0.16em]">
            Location
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
          </div>
        </fieldset>

        <fieldset className="border-line border-t pt-6">
          <legend className="text-brand mb-4 text-xs font-medium uppercase tracking-[0.16em]">
            Stay settings
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                maxLength={3}
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <Label htmlFor="taxRate">Tax rate %</Label>
              <Input
                id="taxRate"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="checkInTime">Check-in time</Label>
              <Input
                id="checkInTime"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="checkOutTime">Check-out time</Label>
              <Input
                id="checkOutTime"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={createMutation.isPending || !name}>
            {createMutation.isPending ? 'Creating…' : 'Create property'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/admin/properties')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  );
}
